import api from '../lib/api';
import {
  Organization,
  OrganizationMember,
  CreateOrganizationData,
  UpdateOrganizationData,
  InviteMemberData,
  OrganizationMemberRole,
} from '../types/organization.types';

export const organizationService = {
  async list() {
    const response = await api.get<{ success: boolean; data: Organization[] }>(
      '/organizations'
    );
    return response.data.data;
  },

  async getById(id: string) {
    const response = await api.get<{ success: boolean; data: Organization }>(
      `/organizations/${id}`
    );
    return response.data.data;
  },

  async create(data: CreateOrganizationData) {
    const response = await api.post<{ success: boolean; data: Organization }>(
      '/organizations',
      data
    );
    return response.data.data;
  },

  async update(id: string, data: UpdateOrganizationData) {
    const response = await api.patch<{ success: boolean; data: Organization }>(
      `/organizations/${id}`,
      data
    );
    return response.data.data;
  },

  async delete(id: string) {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/organizations/${id}`
    );
    return response.data;
  },

  async getMembers(orgId: string) {
    const response = await api.get<{ success: boolean; data: OrganizationMember[] }>(
      `/organizations/${orgId}/members`
    );
    return response.data.data;
  },

  async inviteMember(orgId: string, data: InviteMemberData) {
    const response = await api.post<{ success: boolean; data: OrganizationMember }>(
      `/organizations/${orgId}/invite`,
      data
    );
    return response.data.data;
  },

  async updateMemberRole(
    orgId: string,
    memberId: string,
    role: OrganizationMemberRole
  ) {
    const response = await api.patch<{ success: boolean; data: OrganizationMember }>(
      `/organizations/${orgId}/members/${memberId}`,
      { role }
    );
    return response.data.data;
  },

  async removeMember(orgId: string, memberId: string) {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/organizations/${orgId}/members/${memberId}`
    );
    return response.data;
  },
};
