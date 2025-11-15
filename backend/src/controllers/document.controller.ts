import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as documentService from '../services/document.service';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';

/**
 * Upload document to a proposal
 * POST /api/proposals/:proposalId/documents
 */
export const uploadDocument = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { proposalId } = req.params;

    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    // Get organization ID from proposal or user's default org
    // For now, we'll need to fetch the proposal to get organizationId
    // This could be optimized with middleware
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      select: { organizationId: true }
    });

    if (!proposal) {
      throw new AppError('Proposal not found', 404);
    }

    const document = await documentService.uploadDocument({
      file: req.file,
      proposalId,
      userId: req.user.id,
      organizationId: proposal.organizationId
    });

    res.status(201).json({
      status: 'success',
      data: { document }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get document by ID
 * GET /api/documents/:documentId
 */
export const getDocument = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { documentId } = req.params;

    const document = await documentService.getDocument(documentId, req.user.id);

    if (!document) {
      throw new AppError('Document not found or access denied', 404);
    }

    res.status(200).json({
      status: 'success',
      data: { document }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all documents for a proposal
 * GET /api/proposals/:proposalId/documents
 */
export const getProposalDocuments = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { proposalId } = req.params;

    const documents = await documentService.getProposalDocuments(
      proposalId,
      req.user.id
    );

    res.status(200).json({
      status: 'success',
      data: { documents }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete document
 * DELETE /api/documents/:documentId
 */
export const deleteDocument = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { documentId } = req.params;

    await documentService.deleteDocument(documentId, req.user.id);

    res.status(200).json({
      status: 'success',
      message: 'Document deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get document download URL
 * GET /api/documents/:documentId/download
 */
export const getDocumentDownloadUrl = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { documentId } = req.params;
    const expiresIn = parseInt(req.query.expiresIn as string) || 3600;

    const downloadUrl = await documentService.getDocumentDownloadUrl(
      documentId,
      req.user.id,
      expiresIn
    );

    res.status(200).json({
      status: 'success',
      data: { downloadUrl, expiresIn }
    });
  } catch (error) {
    next(error);
  }
};
