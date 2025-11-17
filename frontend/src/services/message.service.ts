import api from '../lib/api';
import { Message, CreateMessageData, MessageThread, MessageFilters } from '../types/message.types';

export const messageService = {
  /**
   * Get inbox messages
   */
  async getInbox(filters?: MessageFilters, page = 1, limit = 20) {
    const params = new URLSearchParams();

    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.contractId) params.append('contractId', filters.contractId);
    if (filters?.proposalId) params.append('proposalId', filters.proposalId);
    if (filters?.senderId) params.append('senderId', filters.senderId);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await api.get<{
      success: boolean;
      data: {
        messages: Message[];
        total: number;
        page: number;
        totalPages: number;
      };
    }>(`/messages/inbox?${params.toString()}`);

    return response.data.data;
  },

  /**
   * Get sent messages
   */
  async getSent(filters?: MessageFilters, page = 1, limit = 20) {
    const params = new URLSearchParams();

    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.contractId) params.append('contractId', filters.contractId);
    if (filters?.proposalId) params.append('proposalId', filters.proposalId);
    if (filters?.recipientId) params.append('recipientId', filters.recipientId);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await api.get<{
      success: boolean;
      data: {
        messages: Message[];
        total: number;
        page: number;
        totalPages: number;
      };
    }>(`/messages/sent?${params.toString()}`);

    return response.data.data;
  },

  /**
   * Get message by ID
   */
  async getById(id: string) {
    const response = await api.get<{
      success: boolean;
      data: Message;
    }>(`/messages/${id}`);

    return response.data.data;
  },

  /**
   * Send a new message
   */
  async send(data: CreateMessageData) {
    const response = await api.post<{
      success: boolean;
      data: Message;
    }>('/messages', data);

    return response.data.data;
  },

  /**
   * Reply to a message
   */
  async reply(parentMessageId: string, body: string) {
    const response = await api.post<{
      success: boolean;
      data: Message;
    }>(`/messages/${parentMessageId}/reply`, { body });

    return response.data.data;
  },

  /**
   * Mark message as read
   */
  async markRead(id: string) {
    const response = await api.patch<{
      success: boolean;
      data: Message;
    }>(`/messages/${id}/read`);

    return response.data.data;
  },

  /**
   * Mark message as unread
   */
  async markUnread(id: string) {
    const response = await api.patch<{
      success: boolean;
      data: Message;
    }>(`/messages/${id}/unread`);

    return response.data.data;
  },

  /**
   * Archive a message
   */
  async archive(id: string) {
    const response = await api.patch<{
      success: boolean;
      data: Message;
    }>(`/messages/${id}/archive`);

    return response.data.data;
  },

  /**
   * Delete a message
   */
  async delete(id: string) {
    const response = await api.delete<{
      success: boolean;
      message: string;
    }>(`/messages/${id}`);

    return response.data;
  },

  /**
   * Get message thread
   */
  async getThread(messageId: string) {
    const response = await api.get<{
      success: boolean;
      data: Message[];
    }>(`/messages/${messageId}/thread`);

    return response.data.data;
  },

  /**
   * Get all message threads
   */
  async getThreads() {
    const response = await api.get<{
      success: boolean;
      data: MessageThread[];
    }>('/messages/threads');

    return response.data.data;
  },

  /**
   * Get unread message count
   */
  async getUnreadCount() {
    const response = await api.get<{
      success: boolean;
      data: { count: number };
    }>('/messages/unread/count');

    return response.data.data.count;
  },

  /**
   * Get messages for a specific contract
   */
  async getContractMessages(contractId: string) {
    const response = await api.get<{
      success: boolean;
      data: Message[];
    }>(`/messages/contract/${contractId}`);

    return response.data.data;
  },

  /**
   * Get messages for a specific proposal
   */
  async getProposalMessages(proposalId: string) {
    const response = await api.get<{
      success: boolean;
      data: Message[];
    }>(`/messages/proposal/${proposalId}`);

    return response.data.data;
  },
};
