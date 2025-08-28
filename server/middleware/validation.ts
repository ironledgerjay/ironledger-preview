import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const validateRequest = (schema: {
  body?: z.ZodSchema;
  query?: z.ZodSchema;
  params?: z.ZodSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }
      
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }
      
      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      
      next(error);
    }
  };
};

export const rateLimitSchema = z.object({
  windowMs: z.number().min(1000).default(15 * 60 * 1000), // 15 minutes
  maxRequests: z.number().min(1).default(100)
});

export const paginationSchema = z.object({
  page: z.string().transform(val => Math.max(1, parseInt(val) || 1)),
  limit: z.string().transform(val => Math.min(100, Math.max(1, parseInt(val) || 10)))
});

export const searchSchema = z.object({
  q: z.string().min(1).max(100).optional(),
  specialty: z.string().max(50).optional(),
  province: z.string().max(50).optional(),
  city: z.string().max(50).optional(),
  sortBy: z.enum(['name', 'rating', 'experience', 'price']).default('rating'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});