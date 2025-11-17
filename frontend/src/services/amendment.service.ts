import api from '../lib/api';
import { Amendment, CreateAmendmentData, UpdateAmendmentData, AmendmentFilters } from '../types/amendment.types';

export const amendmentService = {
  /**
   * Get all amendments for a contract
   */
  async getContractAmendments(contractId: string, filters?: AmendmentFilters) {
    const params = new URLSearchParams();

    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);

    const response = await api.get<{
      success: boolean;
      data: Amendment[];
    }>(`/amendments/contract/${contractId}?${params.toString()}`);

    return response.data.data;
  },

  /**
   * Get amendment by ID
   */
  async getById(id: string) {
    const response = await api.get<{
      success: boolean;
      data: Amendment;
    }>(`/amendments/${id}`);

    return response.data.data;
  },

  /**
   * Create a new amendment
   */
  async create(data: CreateAmendmentData) {
    const response = await api.post<{
      success: boolean;
      data: Amendment;
    }>('/amendments', data);

    return response.data.data;
  },

  /**
   * Update an amendment
   */
  async update(id: string, data: UpdateAmendmentData) {
    const response = await api.patch<{
      success: boolean;
      data: Amendment;
    }>(`/amendments/${id}`, data);

    return response.data.data;
  },

  /**
   * Delete an amendment
   */
  async delete(id: string) {
    const response = await api.delete<{
      success: boolean;
      message: string;
    }>(`/amendments/${id}`);

    return response.data;
  },

  /**
   * Approve an amendment
   */
  async approve(id: string) {
    const response = await api.post<{
      success: boolean;
      data: Amendment;
    }>(`/amendments/${id}/approve`);

    return response.data.data;
  },

  /**
   * Reject an amendment
   */
  async reject(id: string, reason?: string) {
    const response = await api.post<{
      success: boolean;
      data: Amendment;
    }>(`/amendments/${id}/reject`, { reason });

    return response.data.data;
  },

  /**
   * Mark amendment as effective
   */
  async markEffective(id: string) {
    const response = await api.post<{
      success: boolean;
      data: Amendment;
    }>(`/amendments/${id}/effective`);

    return response.data.data;
  },
};
