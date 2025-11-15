import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as connectionService from '../services/connection.service';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';
import { ConnectionStatus } from '@prisma/client';

const createConnectionSchema = z.object({
  recipientId: z.string().cuid(),
  proposalId: z.string().cuid().optional(),
  notes: z.string().max(500).optional()
});

const updateConnectionSchema = z.object({
  status: z.enum(['PENDING', 'ACTIVE', 'BLOCKED', 'ARCHIVED'])
});

/**
 * Create a connection with another user
 * POST /api/connections
 */
export const createConnection = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const data = createConnectionSchema.parse(req.body);

    const connection = await connectionService.createConnection(
      req.user.id,
      data.recipientId,
      data.proposalId,
      data.notes
    );

    res.status(201).json({
      status: 'success',
      data: { connection }
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
 * Get all connections for the current user
 * GET /api/connections
 */
export const getUserConnections = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const status = req.query.status as ConnectionStatus | undefined;

    const connections = await connectionService.getUserConnections(
      req.user.id,
      status
    );

    res.status(200).json({
      status: 'success',
      data: { connections }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get connection between current user and another user
 * GET /api/connections/user/:userId
 */
export const getConnectionWithUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { userId } = req.params;

    const connection = await connectionService.getConnection(
      req.user.id,
      userId
    );

    if (!connection) {
      throw new AppError('No connection found with this user', 404);
    }

    res.status(200).json({
      status: 'success',
      data: { connection }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update connection status
 * PATCH /api/connections/:connectionId
 */
export const updateConnectionStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { connectionId } = req.params;
    const data = updateConnectionSchema.parse(req.body);

    const connection = await connectionService.updateConnectionStatus(
      connectionId,
      req.user.id,
      data.status as ConnectionStatus
    );

    res.status(200).json({
      status: 'success',
      data: { connection }
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
 * Block a connection
 * POST /api/connections/:connectionId/block
 */
export const blockConnection = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { connectionId } = req.params;

    await connectionService.blockConnection(connectionId, req.user.id);

    res.status(200).json({
      status: 'success',
      message: 'Connection blocked successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Archive a connection
 * POST /api/connections/:connectionId/archive
 */
export const archiveConnection = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { connectionId } = req.params;

    await connectionService.archiveConnection(connectionId, req.user.id);

    res.status(200).json({
      status: 'success',
      message: 'Connection archived successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Activate a connection
 * POST /api/connections/:connectionId/activate
 */
export const activateConnection = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { connectionId } = req.params;

    await connectionService.activateConnection(connectionId, req.user.id);

    res.status(200).json({
      status: 'success',
      message: 'Connection activated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check if current user is connected with another user
 * GET /api/connections/check/:userId
 */
export const checkConnection = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { userId } = req.params;

    const isConnected = await connectionService.areUsersConnected(
      req.user.id,
      userId
    );

    res.status(200).json({
      status: 'success',
      data: { isConnected }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get connection statistics for current user
 * GET /api/connections/stats
 */
export const getConnectionStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const stats = await connectionService.getConnectionStats(req.user.id);

    res.status(200).json({
      status: 'success',
      data: { stats }
    });
  } catch (error) {
    next(error);
  }
};
