import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { db } from '../storage';
import { users, userSessions } from '@shared/schema';
import { eq, and, lt } from 'drizzle-orm';
import type { User, InsertUser, InsertUserSession } from '@shared/schema';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-development';
const JWT_EXPIRES_IN = '24h';
const PASSWORD_SALT_ROUNDS = 12;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 2 * 60 * 60 * 1000; // 2 hours

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export interface LoginResult {
  user: User;
  tokens: AuthTokens;
  requiresTwoFactor?: boolean;
}

export class AuthService {
  // Hash password with bcrypt
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
  }

  // Verify password against hash
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Generate secure random token
  static generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Generate JWT tokens
  static async generateTokens(userId: string, userAgent?: string, ipAddress?: string): Promise<AuthTokens> {
    const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = this.generateToken();
    
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Store session in database
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    
    await db.insert(userSessions).values({
      userId,
      tokenHash,
      userAgent,
      ipAddress,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken,
      expiresAt,
    };
  }

  // Verify JWT token
  static async verifyToken(token: string): Promise<{ userId: string } | null> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      return decoded;
    } catch {
      return null;
    }
  }

  // Revoke session
  static async revokeSession(refreshToken: string): Promise<void> {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    
    await db.update(userSessions)
      .set({ isRevoked: true })
      .where(eq(userSessions.tokenHash, tokenHash));
  }

  // Clean expired sessions
  static async cleanExpiredSessions(): Promise<void> {
    await db.delete(userSessions)
      .where(lt(userSessions.expiresAt, new Date()));
  }

  // Check if account is locked
  static async isAccountLocked(email: string): Promise<boolean> {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user || !user.lockedUntil) return false;
    
    return user.lockedUntil > new Date();
  }

  // Increment login attempts
  static async incrementLoginAttempts(email: string): Promise<void> {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) return;

    const attempts = (user.loginAttempts || 0) + 1;
    const updates: any = { 
      loginAttempts: attempts,
      updatedAt: new Date()
    };

    // Lock account after max attempts
    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      updates.lockedUntil = new Date(Date.now() + LOCK_TIME);
    }

    await db.update(users)
      .set(updates)
      .where(eq(users.id, user.id));
  }

  // Reset login attempts on successful login
  static async resetLoginAttempts(userId: string): Promise<void> {
    await db.update(users)
      .set({ 
        loginAttempts: 0, 
        lockedUntil: null, 
        lastLogin: new Date(),
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  // Generate email verification token
  static async generateEmailVerificationToken(userId: string): Promise<string> {
    const token = this.generateToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours

    await db.update(users)
      .set({ 
        emailVerificationToken: token,
        emailVerificationExpires: expiresAt,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));

    return token;
  }

  // Verify email with token
  static async verifyEmail(token: string): Promise<boolean> {
    const [user] = await db.select()
      .from(users)
      .where(and(
        eq(users.emailVerificationToken, token),
        lt(new Date(), users.emailVerificationExpires!)
      ))
      .limit(1);

    if (!user) return false;

    await db.update(users)
      .set({ 
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
        updatedAt: new Date()
      })
      .where(eq(users.id, user.id));

    return true;
  }

  // Generate password reset token
  static async generatePasswordResetToken(email: string): Promise<string | null> {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) return null;

    const token = this.generateToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour

    await db.update(users)
      .set({ 
        passwordResetToken: token,
        passwordResetExpires: expiresAt,
        updatedAt: new Date()
      })
      .where(eq(users.id, user.id));

    return token;
  }

  // Reset password with token
  static async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const [user] = await db.select()
      .from(users)
      .where(and(
        eq(users.passwordResetToken, token),
        lt(new Date(), users.passwordResetExpires!)
      ))
      .limit(1);

    if (!user) return false;

    const passwordHash = await this.hashPassword(newPassword);

    await db.update(users)
      .set({ 
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
        loginAttempts: 0,
        lockedUntil: null,
        updatedAt: new Date()
      })
      .where(eq(users.id, user.id));

    // Revoke all existing sessions
    await db.update(userSessions)
      .set({ isRevoked: true })
      .where(eq(userSessions.userId, user.id));

    return true;
  }

  // Generate 2FA secret
  static async generate2FASecret(userId: string, email: string): Promise<{ secret: string; qrCodeUrl: string }> {
    const secret = speakeasy.generateSecret({
      name: `IronLedger MedMap (${email})`,
      issuer: 'IronLedger MedMap',
      length: 32,
    });

    await db.update(users)
      .set({ 
        twoFactorSecret: secret.base32,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    return {
      secret: secret.base32,
      qrCodeUrl,
    };
  }

  // Enable 2FA
  static async enable2FA(userId: string, token: string): Promise<boolean> {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user || !user.twoFactorSecret) return false;

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 2,
    });

    if (!verified) return false;

    await db.update(users)
      .set({ 
        isTwoFactorEnabled: true,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));

    return true;
  }

  // Verify 2FA token
  static async verify2FA(userId: string, token: string): Promise<boolean> {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user || !user.twoFactorSecret || !user.isTwoFactorEnabled) return false;

    return speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 2,
    });
  }

  // Disable 2FA
  static async disable2FA(userId: string, token: string): Promise<boolean> {
    const verified = await this.verify2FA(userId, token);
    if (!verified) return false;

    await db.update(users)
      .set({ 
        isTwoFactorEnabled: false,
        twoFactorSecret: null,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));

    return true;
  }

  // Login user
  static async login(email: string, password: string, userAgent?: string, ipAddress?: string): Promise<LoginResult | null> {
    // Check if account is locked
    if (await this.isAccountLocked(email)) {
      throw new Error('Account is temporarily locked due to too many failed login attempts');
    }

    const [user] = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      await this.incrementLoginAttempts(email);
      return null;
    }

    const validPassword = await this.verifyPassword(password, user.passwordHash);
    if (!validPassword) {
      await this.incrementLoginAttempts(email);
      return null;
    }

    // Reset login attempts on successful login
    await this.resetLoginAttempts(user.id);

    // Check if 2FA is required
    if (user.isTwoFactorEnabled) {
      return {
        user,
        tokens: await this.generateTokens(user.id, userAgent, ipAddress),
        requiresTwoFactor: true,
      };
    }

    const tokens = await this.generateTokens(user.id, userAgent, ipAddress);

    return {
      user,
      tokens,
    };
  }

  // Register user
  static async register(userData: InsertUser & { password: string }): Promise<User> {
    const { password, ...userInfo } = userData;
    const passwordHash = await this.hashPassword(password);

    const [user] = await db.insert(users)
      .values({
        ...userInfo,
        passwordHash,
      })
      .returning();

    return user;
  }
}