import api from '../lib/api';
import { AuditLog, AuditLogFilters } from '../types/audit.types';

export const auditService = {
  /**
   * Get audit logs with optional filters
   */
  async getLogs(filters?: AuditLogFilters, page = 1, limit = 50) {
    const params = new URLSearchParams();

    if (filters?.action) params.append('action', filters.action);
    if (filters?.entityType) params.append('entityType', filters.entityType);
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.search) params.append('search', filters.search);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await api.get<{
      success: boolean;
      data: {
        logs: AuditLog[];
        total: number;
        page: number;
        totalPages: number;
      };
    }>(`/audit/logs?${params.toString()}`);

    return response.data.data;
  },

  /**
   * Get audit logs for a specific entity
   */
  async getEntityLogs(entityType: string, entityId: string) {
    const response = await api.get<{
      success: boolean;
      data: AuditLog[];
    }>(`/audit/logs/${entityType}/${entityId}`);

    return response.data.data;
  },

  /**
   * Get user activity logs
   */
  async getUserActivity(userId: string, limit = 100) {
    const response = await api.get<{
      success: boolean;
      data: AuditLog[];
    }>(`/audit/user/${userId}?limit=${limit}`);

    return response.data.data;
  },

  /**
   * Export audit logs
   */
  async exportLogs(filters?: AuditLogFilters, format: 'csv' | 'json' = 'csv') {
    const params = new URLSearchParams();

    if (filters?.action) params.append('action', filters.action);
    if (filters?.entityType) params.append('entityType', filters.entityType);
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.search) params.append('search', filters.search);
    params.append('format', format);

    const response = await api.get(`/audit/export?${params.toString()}`, {
      responseType: 'blob',
    });

    return response.data;
  },
};
