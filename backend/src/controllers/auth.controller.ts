import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as authService from '../services/auth.service';
import { z } from 'zod';
import { AppError } from '../middleware/errorHandler';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  shareToken: z.string().optional() // Share link token for auto-connection
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  mfaToken: z.string().optional()
});

const mfaVerifySchema = z.object({
  token: z.string().length(6)
});

export const register = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = registerSchema.parse(req.body);
    const ipAddress = req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const user = await authService.register(data, ipAddress, userAgent);

    // Generate tokens for newly registered user
    const loginResult = await authService.login(
      { email: data.email, password: data.password },
      ipAddress,
      userAgent
    );

    // If shareToken is provided, handle auto-connection
    if (data.shareToken) {
      try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        const connectionService = require('../services/connection.service');
        const emailService = require('../services/email.service');

        // Get share link to find proposal creator
        const shareLink = await prisma.proposalShareLink.findUnique({
          where: { token: data.shareToken },
          include: {
            proposal: {
              include: {
                creator: true
              }
            }
          }
        });

        if (shareLink) {
          // Create connection between new user and proposal creator
          await connectionService.createConnection(
            shareLink.proposal.creatorId,
            user.id,
            shareLink.proposalId,
            `Auto-connected via proposal share: ${shareLink.proposal.title}`
          );

          // Send connection email to creator
          await emailService.sendConnectionEmail(
            shareLink.proposal.creator.email,
            `${shareLink.proposal.creator.firstName} ${shareLink.proposal.creator.lastName}`,
            `${user.firstName} ${user.lastName}`,
            shareLink.proposal.title
          );

          // Send welcome email to new user
          await emailService.sendWelcomeEmail(
            user.email,
            `${user.firstName} ${user.lastName}`
          );
        }
      } catch (connectionError) {
        console.error('Auto-connection error:', connectionError);
        // Don't fail registration if connection fails
      }
    }

    res.status(201).json({
      status: 'success',
      data: {
        user: loginResult.user,
        accessToken: loginResult.accessToken,
        refreshToken: loginResult.refreshToken
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(error.errors[0].message, 400));
    } else {
      next(error);
    }
  }
};

export const login = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = loginSchema.parse(req.body);
    const ipAddress = req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const result = await authService.login(data, ipAddress, userAgent);

    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(error.errors[0].message, 400));
    } else {
      next(error);
    }
  }
};

export const setupMFA = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const result = await authService.setupMFA(req.user.id);

    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const verifyMFA = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { token } = mfaVerifySchema.parse(req.body);
    const result = await authService.verifyAndEnableMFA(req.user.id, token);

    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(error.errors[0].message, 400));
    } else {
      next(error);
    }
  }
};

export const refreshToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError('Refresh token required', 400);
    }

    const result = await authService.refreshAccessToken(refreshToken);

    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    res.status(200).json({
      status: 'success',
      data: { user: req.user }
    });
  } catch (error) {
    next(error);
  }
};
