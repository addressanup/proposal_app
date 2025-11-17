import api from '../lib/api';
import {
  Connection,
  CreateConnectionData,
  ConnectionFilters,
  ConnectionStats,
} from '../types/connection.types';

export const connectionService = {
  /**
   * Get all connections
   */
  async getAll(filters?: ConnectionFilters, page = 1, limit = 50) {
    const params = new URLSearchParams();

    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await api.get<{
      success: boolean;
      data: {
        connections: Connection[];
        total: number;
        page: number;
        totalPages: number;
      };
    }>(`/connections?${params.toString()}`);

    return response.data.data;
  },

  /**
   * Get my connections (accepted only)
   */
  async getMyConnections(page = 1, limit = 50) {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await api.get<{
      success: boolean;
      data: {
        connections: Connection[];
        total: number;
        page: number;
        totalPages: number;
      };
    }>(`/connections/my-connections?${params.toString()}`);

    return response.data.data;
  },

  /**
   * Get pending connection requests (received)
   */
  async getPendingRequests() {
    const response = await api.get<{
      success: boolean;
      data: Connection[];
    }>('/connections/pending');

    return response.data.data;
  },

  /**
   * Get sent connection requests (outgoing)
   */
  async getSentRequests() {
    const response = await api.get<{
      success: boolean;
      data: Connection[];
    }>('/connections/sent');

    return response.data.data;
  },

  /**
   * Get connection statistics
   */
  async getStats() {
    const response = await api.get<{
      success: boolean;
      data: ConnectionStats;
    }>('/connections/stats');

    return response.data.data;
  },

  /**
   * Get connection by ID
   */
  async getById(id: string) {
    const response = await api.get<{
      success: boolean;
      data: Connection;
    }>(`/connections/${id}`);

    return response.data.data;
  },

  /**
   * Send a connection request
   */
  async sendRequest(data: CreateConnectionData) {
    const response = await api.post<{
      success: boolean;
      data: Connection;
    }>('/connections', data);

    return response.data.data;
  },

  /**
   * Accept a connection request
   */
  async acceptRequest(id: string) {
    const response = await api.post<{
      success: boolean;
      data: Connection;
    }>(`/connections/${id}/accept`);

    return response.data.data;
  },

  /**
   * Reject a connection request
   */
  async rejectRequest(id: string) {
    const response = await api.post<{
      success: boolean;
      data: Connection;
    }>(`/connections/${id}/reject`);

    return response.data.data;
  },

  /**
   * Cancel a sent connection request
   */
  async cancelRequest(id: string) {
    const response = await api.delete<{
      success: boolean;
      message: string;
    }>(`/connections/${id}`);

    return response.data;
  },

  /**
   * Remove a connection
   */
  async removeConnection(id: string) {
    const response = await api.delete<{
      success: boolean;
      message: string;
    }>(`/connections/${id}`);

    return response.data;
  },

  /**
   * Block a user
   */
  async blockUser(userId: string) {
    const response = await api.post<{
      success: boolean;
      message: string;
    }>(`/connections/block/${userId}`);

    return response.data;
  },

  /**
   * Unblock a user
   */
  async unblockUser(userId: string) {
    const response = await api.post<{
      success: boolean;
      message: string;
    }>(`/connections/unblock/${userId}`);

    return response.data;
  },

  /**
   * Search for users to connect with
   */
  async searchUsers(query: string) {
    const response = await api.get<{
      success: boolean;
      data: Array<{
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        jobTitle?: string;
        department?: string;
        organization?: {
          id: string;
          name: string;
        };
        isConnected: boolean;
        hasPendingRequest: boolean;
      }>;
    }>(`/connections/search?q=${encodeURIComponent(query)}`);

    return response.data.data;
  },
};
