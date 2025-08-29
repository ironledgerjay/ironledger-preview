import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthService } from '../services/authService';
import { EmailService } from '../services/emailService';
import { authenticate, requireEmailVerification } from '../middleware/auth';
import { db } from '../storage';
import { users, doctors, patients } from '@shared/schema';
import { eq } from 'drizzle-orm';
import rateLimit from 'express-rate-limit';
import { Issuer, generators } from 'openid-client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const router = Router();

// Rate limiting for authentication routes
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: { error: 'Too many authentication attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const passwordResetRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 password reset attempts per hour
  message: { error: 'Too many password reset attempts, please try again later' },
});

// Validation middleware
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('role').isIn(['patient', 'doctor']).withMessage('Role must be patient or doctor'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Social OAuth: Google
router.get('/google', async (req, res) => {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.FRONTEND_URL || 'http://localhost:5000'}/api/auth/google/callback`;
    if (!clientId || !clientSecret) return res.status(400).json({ error: 'Google OAuth not configured' });

    const googleIssuer = await Issuer.discover('https://accounts.google.com');
    const client = new googleIssuer.Client({ client_id: clientId, client_secret: clientSecret, redirect_uris: [redirectUri], response_types: ['code'] });

    const state = generators.state();
    const nonce = generators.nonce();
    const authorizationUrl = client.authorizationUrl({
      scope: 'openid email profile',
      state,
      nonce,
      redirect_uri: redirectUri,
    });
    (req.session as any).oauthState = state;
    res.redirect(authorizationUrl);
  } catch (e) {
    console.error('Google OAuth init error:', e);
    res.status(500).json({ error: 'Failed to start Google OAuth' });
  }
});

router.get('/google/callback', async (req, res) => {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.FRONTEND_URL || 'http://localhost:5000'}/api/auth/google/callback`;
    if (!clientId || !clientSecret) return res.status(400).send('Google OAuth not configured');

    const googleIssuer = await Issuer.discover('https://accounts.google.com');
    const client = new googleIssuer.Client({ client_id: clientId, client_secret: clientSecret, redirect_uris: [redirectUri], response_types: ['code'] });

    const params = client.callbackParams(req);
    const tokenSet = await client.callback(redirectUri, params, { state: (req.session as any).oauthState });
    const userinfo: any = tokenSet.claims();
    const email = userinfo.email;
    const firstName = userinfo.given_name || 'User';
    const lastName = userinfo.family_name || 'Google';

    if (!email) return res.status(400).send('No email returned from Google');

    const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    let user = existing;
    if (!user) {
      const passwordHash = await bcrypt.hash(generators.random(16), 12);
      const inserted = await db.insert(users).values({ email, passwordHash, role: 'patient', isEmailVerified: true }).returning();
      user = inserted[0];
    }

    const tokens = await AuthService.generateTokens(user.id, req.headers['user-agent'], req.ip);
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    const redirectTo = `${process.env.FRONTEND_URL || ''}/login-new?accessToken=${encodeURIComponent(tokens.accessToken)}&role=${encodeURIComponent(user.role)}` || '/login-new';
    res.redirect(redirectTo);
  } catch (e) {
    console.error('Google OAuth callback error:', e);
    res.status(500).send('Google OAuth failed');
  }
});

// Social OAuth: Facebook
router.get('/facebook', (req, res) => {
  const clientId = process.env.FACEBOOK_CLIENT_ID;
  const redirectUri = process.env.FACEBOOK_REDIRECT_URI || `${process.env.FRONTEND_URL || 'http://localhost:5000'}/api/auth/facebook/callback`;
  if (!clientId) return res.status(400).json({ error: 'Facebook OAuth not configured' });
  const state = crypto.randomBytes(16).toString('hex');
  (req.session as any).oauthState = state;
  const url = new URL('https://www.facebook.com/v18.0/dialog/oauth');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('state', state);
  url.searchParams.set('scope', 'email,public_profile');
  res.redirect(url.toString());
});

