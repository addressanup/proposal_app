import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as organizationService from '../services/organization.service';
import { z } from 'zod';
import { AppError } from '../middleware/errorHandler';
import { Role } from '@prisma/client';

const createOrgSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional()
});

const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.nativeEnum(Role)
});

const updateRoleSchema = z.object({
  role: z.nativeEnum(Role)
});

export const createOrganization = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const data = createOrgSchema.parse(req.body);
    const ipAddress = req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const organization = await organizationService.createOrganization(
      data,
      req.user.id,
      ipAddress,
      userAgent
    );

    res.status(201).json({
      status: 'success',
      data: { organization }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(error.errors[0].message, 400));
    } else {
      next(error);
    }
  }
};

export const getUserOrganizations = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const organizations = await organizationService.getUserOrganizations(req.user.id);

    res.status(200).json({
      status: 'success',
      data: { organizations }
    });
  } catch (error) {
    next(error);
  }
};

export const getOrganization = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { id } = req.params;
    const organization = await organizationService.getOrganizationById(id, req.user.id);

    res.status(200).json({
      status: 'success',
      data: { organization }
    });
  } catch (error) {
    next(error);
  }
};

export const inviteMember = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { id } = req.params;
    const data = inviteMemberSchema.parse(req.body);
    const ipAddress = req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const member = await organizationService.inviteMember(
      id,
      data.email,
      data.role,
      req.user.id,
      ipAddress,
      userAgent
    );

    res.status(201).json({
      status: 'success',
      data: { member }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(error.errors[0].message, 400));
    } else {
      next(error);
    }
  }
};

export const removeMember = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { id, memberId } = req.params;
    const ipAddress = req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const result = await organizationService.removeMember(
      id,
      memberId,
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

export const updateMemberRole = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { id, memberId } = req.params;
    const { role } = updateRoleSchema.parse(req.body);
    const ipAddress = req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const member = await organizationService.updateMemberRole(
      id,
      memberId,
      role,
      req.user.id,
      ipAddress,
      userAgent
    );

    res.status(200).json({
      status: 'success',
      data: { member }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(error.errors[0].message, 400));
    } else {
      next(error);
    }
  }
};
