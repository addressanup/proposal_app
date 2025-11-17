import api from '../lib/api';
import { Notification } from '../types/notification.types';

export const notificationService = {
  async list(page = 1, limit = 20) {
    const response = await api.get<{
      success: boolean;
      data: Notification[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>('/notifications', {
      params: { page, limit },
    });
    return response.data;
  },

  async markAsRead(id: string) {
    const response = await api.patch<{ success: boolean; data: Notification }>(
      `/notifications/${id}/read`
    );
    return response.data.data;
  },

  async markAllAsRead() {
    const response = await api.post<{ success: boolean; message: string }>(
      '/notifications/mark-all-read'
    );
    return response.data;
  },

  async getUnreadCount() {
    const response = await api.get<{ success: boolean; data: { count: number } }>(
      '/notifications/unread-count'
    );
    return response.data.data.count;
  },

  async delete(id: string) {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/notifications/${id}`
    );
    return response.data;
  },
};
