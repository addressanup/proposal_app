import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as storageService from '../services/storage.service';
import { AppError } from '../middleware/errorHandler';
import prisma from '../config/database';

export const uploadDocument = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    const { organizationId, proposalId } = req.body;

    if (!organizationId) {
      throw new AppError('Organization ID is required', 400);
    }

    // Verify user has access to organization
    const membership = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: req.user.id,
          organizationId
        }
      }
    });

    if (!membership) {
      throw new AppError('Access denied', 403);
    }

    // Upload file
    const result = await storageService.uploadFile(
      req.file,
      organizationId,
      proposalId
    );

    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getUploadUrl = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { fileName, fileType, organizationId, proposalId } = req.body;

    if (!fileName || !fileType || !organizationId) {
      throw new AppError('fileName, fileType, and organizationId are required', 400);
    }

    // Verify user has access
    const membership = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: req.user.id,
          organizationId
        }
      }
    });

    if (!membership) {
      throw new AppError('Access denied', 403);
    }

    const result = await storageService.getUploadUrl(
      fileName,
      fileType,
      organizationId,
      proposalId
    );

    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getDownloadUrl = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { fileKey } = req.params;

    if (!fileKey) {
      throw new AppError('File key is required', 400);
    }

    // Generate signed URL
    const url = await storageService.getSignedUrl(fileKey, 3600); // 1 hour expiry

    res.status(200).json({
      status: 'success',
      data: { url }
    });
  } catch (error) {
    next(error);
  }
};
