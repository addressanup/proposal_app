import api from '../lib/api';
import { Template, CreateTemplateData, TemplateFilters } from '../types/template.types';

export const templateService = {
  async list(filters?: TemplateFilters) {
    const response = await api.get<{ success: boolean; data: Template[]; count: number }>(
      '/templates',
      { params: filters }
    );
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get<{ success: boolean; data: Template }>(`/templates/${id}`);
    return response.data;
  },

  async create(data: CreateTemplateData) {
    const response = await api.post<{ success: boolean; data: Template }>('/templates', data);
    return response.data;
  },

  async update(id: string, data: Partial<Template>) {
    const response = await api.patch<{ success: boolean; data: Template }>(
      `/templates/${id}`,
      data
    );
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/templates/${id}`
    );
    return response.data;
  },

  async clone(id: string, name: string, organizationId?: string) {
    const response = await api.post<{ success: boolean; data: Template }>(
      `/templates/${id}/clone`,
      { name, organizationId }
    );
    return response.data;
  },

  async preview(id: string, fieldValues: Record<string, any>) {
    const response = await api.post<{ success: boolean; data: { preview: string } }>(
      `/templates/${id}/preview`,
      { fieldValues }
    );
    return response.data;
  },

  async getUsageStats(id: string) {
    const response = await api.get<{ success: boolean; data: any }>(
      `/templates/${id}/stats`
    );
    return response.data;
  },
};