router.get('/facebook/callback', async (req, res) => {
  try {
    const code = req.query.code as string;
    const state = req.query.state as string;
    const expected = (req.session as any).oauthState;
    if (!code || !state || state !== expected) return res.status(400).send('Invalid state');

    const clientId = process.env.FACEBOOK_CLIENT_ID!;
    const clientSecret = process.env.FACEBOOK_CLIENT_SECRET!;
    const redirectUri = process.env.FACEBOOK_REDIRECT_URI || `${process.env.FRONTEND_URL || 'http://localhost:5000'}/api/auth/facebook/callback`;

    const tokenRes = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${encodeURIComponent(clientSecret)}&code=${encodeURIComponent(code)}`);
    const tokenJson: any = await tokenRes.json();
    if (!tokenJson.access_token) return res.status(400).send('Facebook token exchange failed');

    const meRes = await fetch('https://graph.facebook.com/me?fields=id,name,email', {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` },
    });
    const me: any = await meRes.json();
    const email = me.email;
    const name = (me.name || 'Facebook User').split(' ');
    const firstName = name[0] || 'User';
    const lastName = name.slice(1).join(' ') || 'Facebook';
    if (!email) return res.status(400).send('No email returned from Facebook');

    const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    let user = existing;
    if (!user) {
      const passwordHash = await bcrypt.hash(generators.random(16), 12);
      const inserted = await db.insert(users).values({ email, passwordHash, role: 'patient', isEmailVerified: true }).returning();
      user = inserted[0];
    }

    const tokens = await AuthService.generateTokens(user.id, req.headers['user-agent'], req.ip);
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    const redirectTo = `${process.env.FRONTEND_URL || ''}/login-new?accessToken=${encodeURIComponent(tokens.accessToken)}&role=${encodeURIComponent(user.role)}` || '/login-new';
    res.redirect(redirectTo);
  } catch (e) {
    console.error('Facebook OAuth callback error:', e);
    res.status(500).send('Facebook OAuth failed');
  }
});

// Register endpoint
router.post('/register', authRateLimit, registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, role, ...additionalData } = req.body;

    // Check if user already exists
    const [existingUser] = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Create user
    const user = await AuthService.register({
      email,
      passwordHash: password, // Will be hashed in the service
      role,
    });

    // Generate email verification token
    const verificationToken = await AuthService.generateEmailVerificationToken(user.id);

    // Send verification email
    await EmailService.sendEmailVerification(email, verificationToken);

    // Create profile based on role
    if (role === 'patient') {
      await db.insert(patients).values({
        userId: user.id,
        firstName: additionalData.firstName || '',
        lastName: additionalData.lastName || '',
        phone: additionalData.phone || null,
        province: additionalData.province || null,
      });
    } else if (role === 'doctor') {
      await db.insert(doctors).values({
        userId: user.id,
        firstName: additionalData.firstName || '',
        lastName: additionalData.lastName || '',
        specialty: additionalData.specialty || '',
        hpcsaNumber: additionalData.hpcsaNumber || '',
        phone: additionalData.phone || '',
        province: additionalData.province || '',
        city: additionalData.city || '',
        zipCode: additionalData.zipCode || null,
        practiceAddress: additionalData.practiceAddress || null,
        qualifications: additionalData.qualifications || null,
        experience: additionalData.experience || null,
        consultationFee: additionalData.consultationFee || null,
        verificationStatus: 'pending',
      });
    }

    res.status(201).json({
      message: 'Registration successful. Please check your email to verify your account.',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login endpoint
router.post('/login', authRateLimit, loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, twoFactorToken } = req.body;
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip;

    const result = await AuthService.login(email, password, userAgent, ipAddress);
    
    if (!result) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { user, tokens, requiresTwoFactor } = result;

    // Check email verification
    if (!user.isEmailVerified) {
      return res.status(403).json({ 
        error: 'Email verification required',
        code: 'EMAIL_NOT_VERIFIED'
      });
    }

    // Handle 2FA if required
    if (requiresTwoFactor) {
      if (!twoFactorToken) {
        return res.status(403).json({
          error: 'Two-factor authentication required',
          code: '2FA_REQUIRED'
        });
      }

      const valid2FA = await AuthService.verify2FA(user.id, twoFactorToken);
      if (!valid2FA) {
        return res.status(401).json({ error: 'Invalid two-factor authentication code' });
      }
    }

    // Set secure HTTP-only cookie for refresh token
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isTwoFactorEnabled: user.isTwoFactorEnabled,
      },
      accessToken: tokens.accessToken,
      expiresAt: tokens.expiresAt,
    });
  } catch (error) {
    console.error('Login error:', error);
    if (error instanceof Error && error.message.includes('locked')) {
      return res.status(423).json({ error: error.message });
    }
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout endpoint
router.post('/logout', authenticate, async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (refreshToken) {
      await AuthService.revokeSession(refreshToken);
    }

    res.clearCookie('refreshToken');
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Email verification endpoint
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    const verified = await AuthService.verifyEmail(token);
    
    if (!verified) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Email verification failed' });
  }
});

