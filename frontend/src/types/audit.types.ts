export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  VIEW = 'VIEW',
  DOWNLOAD = 'DOWNLOAD',
  SHARE = 'SHARE',
  SIGN = 'SIGN',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  COMMENT = 'COMMENT',
  UPLOAD = 'UPLOAD',
  EXPORT = 'EXPORT',
}

export enum AuditEntityType {
  USER = 'USER',
  PROPOSAL = 'PROPOSAL',
  CONTRACT = 'CONTRACT',
  TEMPLATE = 'TEMPLATE',
  DOCUMENT = 'DOCUMENT',
  SIGNATURE = 'SIGNATURE',
  ORGANIZATION = 'ORGANIZATION',
  COMMENT = 'COMMENT',
  NOTIFICATION = 'NOTIFICATION',
}

export interface AuditLog {
  id: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  userId: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface AuditLogFilters {
  action?: AuditAction;
  entityType?: AuditEntityType;
  userId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}
