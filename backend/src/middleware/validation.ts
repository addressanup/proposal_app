import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppError } from './errorHandler';
import { formatValidationErrors } from '../utils/validators';

/**
 * Validation middleware factory
 * Creates middleware that validates request data against a Zod schema
 */
export const validate = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = formatValidationErrors(error);
        return next(new AppError(`Validation failed: ${formattedErrors.join(', ')}`, 400));
      }
      next(error);
    }
  };
};

/**
 * Validate query parameters
 */
export const validateQuery = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.query);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = formatValidationErrors(error);
        return next(new AppError(`Query validation failed: ${formattedErrors.join(', ')}`, 400));
      }
      next(error);
    }
  };
};

/**
 * Validate route parameters
 */
export const validateParams = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.params);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = formatValidationErrors(error);
        return next(new AppError(`Parameter validation failed: ${formattedErrors.join(', ')}`, 400));
      }
      next(error);
    }
  };
};

/**
 * Sanitize input to prevent XSS attacks
 * Removes potentially dangerous HTML/JavaScript
 */
export const sanitizeInput = (input: any): any => {
  if (typeof input === 'string') {
    // Remove script tags and event handlers
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/javascript:/gi, '');
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }

  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const key in input) {
      if (input.hasOwnProperty(key)) {
        sanitized[key] = sanitizeInput(input[key]);
      }
    }
    return sanitized;
  }

  return input;
};

/**
 * Middleware to sanitize request body
 */
export const sanitizeBody = (req: Request, res: Response, next: NextFunction) => {
  if (req.body) {
    req.body = sanitizeInput(req.body);
  }
  next();
};

/**
 * Rate limiting helper for sensitive operations
 * This is a simple in-memory rate limiter
 * For production, use Redis-based rate limiting
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export const rateLimit = (options: {
  windowMs: number; // Time window in milliseconds
  max: number; // Max requests per window
  message?: string;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${req.ip}-${req.path}`;
    const now = Date.now();

    const record = rateLimitMap.get(key);

    if (!record || now > record.resetTime) {
      // Create new record or reset expired one
      rateLimitMap.set(key, {
        count: 1,
        resetTime: now + options.windowMs
      });
      return next();
    }

    if (record.count >= options.max) {
      return next(
        new AppError(
          options.message || 'Too many requests. Please try again later.',
          429
        )
      );
    }

    record.count++;
    next();
  };
};

/**
 * Clean up old rate limit records periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 60000); // Clean up every minute
