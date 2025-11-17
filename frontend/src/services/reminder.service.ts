import api from '../lib/api';
import { Reminder, CreateReminderData, UpdateReminderData, ReminderFilters } from '../types/reminder.types';

export const reminderService = {
  /**
   * Get all reminders with optional filters
   */
  async getAll(filters?: ReminderFilters, page = 1, limit = 50) {
    const params = new URLSearchParams();

    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.contractId) params.append('contractId', filters.contractId);
    if (filters?.proposalId) params.append('proposalId', filters.proposalId);
    if (filters?.search) params.append('search', filters.search);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await api.get<{
      success: boolean;
      data: {
        reminders: Reminder[];
        total: number;
        page: number;
        totalPages: number;
      };
    }>(`/reminders?${params.toString()}`);

    return response.data.data;
  },

  /**
   * Get upcoming reminders (next 7 days)
   */
  async getUpcoming() {
    const response = await api.get<{
      success: boolean;
      data: Reminder[];
    }>('/reminders/upcoming');

    return response.data.data;
  },

  /**
   * Get overdue reminders
   */
  async getOverdue() {
    const response = await api.get<{
      success: boolean;
      data: Reminder[];
    }>('/reminders/overdue');

    return response.data.data;
  },

  /**
   * Get reminder by ID
   */
  async getById(id: string) {
    const response = await api.get<{
      success: boolean;
      data: Reminder;
    }>(`/reminders/${id}`);

    return response.data.data;
  },

  /**
   * Create a new reminder
   */
  async create(data: CreateReminderData) {
    const response = await api.post<{
      success: boolean;
      data: Reminder;
    }>('/reminders', data);

    return response.data.data;
  },

  /**
   * Update a reminder
   */
  async update(id: string, data: UpdateReminderData) {
    const response = await api.patch<{
      success: boolean;
      data: Reminder;
    }>(`/reminders/${id}`, data);

    return response.data.data;
  },

  /**
   * Delete a reminder
   */
  async delete(id: string) {
    const response = await api.delete<{
      success: boolean;
      message: string;
    }>(`/reminders/${id}`);

    return response.data;
  },

  /**
   * Mark reminder as completed
   */
  async markComplete(id: string) {
    const response = await api.post<{
      success: boolean;
      data: Reminder;
    }>(`/reminders/${id}/complete`);

    return response.data.data;
  },

  /**
   * Snooze a reminder
   */
  async snooze(id: string, snoozeUntil: string) {
    const response = await api.post<{
      success: boolean;
      data: Reminder;
    }>(`/reminders/${id}/snooze`, { snoozeUntil });

    return response.data.data;
  },

  /**
   * Get reminders for a specific contract
   */
  async getContractReminders(contractId: string) {
    const response = await api.get<{
      success: boolean;
      data: Reminder[];
    }>(`/reminders/contract/${contractId}`);

    return response.data.data;
  },

  /**
   * Get reminders for a specific proposal
   */
  async getProposalReminders(proposalId: string) {
    const response = await api.get<{
      success: boolean;
      data: Reminder[];
    }>(`/reminders/proposal/${proposalId}`);

    return response.data.data;
  },
};
