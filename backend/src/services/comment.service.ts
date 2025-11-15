import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { auditLog } from './audit.service';
import { notifyCommentAdded } from './notification.service';

interface CreateCommentData {
  content: string;
  parentId?: string;
  anchorText?: string;
  anchorPosition?: number;
}

export const createComment = async (
  proposalId: string,
  data: CreateCommentData,
  userId: string,
  ipAddress: string,
  userAgent: string
) => {
  // Check if proposal exists and user has access
  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId }
  });

  if (!proposal) {
    throw new AppError('Proposal not found', 404);
  }

  const membership = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId: proposal.organizationId
      }
    }
  });

  if (!membership) {
    throw new AppError('Access denied', 403);
  }

  const comment = await prisma.comment.create({
    data: {
      content: data.content,
      proposalId,
      authorId: userId,
      parentId: data.parentId,
      anchorText: data.anchorText,
      anchorPosition: data.anchorPosition
    },
    include: {
      author: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });

  await auditLog({
    userId,
    action: 'COMMENT_CREATED',
    resourceType: 'comment',
    resourceId: comment.id,
    ipAddress,
    userAgent,
    metadata: { proposalId, parentId: data.parentId }
  });

  // Notify relevant users
  await notifyCommentAdded(proposalId, comment.id, userId, data.parentId);

  return comment;
};

export const getComments = async (proposalId: string, userId: string) => {
  // Check access
  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId }
  });

  if (!proposal) {
    throw new AppError('Proposal not found', 404);
  }

  const membership = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId: proposal.organizationId
      }
    }
  });

  if (!membership) {
    throw new AppError('Access denied', 403);
  }

  const comments = await prisma.comment.findMany({
    where: {
      proposalId,
      parentId: null
    },
    include: {
      author: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true
        }
      },
      replies: {
        include: {
          author: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { createdAt: 'asc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return comments;
};

export const updateComment = async (
  commentId: string,
  content: string,
  userId: string,
  ipAddress: string,
  userAgent: string
) => {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId }
  });

  if (!comment) {
    throw new AppError('Comment not found', 404);
  }

  if (comment.authorId !== userId) {
    throw new AppError('Only comment author can update', 403);
  }

  const updated = await prisma.comment.update({
    where: { id: commentId },
    data: { content },
    include: {
      author: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });

  await auditLog({
    userId,
    action: 'COMMENT_UPDATED',
    resourceType: 'comment',
    resourceId: commentId,
    ipAddress,
    userAgent
  });

  return updated;
};

export const deleteComment = async (
  commentId: string,
  userId: string,
  ipAddress: string,
  userAgent: string
) => {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: { proposal: true }
  });

  if (!comment) {
    throw new AppError('Comment not found', 404);
  }

  // Only author or proposal creator can delete
  if (comment.authorId !== userId && comment.proposal.creatorId !== userId) {
    throw new AppError('Insufficient permissions', 403);
  }

  await prisma.comment.delete({
    where: { id: commentId }
  });

  await auditLog({
    userId,
    action: 'COMMENT_DELETED',
    resourceType: 'comment',
    resourceId: commentId,
    ipAddress,
    userAgent
  });

  return { message: 'Comment deleted successfully' };
};

export const resolveComment = async (
  commentId: string,
  userId: string,
  ipAddress: string,
  userAgent: string
) => {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: { proposal: true }
  });

  if (!comment) {
    throw new AppError('Comment not found', 404);
  }

  // Check access
  const membership = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId: comment.proposal.organizationId
      }
    }
  });

  if (!membership) {
    throw new AppError('Access denied', 403);
  }

  const updated = await prisma.comment.update({
    where: { id: commentId },
    data: {
      isResolved: true,
      resolvedAt: new Date()
    }
  });

  await auditLog({
    userId,
    action: 'COMMENT_RESOLVED',
    resourceType: 'comment',
    resourceId: commentId,
    ipAddress,
    userAgent
  });

  return updated;
};
