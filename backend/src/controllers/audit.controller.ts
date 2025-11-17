import { Request, Response } from 'express';
import * as auditService from '../services/audit.service';

// Get audit logs with filtering and pagination
export async function getAuditLogs(req: Request, res: Response) {
  try {
    const filters = {
      userId: req.query.userId as string,
      resourceType: req.query.resourceType as string,
      resourceId: req.query.resourceId as string,
      action: req.query.action as string,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 50,
    };

    const result = await auditService.getAuditLogs(filters);

    res.json(result);
  } catch (error: any) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch audit logs' });
  }
}
