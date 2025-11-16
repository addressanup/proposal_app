import api from '../lib/api';
import {
  Contract,
  CreateContractFromTemplateData,
  ContractFilters,
  ContractStatistics,
  ObligationStatus,
} from '../types/contract.types';

export const contractService = {
  async list(filters?: ContractFilters, page = 1, limit = 20) {
    const response = await api.get<{
      success: boolean;
      data: Contract[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>('/contracts', {
      params: { ...filters, page, limit },
    });
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get<{ success: boolean; data: Contract }>(
      `/contracts/${id}`
    );
    return response.data;
  },

  async createFromTemplate(data: CreateContractFromTemplateData) {
    const response = await api.post<{ success: boolean; data: Contract }>(
      '/contracts/from-template',
      data
    );
    return response.data;
  },

  async create(data: any) {
    const response = await api.post<{ success: boolean; data: Contract }>(
      '/contracts',
      data
    );
    return response.data;
  },

  async update(id: string, data: Partial<Contract>) {
    const response = await api.patch<{ success: boolean; data: Contract }>(
      `/contracts/${id}`,
      data
    );
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/contracts/${id}`
    );
    return response.data;
  },

  async archive(id: string) {
    const response = await api.post<{ success: boolean; data: Contract }>(
      `/contracts/${id}/archive`
    );
    return response.data;
  },

  async getExpiring(daysAhead = 30) {
    const response = await api.get<{ success: boolean; data: Contract[]; count: number }>(
      '/contracts/expiring',
      { params: { daysAhead } }
    );
    return response.data;
  },

  async getStatistics(organizationId?: string) {
    const response = await api.get<{ success: boolean; data: ContractStatistics }>(
      '/contracts/statistics',
      { params: { organizationId } }
    );
    return response.data;
  },

  async addCounterparty(contractId: string, data: any) {
    const response = await api.post<{ success: boolean; data: any }>(
      `/contracts/${contractId}/counterparties`,
      data
    );
    return response.data;
  },

  async addObligation(contractId: string, data: any) {
    const response = await api.post<{ success: boolean; data: any }>(
      `/contracts/${contractId}/obligations`,
      data
    );
    return response.data;
  },

  async updateObligationStatus(
    obligationId: string,
    status: ObligationStatus,
    completionNotes?: string
  ) {
    const response = await api.patch<{ success: boolean; data: any }>(
      `/contracts/obligations/${obligationId}/status`,
      { status, completionNotes }
    );
    return response.data;
  },

  async addMilestone(contractId: string, data: any) {
    const response = await api.post<{ success: boolean; data: any }>(
      `/contracts/${contractId}/milestones`,
      data
    );
    return response.data;
  },
};