// Resend email verification
router.post('/resend-verification', authRateLimit, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const [user] = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }

    const verificationToken = await AuthService.generateEmailVerificationToken(user.id);
    await EmailService.sendEmailVerification(email, verificationToken);

    res.json({ message: 'Verification email sent' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Failed to send verification email' });
  }
});

// Request password reset
router.post('/forgot-password', passwordResetRateLimit, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const token = await AuthService.generatePasswordResetToken(email);
    
    if (token) {
      await EmailService.sendPasswordReset(email, token);
    }

    // Always return success to prevent email enumeration
    res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ error: 'Password reset request failed' });
  }
});

// Reset password
router.post('/reset-password', authRateLimit, [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token, password } = req.body;

    const success = await AuthService.resetPassword(token, password);
    
    if (!success) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Password reset failed' });
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    const [user] = await db.select({
      id: users.id,
      email: users.email,
      role: users.role,
      isEmailVerified: users.isEmailVerified,
      isTwoFactorEnabled: users.isTwoFactorEnabled,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, req.user!.id))
    .limit(1);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user information' });
  }
});

// Generate 2FA secret
router.post('/2fa/generate', authenticate, requireEmailVerification, async (req, res) => {
  try {
    const result = await AuthService.generate2FASecret(req.user!.id, req.user!.email);
    
    res.json({
      secret: result.secret,
      qrCode: result.qrCodeUrl,
    });
  } catch (error) {
    console.error('2FA generation error:', error);
    res.status(500).json({ error: 'Failed to generate 2FA secret' });
  }
});

// Enable 2FA
router.post('/2fa/enable', authenticate, requireEmailVerification, [
  body('token').notEmpty().withMessage('2FA token is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token } = req.body;

    const success = await AuthService.enable2FA(req.user!.id, token);
    
    if (!success) {
      return res.status(400).json({ error: 'Invalid 2FA token' });
    }

    res.json({ message: 'Two-factor authentication enabled successfully' });
  } catch (error) {
    console.error('2FA enable error:', error);
    res.status(500).json({ error: 'Failed to enable 2FA' });
  }
});

// Disable 2FA
router.post('/2fa/disable', authenticate, requireEmailVerification, [
  body('token').notEmpty().withMessage('2FA token is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token } = req.body;

    const success = await AuthService.disable2FA(req.user!.id, token);
    
    if (!success) {
      return res.status(400).json({ error: 'Invalid 2FA token' });
    }

    res.json({ message: 'Two-factor authentication disabled successfully' });
  } catch (error) {
    console.error('2FA disable error:', error);
    res.status(500).json({ error: 'Failed to disable 2FA' });
  }
});

export default router;
