import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as proposalService from '../services/proposal.service';
import * as commentService from '../services/comment.service';
import { z } from 'zod';
import { AppError } from '../middleware/errorHandler';
import { ProposalStatus, CollaboratorPermission } from '@prisma/client';

const createProposalSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  content: z.string().min(1),
  organizationId: z.string()
});

const updateProposalSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  content: z.string().min(1).optional(),
  status: z.nativeEnum(ProposalStatus).optional()
});

const addCollaboratorSchema = z.object({
  email: z.string().email(),
  permission: z.nativeEnum(CollaboratorPermission)
});

const createCommentSchema = z.object({
  content: z.string().min(1).max(5000),
  parentId: z.string().optional(),
  anchorText: z.string().optional(),
  anchorPosition: z.number().optional()
});

export const createProposal = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const data = createProposalSchema.parse(req.body);
    const ipAddress = req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const proposal = await proposalService.createProposal(
      data,
      req.user.id,
      ipAddress,
      userAgent
    );

    res.status(201).json({
      status: 'success',
      data: { proposal }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(error.errors[0].message, 400));
    } else {
      next(error);
    }
  }
};

export const getProposals = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { organizationId } = req.query;
    const proposals = await proposalService.getProposals(
      req.user.id,
      organizationId as string
    );

    res.status(200).json({
      status: 'success',
      data: { proposals }
    });
  } catch (error) {
    next(error);
  }
};

export const getProposal = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { id } = req.params;
    const proposal = await proposalService.getProposalById(id, req.user.id);

    res.status(200).json({
      status: 'success',
      data: { proposal }
    });
  } catch (error) {
    next(error);
  }
};

export const updateProposal = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { id } = req.params;
    const data = updateProposalSchema.parse(req.body);
    const ipAddress = req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const proposal = await proposalService.updateProposal(
      id,
      data,
      req.user.id,
      ipAddress,
      userAgent
    );

    res.status(200).json({
      status: 'success',
      data: { proposal }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(error.errors[0].message, 400));
    } else {
      next(error);
    }
  }
};

export const deleteProposal = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { id } = req.params;
    const ipAddress = req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const result = await proposalService.deleteProposal(
      id,
      req.user.id,
      ipAddress,
      userAgent
    );

    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const addCollaborator = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { id } = req.params;
    const data = addCollaboratorSchema.parse(req.body);
    const ipAddress = req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const collaborator = await proposalService.addCollaborator(
      id,
      data.email,
      data.permission,
      req.user.id,
      ipAddress,
      userAgent
    );

    res.status(201).json({
      status: 'success',
      data: { collaborator }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(error.errors[0].message, 400));
    } else {
      next(error);
    }
  }
};

export const removeCollaborator = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { id, collaboratorId } = req.params;
    const ipAddress = req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const result = await proposalService.removeCollaborator(
      id,
      collaboratorId,
      req.user.id,
      ipAddress,
      userAgent
    );

    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const createComment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { id } = req.params;
    const data = createCommentSchema.parse(req.body);
    const ipAddress = req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const comment = await commentService.createComment(
      id,
      data,
      req.user.id,
      ipAddress,
      userAgent
    );

    res.status(201).json({
      status: 'success',
      data: { comment }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(error.errors[0].message, 400));
    } else {
      next(error);
    }
  }
};

export const getComments = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { id } = req.params;
    const comments = await commentService.getComments(id, req.user.id);

    res.status(200).json({
      status: 'success',
      data: { comments }
    });
  } catch (error) {
    next(error);
  }
};

export const updateComment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { commentId } = req.params;
    const { content } = req.body;
    const ipAddress = req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    if (!content) {
      throw new AppError('Content is required', 400);
    }

    const comment = await commentService.updateComment(
      commentId,
      content,
      req.user.id,
      ipAddress,
      userAgent
    );

    res.status(200).json({
      status: 'success',
      data: { comment }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { commentId } = req.params;
    const ipAddress = req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const result = await commentService.deleteComment(
      commentId,
      req.user.id,
      ipAddress,
      userAgent
    );

    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const resolveComment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { commentId } = req.params;
    const ipAddress = req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const comment = await commentService.resolveComment(
      commentId,
      req.user.id,
      ipAddress,
      userAgent
    );

    res.status(200).json({
      status: 'success',
      data: { comment }
    });
  } catch (error) {
    next(error);
  }
};
