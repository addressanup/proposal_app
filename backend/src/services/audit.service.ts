import prisma from '../config/database';

interface AuditLogData {
  userId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  details?: Record<string, any>; // Alias for metadata for backward compatibility
}

// Legacy function signature for backward compatibility
export const auditLog = async (
  userId: string | null,
  action: string,
  resourceType: string,
  resourceId: string | undefined,
  ipAddress: string,
  userAgent: string,
  metadata?: Record<string, any>
) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId || undefined,
        action,
        resourceType,
        resourceId,
        ipAddress: ipAddress || 'unknown',
        userAgent: userAgent || 'unknown',
        metadata: metadata || {},
      },
    });
  } catch (error) {
    // Log to console but don't throw - audit logging shouldn't break main flow
    console.error('Audit logging failed:', error);
  }
};

// Object-based function for new code
export const createAuditLog = async (data: AuditLogData) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        ipAddress: data.ipAddress || 'unknown',
        userAgent: data.userAgent || 'unknown',
        metadata: data.metadata || data.details || {},
      },
    });
  } catch (error) {
    // Log to console but don't throw - audit logging shouldn't break main flow
    console.error('Audit logging failed:', error);
  }
};

export const getAuditLogs = async (filters: {
  userId?: string;
  resourceType?: string;
  resourceId?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}) => {
  const { userId, resourceType, resourceId, action, startDate, endDate, page = 1, limit = 50 } = filters;

  const offset = (page - 1) * limit;

  const where: any = {};
  if (userId) where.userId = userId;
  if (resourceType) where.resourceType = resourceType;
  if (resourceId) where.resourceId = resourceId;
  if (action) where.action = action;

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

