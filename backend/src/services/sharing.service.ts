import { PrismaClient, ShareLinkType, LinkAction } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

interface CreateShareLinkOptions {
  proposalId: string;
  createdById: string;
  recipientEmail?: string;
  recipientName?: string;
  linkType: ShareLinkType;
  allowedEmails?: string[];
  requiresPassword?: boolean;
  password?: string;
  expiresAt?: Date;
  isOneTime?: boolean;
  canComment?: boolean;
  canDownload?: boolean;
  canSign?: boolean;
  customMessage?: string;
}

interface ShareLinkInfo {
  id: string;
  token: string;
  linkType: ShareLinkType;
  shareUrl: string;
  recipientEmail?: string;
  recipientName?: string;
  expiresAt?: Date;
  canComment: boolean;
  canDownload: boolean;
  canSign: boolean;
  viewCount: number;
  createdAt: Date;
}

/**
 * Create a shareable link for a proposal
 */
export const createShareLink = async (
  options: CreateShareLinkOptions
): Promise<ShareLinkInfo> => {
  const {
    proposalId,
    createdById,
    recipientEmail,
    recipientName,
    linkType,
    allowedEmails = [],
    requiresPassword = false,
    password,
    expiresAt,
    isOneTime = false,
    canComment = true,
    canDownload = true,
    canSign = false,
    customMessage
  } = options;

  try {
    // Verify proposal exists and user has access
    const proposal = await prisma.proposal.findFirst({
      where: {
        id: proposalId,
        OR: [
          { creatorId: createdById },
          {
            collaborators: {
              some: {
                email: {
                  in: await getUserEmail(createdById)
                },
                permission: {
                  in: ['OWNER', 'EDITOR']
                }
              }
            }
          }
        ]
      }
    });

    if (!proposal) {
      throw new AppError('Proposal not found or access denied', 404);
    }

    // Generate secure random token
    const token = crypto.randomBytes(32).toString('hex');

    // Hash password if provided
    let passwordHash: string | undefined;
    if (requiresPassword && password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    // Build allowed emails array
    const finalAllowedEmails = recipientEmail
      ? [...allowedEmails, recipientEmail]
      : allowedEmails;

    // Create share link
    const shareLink = await prisma.proposalShareLink.create({
      data: {
        proposalId,
        createdById,
        token,
        linkType,
        allowedEmails: finalAllowedEmails,
        requiresPassword,
        passwordHash,
        expiresAt,
        isOneTime,
        canComment,
        canDownload,
        canSign,
        customMessage,
        recipientEmail,
        recipientName
      }
    });

    // Generate full share URL
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const shareUrl = `${baseUrl}/p/${token}`;

    return {
      id: shareLink.id,
      token: shareLink.token,
      linkType: shareLink.linkType,
      shareUrl,
      recipientEmail: shareLink.recipientEmail || undefined,
      recipientName: shareLink.recipientName || undefined,
      expiresAt: shareLink.expiresAt || undefined,
      canComment: shareLink.canComment,
      canDownload: shareLink.canDownload,
      canSign: shareLink.canSign,
      viewCount: shareLink.viewCount,
      createdAt: shareLink.createdAt
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error('Create share link error:', error);
    throw new AppError('Failed to create share link', 500);
  }
};

/**
 * Get user email from userId
 */
async function getUserEmail(userId: string): Promise<string[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true }
  });
  return user ? [user.email] : [];
}

/**
 * Validate and access proposal via share link
 */
