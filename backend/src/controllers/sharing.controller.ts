import { Response, NextFunction, Request } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as sharingService from '../services/sharing.service';
import * as emailService from '../services/email.service';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';
import { ShareLinkType, LinkAction } from '@prisma/client';

const createShareLinkSchema = z.object({
  proposalId: z.string().cuid(),
  recipientEmail: z.string().email().optional(),
  recipientName: z.string().min(1).max(100).optional(),
  linkType: z.enum(['PUBLIC', 'EMAIL_SPECIFIC', 'ONE_TIME', 'PASSWORD_PROTECTED']),
  allowedEmails: z.array(z.string().email()).optional(),
  requiresPassword: z.boolean().optional(),
  password: z.string().min(8).optional(),
  expiresInDays: z.number().min(1).max(365).optional(),
  isOneTime: z.boolean().optional(),
  canComment: z.boolean().optional(),
  canDownload: z.boolean().optional(),
  canSign: z.boolean().optional(),
  customMessage: z.string().max(1000).optional(),
  sendEmail: z.boolean().optional()
});

const accessLinkSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().optional()
});

/**
 * Create a shareable link for a proposal
 * POST /api/sharing/links
 */
export const createShareLink = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const data = createShareLinkSchema.parse(req.body);

    // Calculate expiration date if provided
    let expiresAt: Date | undefined;
    if (data.expiresInDays) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + data.expiresInDays);
    }

    const shareLink = await sharingService.createShareLink({
      proposalId: data.proposalId,
      createdById: req.user.id,
      recipientEmail: data.recipientEmail,
      recipientName: data.recipientName,
      linkType: data.linkType as ShareLinkType,
      allowedEmails: data.allowedEmails,
      requiresPassword: data.requiresPassword,
      password: data.password,
      expiresAt,
      isOneTime: data.isOneTime,
      canComment: data.canComment ?? true,
      canDownload: data.canDownload ?? true,
      canSign: data.canSign ?? false,
      customMessage: data.customMessage
    });

    // Send email notification if requested and recipient email is provided
    if (data.sendEmail && data.recipientEmail && data.recipientName) {
      try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();

        const [proposal, sender] = await Promise.all([
          prisma.proposal.findUnique({
            where: { id: data.proposalId },
            select: { title: true }
          }),
          prisma.user.findUnique({
            where: { id: req.user.id },
            select: { firstName: true, lastName: true }
          })
        ]);

        if (proposal && sender) {
          await emailService.sendProposalShareEmail(
            data.recipientEmail,
            data.recipientName,
            `${sender.firstName} ${sender.lastName}`,
            proposal.title,
            shareLink.shareUrl,
            data.customMessage
          );
        }
      } catch (emailError) {
        console.error('Failed to send share email:', emailError);
        // Don't fail the request if email fails
      }
    }

    res.status(201).json({
      status: 'success',
      data: { shareLink }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(error.errors[0].message, 400));
    } else {
      next(error);
    }
  }
};

/**
 * Access a proposal via share link (public endpoint)
 * POST /api/sharing/access/:token
 */
export const accessProposalViaLink = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.params;
    const data = accessLinkSchema.parse(req.body);

    const ipAddress = req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const access = await sharingService.accessProposalViaLink(
      token,
      data.email,
      data.password,
      ipAddress,
      userAgent
    );

    res.status(200).json({
      status: 'success',
      data: access
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(error.errors[0].message, 400));
    } else {
      next(error);
    }
  }
};

/**
 * Get proposal info via share link (public endpoint)
 * GET /api/sharing/preview/:token
 */
export const getSharedProposalInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.params;

    const proposalInfo = await sharingService.getSharedProposalInfo(token);

    if (!proposalInfo) {
      throw new AppError('Invalid or expired share link', 404);
    }

    res.status(200).json({
      status: 'success',
      data: proposalInfo
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all share links for a proposal
 * GET /api/proposals/:proposalId/share-links
 */
export const getProposalShareLinks = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { proposalId } = req.params;

    const shareLinks = await sharingService.getProposalShareLinks(
      proposalId,
      req.user.id
    );

    res.status(200).json({
      status: 'success',
      data: { shareLinks }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Revoke a share link
 * DELETE /api/sharing/links/:shareLinkId
 */
export const revokeShareLink = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { shareLinkId } = req.params;

    await sharingService.revokeShareLink(shareLinkId, req.user.id);

    res.status(200).json({
      status: 'success',
      message: 'Share link revoked successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Log a link action (download, comment, sign)
 * POST /api/sharing/log-action/:token
 */
export const logLinkAction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.params;
    const { action, email } = req.body;

    if (!action || !Object.values(LinkAction).includes(action)) {
      throw new AppError('Invalid action', 400);
    }

    const ipAddress = req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    await sharingService.logLinkAction(
      token,
      action as LinkAction,
      email,
      ipAddress,
      userAgent
    );

    res.status(200).json({
      status: 'success',
      message: 'Action logged'
    });
  } catch (error) {
    next(error);
  }
};
