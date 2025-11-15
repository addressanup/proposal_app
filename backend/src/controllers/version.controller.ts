import { Request, Response } from 'express';
import * as versionService from '../services/version.service';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';

// Validation schemas
const createVersionSchema = z.object({
  proposalId: z.string().cuid(),
  content: z.string().min(1),
  changeDescription: z.string().min(1).max(500),
  changeType: z.enum(['MAJOR', 'MINOR', 'PATCH']).optional(),
  changeReason: z.string().optional()
});

const compareVersionsSchema = z.object({
  fromVersion: z.number().int().positive(),
  toVersion: z.number().int().positive()
});

/**
 * Create a new version of a proposal
 * POST /api/proposals/:proposalId/versions
 */
export const createVersion = async (req: Request, res: Response) => {
  try {
    const { proposalId } = req.params;
    const validatedData = createVersionSchema.parse({ ...req.body, proposalId });

    const ipAddress = req.ip || req.connection.remoteAddress || '';
    const userAgent = req.get('user-agent') || '';

    const version = await versionService.createVersion(
      {
        ...validatedData,
        createdById: req.user!.id
      },
      ipAddress,
      userAgent
    );

    res.status(201).json({
      status: 'success',
      data: version
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError(error.errors[0].message, 400);
    }
    throw error;
  }
};

/**
 * Get version history for a proposal
 * GET /api/proposals/:proposalId/versions
 */
export const getVersionHistory = async (req: Request, res: Response) => {
  try {
    const { proposalId } = req.params;

    const versions = await versionService.getVersionHistory(
      proposalId,
      req.user!.id
    );

    res.json({
      status: 'success',
      data: { versions }
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Get a specific version
 * GET /api/proposals/:proposalId/versions/:versionNumber
 */
export const getVersion = async (req: Request, res: Response) => {
  try {
    const { proposalId, versionNumber } = req.params;

    const version = await versionService.getVersion(
      proposalId,
      parseInt(versionNumber),
      req.user!.id
    );

    res.json({
      status: 'success',
      data: { version }
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Compare two versions
 * GET /api/proposals/:proposalId/versions/compare?from=1&to=2
 */
export const compareVersions = async (req: Request, res: Response) => {
  try {
    const { proposalId } = req.params;
    const { from, to } = req.query;

    const validatedData = compareVersionsSchema.parse({
      fromVersion: parseInt(from as string),
      toVersion: parseInt(to as string)
    });

    const comparison = await versionService.compareVersions(
      proposalId,
      validatedData.fromVersion,
      validatedData.toVersion,
      req.user!.id
    );

    res.json({
      status: 'success',
      data: comparison
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError(error.errors[0].message, 400);
    }
    throw error;
  }
};

/**
 * Revert to a specific version
 * POST /api/proposals/:proposalId/versions/:versionNumber/revert
 */
export const revertToVersion = async (req: Request, res: Response) => {
  try {
    const { proposalId, versionNumber } = req.params;
    const ipAddress = req.ip || req.connection.remoteAddress || '';
    const userAgent = req.get('user-agent') || '';

    const result = await versionService.revertToVersion(
      proposalId,
      parseInt(versionNumber),
      req.user!.id,
      ipAddress,
      userAgent
    );

    res.json({
      status: 'success',
      data: result,
      message: `Reverted to version ${versionNumber}`
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Get version statistics
 * GET /api/proposals/:proposalId/versions/statistics
 */
export const getVersionStatistics = async (req: Request, res: Response) => {
  try {
    const { proposalId } = req.params;

    const statistics = await versionService.getVersionStatistics(
      proposalId,
      req.user!.id
    );

    res.json({
      status: 'success',
      data: statistics
    });
  } catch (error) {
    throw error;
  }
};
