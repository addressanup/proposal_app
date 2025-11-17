import {
  PrismaClient,
  Reminder,
  ReminderType,
  ReminderStatus,
  ReminderPriority,
  RecurringFrequency,
} from '@prisma/client';
import { auditLog } from './audit.service';

const prisma = new PrismaClient();

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CreateReminderData {
  type: ReminderType;
  priority: ReminderPriority;
  title: string;
  description?: string;
  dueDate: Date;
  reminderDate: Date;
  contractId?: string;
  proposalId?: string;
  obligationId?: string;
  milestoneId?: string;
  isRecurring?: boolean;
  recurringFrequency?: RecurringFrequency;
}

export interface UpdateReminderData {
  type?: ReminderType;
  priority?: ReminderPriority;
  title?: string;
  description?: string;
  dueDate?: Date;
  reminderDate?: Date;
  status?: ReminderStatus;
  isRecurring?: boolean;
  recurringFrequency?: RecurringFrequency;
}

export interface ReminderFilters {
  type?: ReminderType;
  status?: ReminderStatus;
  priority?: ReminderPriority;
  startDate?: Date;
  endDate?: Date;
  contractId?: string;
  proposalId?: string;
  search?: string;
}

// ============================================================================
// SERVICE FUNCTIONS
// ============================================================================

export async function createReminder(
  userId: string,
  data: CreateReminderData,
  ipAddress: string
): Promise<Reminder> {
  const reminder = await prisma.reminder.create({
    data: {
      userId,
      type: data.type,
      priority: data.priority,
      title: data.title,
      description: data.description,
      dueDate: data.dueDate,
      reminderDate: data.reminderDate,
      contractId: data.contractId,
      proposalId: data.proposalId,
      obligationId: data.obligationId,
      milestoneId: data.milestoneId,
      isRecurring: data.isRecurring || false,
      recurringFrequency: data.recurringFrequency,
    },
    include: {
      contract: {
        select: { id: true, title: true, status: true },
      },
      proposal: {
        select: { id: true, title: true, status: true },
      },
    },
  });

  await auditLog(userId, 'REMINDER_CREATED', 'reminder', reminder.id, ipAddress, 'Mozilla/5.0', {
    type: data.type,
    priority: data.priority,
    title: data.title,
  });

  return reminder;
}

export async function updateReminder(
  id: string,
  userId: string,
  data: UpdateReminderData,
  ipAddress: string
): Promise<Reminder> {
  // Verify ownership
  const existing = await prisma.reminder.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new Error('Reminder not found or access denied');
  }

  const reminder = await prisma.reminder.update({
    where: { id },
    data: {
      ...(data.type && { type: data.type }),
      ...(data.priority && { priority: data.priority }),
      ...(data.title && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.dueDate && { dueDate: data.dueDate }),
      ...(data.reminderDate && { reminderDate: data.reminderDate }),
      ...(data.status && { status: data.status }),
      ...(data.isRecurring !== undefined && { isRecurring: data.isRecurring }),
      ...(data.recurringFrequency && { recurringFrequency: data.recurringFrequency }),
    },
    include: {
      contract: {
        select: { id: true, title: true, status: true },
      },
      proposal: {
        select: { id: true, title: true, status: true },
      },
    },
  });

  await auditLog(userId, 'REMINDER_UPDATED', 'reminder', id, ipAddress, 'Mozilla/5.0', {
    changes: Object.keys(data),
  });

  return reminder;
}

export async function deleteReminder(id: string, userId: string, ipAddress: string): Promise<void> {
  // Verify ownership
  const existing = await prisma.reminder.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new Error('Reminder not found or access denied');
  }

  await prisma.reminder.delete({
    where: { id },
  });

  await auditLog(userId, 'REMINDER_DELETED', 'reminder', id, ipAddress, 'Mozilla/5.0');
}

