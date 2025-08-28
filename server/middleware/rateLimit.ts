import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
}

export const rateLimit = (options: RateLimitOptions) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    maxRequests = 100,
    message = 'Too many requests, please try again later',
    keyGenerator = (req) => req.ip || 'anonymous'
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const key = keyGenerator(req);
    const now = Date.now();
    
    // Clean up expired entries
    Object.keys(store).forEach(storeKey => {
      if (store[storeKey].resetTime < now) {
        delete store[storeKey];
      }
    });

    if (!store[key]) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs
      };
      return next();
    }

    const record = store[key];
    
    if (record.resetTime < now) {
      record.count = 1;
      record.resetTime = now + windowMs;
      return next();
    }

    record.count++;

    // Set rate limit headers
    res.set({
      'X-RateLimit-Limit': maxRequests.toString(),
      'X-RateLimit-Remaining': Math.max(0, maxRequests - record.count).toString(),
      'X-RateLimit-Reset': Math.ceil(record.resetTime / 1000).toString()
    });

    if (record.count > maxRequests) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message,
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      });
    }

    next();
  };
};

// Predefined rate limiters
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 login attempts per 15 minutes
  message: 'Too many authentication attempts, please try again later'
});

export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
  message: 'Rate limit exceeded for API calls'
});

export const bookingRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10, // 10 bookings per hour
  message: 'Booking rate limit exceeded',
  keyGenerator: (req) => (req as any).user?.id || req.ip
});