export enum ReminderType {
  OBLIGATION = 'OBLIGATION',
  MILESTONE = 'MILESTONE',
  CONTRACT_EXPIRATION = 'CONTRACT_EXPIRATION',
  SIGNATURE_REQUEST = 'SIGNATURE_REQUEST',
  REVIEW_DUE = 'REVIEW_DUE',
  PAYMENT_DUE = 'PAYMENT_DUE',
  RENEWAL = 'RENEWAL',
  CUSTOM = 'CUSTOM',
}

export enum ReminderStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  OVERDUE = 'OVERDUE',
}

export enum ReminderPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export interface Reminder {
  id: string;
  type: ReminderType;
  status: ReminderStatus;
  priority: ReminderPriority;
  title: string;
  description?: string;
  dueDate: string;
  reminderDate: string;
  userId: string;
  contractId?: string;
  proposalId?: string;
  obligationId?: string;
  milestoneId?: string;
  contract?: {
    id: string;
    title: string;
    status: string;
  };
  proposal?: {
    id: string;
    title: string;
    status: string;
  };
  isRecurring: boolean;
  recurringFrequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReminderData {
  type: ReminderType;
  priority: ReminderPriority;
  title: string;
  description?: string;
  dueDate: string;
  reminderDate: string;
  contractId?: string;
  proposalId?: string;
  obligationId?: string;
  milestoneId?: string;
  isRecurring?: boolean;
  recurringFrequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
}

export interface UpdateReminderData {
  type?: ReminderType;
  priority?: ReminderPriority;
  title?: string;
  description?: string;
  dueDate?: string;
  reminderDate?: string;
  status?: ReminderStatus;
  isRecurring?: boolean;
  recurringFrequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
}

export interface ReminderFilters {
  type?: ReminderType;
  status?: ReminderStatus;
  priority?: ReminderPriority;
  startDate?: string;
  endDate?: string;
  contractId?: string;
  proposalId?: string;
  search?: string;
}
