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

export const auditLog = async (data: AuditLogData) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        ipAddress: data.ipAddress || 'unknown',
        userAgent: data.userAgent || 'unknown',
        metadata: data.metadata || data.details || {}
      }
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
  limit?: number;
  offset?: number;
}) => {
  const { userId, resourceType, resourceId, limit = 50, offset = 0 } = filters;

  const where: any = {};
  if (userId) where.userId = userId;
  if (resourceType) where.resourceType = resourceType;
  if (resourceId) where.resourceId = resourceId;

  const logs = await prisma.auditLog.findMany({
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
          lastName: true
        }
      }
    }
  });

  const total = await prisma.auditLog.count({ where });

  return { logs, total, limit, offset };
};