export async function getUserReminders(
  userId: string,
  filters: ReminderFilters = {},
  page: number = 1,
  limit: number = 20
): Promise<{ reminders: Reminder[]; total: number; totalPages: number }> {
  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {
    userId,
  };

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.priority) {
    where.priority = filters.priority;
  }

  if (filters.contractId) {
    where.contractId = filters.contractId;
  }

  if (filters.proposalId) {
    where.proposalId = filters.proposalId;
  }

  if (filters.startDate || filters.endDate) {
    where.dueDate = {};
    if (filters.startDate) {
      where.dueDate.gte = filters.startDate;
    }
    if (filters.endDate) {
      where.dueDate.lte = filters.endDate;
    }
  }

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const [reminders, total] = await Promise.all([
    prisma.reminder.findMany({
      where,
      include: {
        contract: {
          select: { id: true, title: true, status: true },
        },
        proposal: {
          select: { id: true, title: true, status: true },
        },
      },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
      skip,
      take: limit,
    }),
    prisma.reminder.count({ where }),
  ]);

  return {
    reminders,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getReminderById(id: string, userId: string): Promise<Reminder | null> {
  return await prisma.reminder.findFirst({
    where: { id, userId },
    include: {
      contract: {
        select: { id: true, title: true, status: true },
      },
      proposal: {
        select: { id: true, title: true, status: true },
      },
    },
  });
}

export async function getUpcomingReminders(
  userId: string,
  days: number = 7
): Promise<Reminder[]> {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + days);

  return await prisma.reminder.findMany({
    where: {
      userId,
      status: {
        notIn: [ReminderStatus.COMPLETED, ReminderStatus.CANCELLED],
      },
      reminderDate: {
        lte: endDate,
      },
    },
    include: {
      contract: {
        select: { id: true, title: true, status: true },
      },
      proposal: {
        select: { id: true, title: true, status: true },
      },
    },
    orderBy: { reminderDate: 'asc' },
  });
}

export async function getOverdueReminders(userId: string): Promise<Reminder[]> {
  const now = new Date();

  return await prisma.reminder.findMany({
    where: {
      userId,
      status: {
        notIn: [ReminderStatus.COMPLETED, ReminderStatus.CANCELLED],
      },
      dueDate: {
        lt: now,
      },
    },
    include: {
      contract: {
        select: { id: true, title: true, status: true },
      },
      proposal: {
        select: { id: true, title: true, status: true },
      },
    },
    orderBy: { dueDate: 'asc' },
  });
}

export async function markReminderComplete(
  id: string,
  userId: string,
  ipAddress: string
): Promise<Reminder> {
  // Verify ownership
  const existing = await prisma.reminder.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new Error('Reminder not found or access denied');
  }

  const reminder = await prisma.reminder.update({
    where: { id },
    data: {
      status: ReminderStatus.COMPLETED,
      completedAt: new Date(),
    },
    include: {
      contract: {
        select: { id: true, title: true, status: true },
      },
      proposal: {
        select: { id: true, title: true, status: true },
      },
    },
  });

  await auditLog(userId, 'REMINDER_COMPLETED', 'reminder', id, ipAddress, 'Mozilla/5.0');

  return reminder;
}

export async function snoozeReminder(
  id: string,
  userId: string,
  snoozeUntil: Date,
  ipAddress: string
): Promise<Reminder> {
  // Verify ownership
  const existing = await prisma.reminder.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new Error('Reminder not found or access denied');
  }

  const reminder = await prisma.reminder.update({
    where: { id },
    data: {
      reminderDate: snoozeUntil,
    },
    include: {
      contract: {
        select: { id: true, title: true, status: true },
      },
      proposal: {
        select: { id: true, title: true, status: true },
      },
    },
  });

  await auditLog(userId, 'REMINDER_SNOOZED', 'reminder', id, ipAddress, 'Mozilla/5.0', {
    snoozeUntil: snoozeUntil.toISOString(),
  });

  return reminder;
}