export const accessProposalViaLink = async (
  token: string,
  accessorEmail?: string,
  password?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{
  proposalId: string;
  canComment: boolean;
  canDownload: boolean;
  canSign: boolean;
  requiresSignup: boolean;
}> => {
  try {
    // Find share link
    const shareLink = await prisma.proposalShareLink.findUnique({
      where: { token },
      include: {
        proposal: {
          select: {
            id: true,
            title: true,
            creatorId: true,
            status: true
          }
        }
      }
    });

    if (!shareLink) {
      throw new AppError('Invalid or expired link', 404);
    }

    // Check if link has expired
    if (shareLink.expiresAt && shareLink.expiresAt < new Date()) {
      throw new AppError('This link has expired', 403);
    }

    // Check if one-time link has already been accessed
    if (shareLink.isOneTime && shareLink.hasBeenAccessed) {
      throw new AppError('This one-time link has already been used', 403);
    }

    // Validate email if EMAIL_SPECIFIC
    if (shareLink.linkType === ShareLinkType.EMAIL_SPECIFIC) {
      if (!accessorEmail) {
        throw new AppError('Email required to access this proposal', 401);
      }

      if (!shareLink.allowedEmails.includes(accessorEmail)) {
        throw new AppError('You are not authorized to access this proposal', 403);
      }
    }

    // Validate password if required
    if (shareLink.requiresPassword) {
      if (!password) {
        throw new AppError('Password required to access this proposal', 401);
      }

      if (!shareLink.passwordHash) {
        throw new AppError('Invalid link configuration', 500);
      }

      const isPasswordValid = await bcrypt.compare(password, shareLink.passwordHash);
      if (!isPasswordValid) {
        throw new AppError('Incorrect password', 401);
      }
    }

    // Log access
    await prisma.linkAccessLog.create({
      data: {
        shareLinkId: shareLink.id,
        accessedBy: accessorEmail || 'anonymous',
        ipAddress: ipAddress || 'unknown',
        userAgent: userAgent || 'unknown',
        action: LinkAction.VIEWED
      }
    });

    // Update access tracking
    await prisma.proposalShareLink.update({
      where: { id: shareLink.id },
      data: {
        viewCount: { increment: 1 },
        lastViewedAt: new Date(),
        ...(shareLink.isOneTime && {
          hasBeenAccessed: true,
          accessedAt: new Date()
        })
      }
    });

    // Check if user needs to sign up
    let requiresSignup = false;
    if (accessorEmail) {
      const existingUser = await prisma.user.findUnique({
        where: { email: accessorEmail }
      });
      requiresSignup = !existingUser;
    }

    return {
      proposalId: shareLink.proposalId,
      canComment: shareLink.canComment,
      canDownload: shareLink.canDownload,
      canSign: shareLink.canSign,
      requiresSignup
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error('Access proposal via link error:', error);
    throw new AppError('Failed to access proposal', 500);
  }
};

/**
 * Get proposal details for public/shared access
 */
export const getSharedProposalInfo = async (token: string) => {
  try {
    const shareLink = await prisma.proposalShareLink.findUnique({
      where: { token },
      include: {
        proposal: {
          include: {
            creator: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            },
            organization: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            },
            documents: {
              where: {
                virusScanStatus: 'CLEAN',
                processingStatus: 'COMPLETED'
              },
              select: {
                id: true,
                originalFileName: true,
                fileSize: true,
                mimeType: true,
                thumbnailUrl: true,
                pageCount: true,
                createdAt: true
              }
            }
          }
        }
      }
    });

    if (!shareLink) {
      return null;
    }

    return {
      proposal: {
        id: shareLink.proposal.id,
        title: shareLink.proposal.title,
        description: shareLink.proposal.description,
        status: shareLink.proposal.status,
        createdAt: shareLink.proposal.createdAt,
        creator: {
          name: `${shareLink.proposal.creator.firstName} ${shareLink.proposal.creator.lastName}`,
          email: shareLink.proposal.creator.email
        },
        organization: shareLink.proposal.organization,
        documents: shareLink.proposal.documents
      },
      shareLink: {
        canComment: shareLink.canComment,
        canDownload: shareLink.canDownload,
        canSign: shareLink.canSign,
        customMessage: shareLink.customMessage,
        recipientName: shareLink.recipientName,
        requiresPassword: shareLink.requiresPassword,
        expiresAt: shareLink.expiresAt
      }
    };
  } catch (error) {
    console.error('Get shared proposal info error:', error);
    throw new AppError('Failed to retrieve proposal information', 500);
  }
};

/**
 * Get all share links for a proposal
 */
export const getProposalShareLinks = async (
  proposalId: string,
  userId: string
): Promise<ShareLinkInfo[]> => {
  try {
    // Verify user has access to proposal
    const proposal = await prisma.proposal.findFirst({
      where: {
        id: proposalId,
        OR: [
          { creatorId: userId },
          {
            collaborators: {
              some: {
                email: {
                  in: await getUserEmail(userId)
                }
              }
            }
          }
        ]
      }
    });

    if (!proposal) {
      throw new AppError('Proposal not found or access denied', 404);
    }

    const shareLinks = await prisma.proposalShareLink.findMany({
      where: { proposalId },
      orderBy: { createdAt: 'desc' }
    });

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    return shareLinks.map(link => ({
      id: link.id,
      token: link.token,
      linkType: link.linkType,
      shareUrl: `${baseUrl}/p/${link.token}`,
      recipientEmail: link.recipientEmail || undefined,
      recipientName: link.recipientName || undefined,
      expiresAt: link.expiresAt || undefined,
      canComment: link.canComment,
      canDownload: link.canDownload,
      canSign: link.canSign,
      viewCount: link.viewCount,
      createdAt: link.createdAt
    }));
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error('Get proposal share links error:', error);
    throw new AppError('Failed to retrieve share links', 500);
  }
};

/**
 * Revoke/delete a share link
 */
export const revokeShareLink = async (
  shareLinkId: string,
  userId: string
): Promise<void> => {
  try {
    const shareLink = await prisma.proposalShareLink.findFirst({
      where: {
        id: shareLinkId,
        proposal: {
          OR: [
            { creatorId: userId },
            {
              collaborators: {
                some: {
                  email: {
                    in: await getUserEmail(userId)
                  },
                  permission: {
                    in: ['OWNER', 'EDITOR']
                  }
                }
              }
            }
          ]
        }
      }
    });

    if (!shareLink) {
      throw new AppError('Share link not found or access denied', 404);
    }

    await prisma.proposalShareLink.delete({
      where: { id: shareLinkId }
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error('Revoke share link error:', error);
    throw new AppError('Failed to revoke share link', 500);
  }
};

/**
 * Log link action (download, comment, sign)
 */
export const logLinkAction = async (
  token: string,
  action: LinkAction,
  userEmail?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> => {
  try {
    const shareLink = await prisma.proposalShareLink.findUnique({
      where: { token }
    });

    if (!shareLink) {
      return; // Silent fail for logging
    }

    await prisma.linkAccessLog.create({
      data: {
        shareLinkId: shareLink.id,
        accessedBy: userEmail || 'anonymous',
        ipAddress: ipAddress || 'unknown',
        userAgent: userAgent || 'unknown',
        action
      }
    });
  } catch (error) {
    console.error('Log link action error:', error);
    // Don't throw - logging failures shouldn't break the main flow
  }
};
