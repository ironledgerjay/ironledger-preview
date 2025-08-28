import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { db } from '../storage';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Extend Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        isEmailVerified: boolean;
        isTwoFactorEnabled: boolean;
      };
    }
  }
}

// Authentication middleware
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: 'Authentication token required' });
    }

    const decoded = await AuthService.verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Get user from database
    const [user] = await db.select({
      id: users.id,
      email: users.email,
      role: users.role,
      isEmailVerified: users.isEmailVerified,
      isTwoFactorEnabled: users.isTwoFactorEnabled,
    })
    .from(users)
    .where(eq(users.id, decoded.userId))
    .limit(1);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
}

// Role-based authorization middleware
export function authorize(roles: string | string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}

// Email verification requirement middleware
export function requireEmailVerification(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!req.user.isEmailVerified) {
    return res.status(403).json({ 
      error: 'Email verification required',
      code: 'EMAIL_NOT_VERIFIED'
    });
  }

  next();
}

// Two-factor authentication requirement middleware
export function require2FA(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.isTwoFactorEnabled) {
    const twoFactorToken = req.headers['x-2fa-token'] as string;
    
    if (!twoFactorToken) {
      return res.status(403).json({ 
        error: 'Two-factor authentication required',
        code: '2FA_REQUIRED'
      });
    }

    // Verify 2FA token (this would be done in the route handler)
    // We pass it through here and let the route handler verify
  }

  next();
}

// Doctor-specific authentication
export function authenticateDoctor(req: Request, res: Response, next: NextFunction) {
  authenticate(req, res, (err) => {
    if (err) return next(err);
    
    if (req.user?.role !== 'doctor') {
      return res.status(403).json({ error: 'Doctor access required' });
    }
    
    next();
  });
}

// Admin-specific authentication
export function authenticateAdmin(req: Request, res: Response, next: NextFunction) {
  authenticate(req, res, (err) => {
    if (err) return next(err);
    
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    next();
  });
}

// Optional authentication (for routes that work with or without auth)
export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (token) {
      const decoded = await AuthService.verifyToken(token);
      if (decoded) {
        const [user] = await db.select({
          id: users.id,
          email: users.email,
          role: users.role,
          isEmailVerified: users.isEmailVerified,
          isTwoFactorEnabled: users.isTwoFactorEnabled,
        })
        .from(users)
        .where(eq(users.id, decoded.userId))
        .limit(1);

        if (user) {
          req.user = user;
        }
      }
    }

    next();
  } catch (error) {
    // Silently continue without authentication for optional auth
    next();
  }
}