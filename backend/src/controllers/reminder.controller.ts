import { Request, Response } from 'express';
import * as reminderService from '../services/reminder.service';
import { ReminderType, ReminderStatus, ReminderPriority, RecurringFrequency } from '@prisma/client';

// Create a new reminder
export async function createReminder(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';

    const data: reminderService.CreateReminderData = {
      type: req.body.type as ReminderType,
      priority: req.body.priority as ReminderPriority,
      title: req.body.title,
      description: req.body.description,
      dueDate: new Date(req.body.dueDate),
      reminderDate: new Date(req.body.reminderDate),
      contractId: req.body.contractId,
      proposalId: req.body.proposalId,
      obligationId: req.body.obligationId,
      milestoneId: req.body.milestoneId,
      isRecurring: req.body.isRecurring,
      recurringFrequency: req.body.recurringFrequency as RecurringFrequency,
    };

    const reminder = await reminderService.createReminder(userId, data, ipAddress);

    res.status(201).json({
      message: 'Reminder created successfully',
      data: reminder,
    });
  } catch (error: any) {
    console.error('Create reminder error:', error);
    res.status(400).json({ message: error.message || 'Failed to create reminder' });
  }
}

// Get all reminders for the current user
export async function getUserReminders(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const filters: reminderService.ReminderFilters = {};

    if (req.query.type) {
      filters.type = req.query.type as ReminderType;
    }

    if (req.query.status) {
      filters.status = req.query.status as ReminderStatus;
    }

    if (req.query.priority) {
      filters.priority = req.query.priority as ReminderPriority;
    }

    if (req.query.contractId) {
      filters.contractId = req.query.contractId as string;
    }

    if (req.query.proposalId) {
      filters.proposalId = req.query.proposalId as string;
    }

    if (req.query.startDate) {
      filters.startDate = new Date(req.query.startDate as string);
    }

    if (req.query.endDate) {
      filters.endDate = new Date(req.query.endDate as string);
    }

    if (req.query.search) {
      filters.search = req.query.search as string;
    }

    const result = await reminderService.getUserReminders(userId, filters, page, limit);

    res.json(result);
  } catch (error: any) {
    console.error('Get reminders error:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch reminders' });
  }
}

// Get a specific reminder by ID
export async function getReminderById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const reminder = await reminderService.getReminderById(id, userId);

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    res.json(reminder);
  } catch (error: any) {
    console.error('Get reminder error:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch reminder' });
  }
}

// Update a reminder
export async function updateReminder(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';

    const data: reminderService.UpdateReminderData = {};

    if (req.body.type) data.type = req.body.type as ReminderType;
    if (req.body.priority) data.priority = req.body.priority as ReminderPriority;
    if (req.body.title) data.title = req.body.title;
    if (req.body.description !== undefined) data.description = req.body.description;
    if (req.body.dueDate) data.dueDate = new Date(req.body.dueDate);
    if (req.body.reminderDate) data.reminderDate = new Date(req.body.reminderDate);
    if (req.body.status) data.status = req.body.status as ReminderStatus;
    if (req.body.isRecurring !== undefined) data.isRecurring = req.body.isRecurring;
    if (req.body.recurringFrequency) data.recurringFrequency = req.body.recurringFrequency as RecurringFrequency;

    const reminder = await reminderService.updateReminder(id, userId, data, ipAddress);

    res.json({
      message: 'Reminder updated successfully',
      data: reminder,
    });
  } catch (error: any) {
    console.error('Update reminder error:', error);
    res.status(400).json({ message: error.message || 'Failed to update reminder' });
  }
}

// Delete a reminder
export async function deleteReminder(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';

    await reminderService.deleteReminder(id, userId, ipAddress);

    res.json({ message: 'Reminder deleted successfully' });
  } catch (error: any) {
    console.error('Delete reminder error:', error);
    res.status(400).json({ message: error.message || 'Failed to delete reminder' });
  }
}

// Get upcoming reminders
export async function getUpcomingReminders(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const days = parseInt(req.query.days as string) || 7;

    const reminders = await reminderService.getUpcomingReminders(userId, days);

    res.json(reminders);
  } catch (error: any) {
    console.error('Get upcoming reminders error:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch upcoming reminders' });
  }
}

// Get overdue reminders
export async function getOverdueReminders(req: Request, res: Response) {
  try {
    const userId = req.user!.id;

    const reminders = await reminderService.getOverdueReminders(userId);

    res.json(reminders);
  } catch (error: any) {
    console.error('Get overdue reminders error:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch overdue reminders' });
  }
}

// Mark reminder as complete
export async function markComplete(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';

    const reminder = await reminderService.markReminderComplete(id, userId, ipAddress);

    res.json({
      message: 'Reminder marked as complete',
      data: reminder,
    });
  } catch (error: any) {
    console.error('Mark complete error:', error);
    res.status(400).json({ message: error.message || 'Failed to mark reminder as complete' });
  }
}

// Snooze reminder
export async function snoozeReminder(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';

    if (!req.body.snoozeUntil) {
      return res.status(400).json({ message: 'snoozeUntil date is required' });
    }

    const snoozeUntil = new Date(req.body.snoozeUntil);

    const reminder = await reminderService.snoozeReminder(id, userId, snoozeUntil, ipAddress);

    res.json({
      message: 'Reminder snoozed successfully',
      data: reminder,
    });
  } catch (error: any) {
    console.error('Snooze reminder error:', error);
    res.status(400).json({ message: error.message || 'Failed to snooze reminder' });
  }
}
