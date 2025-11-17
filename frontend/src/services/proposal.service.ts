import api from '../lib/api';
import {
  Proposal,
  CreateProposalData,
  UpdateProposalData,
  ProposalFilters,
  ProposalCollaborator,
  AddCollaboratorData,
  Comment,
  CreateCommentData,
  ProposalVersion,
} from '../types/proposal.types';

export const proposalService = {
  // Proposal CRUD
  async list(filters?: ProposalFilters, page = 1, limit = 20) {
    const response = await api.get<{
      success: boolean;
      data: Proposal[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>('/proposals', {
      params: { ...filters, page, limit },
    });
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get<{ success: boolean; data: Proposal }>(
      `/proposals/${id}`
    );
    return response.data.data;
  },

  async create(data: CreateProposalData) {
    const response = await api.post<{ success: boolean; data: Proposal }>(
      '/proposals',
      data
    );
    return response.data.data;
  },

  async update(id: string, data: UpdateProposalData) {
    const response = await api.patch<{ success: boolean; data: Proposal }>(
      `/proposals/${id}`,
      data
    );
    return response.data.data;
  },

  async delete(id: string) {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/proposals/${id}`
    );
    return response.data;
  },

  // Collaborators
  async getCollaborators(proposalId: string) {
    const response = await api.get<{ success: boolean; data: ProposalCollaborator[] }>(
      `/proposals/${proposalId}/collaborators`
    );
    return response.data.data;
  },

  async addCollaborator(proposalId: string, data: AddCollaboratorData) {
    const response = await api.post<{ success: boolean; data: ProposalCollaborator }>(
      `/proposals/${proposalId}/collaborators`,
      data
    );
    return response.data.data;
  },

  async updateCollaborator(
    proposalId: string,
    collaboratorId: string,
    data: Partial<AddCollaboratorData>
  ) {
    const response = await api.patch<{ success: boolean; data: ProposalCollaborator }>(
      `/proposals/${proposalId}/collaborators/${collaboratorId}`,
      data
    );
    return response.data.data;
  },

  async removeCollaborator(proposalId: string, collaboratorId: string) {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/proposals/${proposalId}/collaborators/${collaboratorId}`
    );
    return response.data;
  },

  // Comments
  async getComments(proposalId: string) {
    const response = await api.get<{ success: boolean; data: Comment[] }>(
      `/proposals/${proposalId}/comments`
    );
    return response.data.data;
  },

  async createComment(proposalId: string, data: CreateCommentData) {
    const response = await api.post<{ success: boolean; data: Comment }>(
      `/proposals/${proposalId}/comments`,
      data
    );
    return response.data.data;
  },

  async deleteComment(proposalId: string, commentId: string) {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/proposals/${proposalId}/comments/${commentId}`
    );
    return response.data;
  },

  // Versions
  async getVersions(proposalId: string) {
    const response = await api.get<{ success: boolean; data: ProposalVersion[] }>(
      `/proposals/${proposalId}/versions`
    );
    return response.data.data;
  },

  async getVersion(proposalId: string, versionNumber: number) {
    const response = await api.get<{ success: boolean; data: ProposalVersion }>(
      `/proposals/${proposalId}/versions/${versionNumber}`
    );
    return response.data.data;
  },

  async compareVersions(proposalId: string, versionNumber1: number, versionNumber2: number) {
    const response = await api.get<{ success: boolean; data: any }>(
      `/proposals/${proposalId}/versions/compare`,
      {
        params: {
          version1: versionNumber1,
          version2: versionNumber2,
        },
      }
    );
    return response.data.data;
  },

  async revertToVersion(proposalId: string, versionNumber: number) {
    const response = await api.post<{ success: boolean; data: Proposal }>(
      `/proposals/${proposalId}/versions/${versionNumber}/revert`
    );
    return response.data.data;
  },
};
