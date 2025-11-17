import express from 'express';
import * as reminderController from '../controllers/reminder.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Create a new reminder
router.post('/', reminderController.createReminder);

// Get all reminders for current user (with filters and pagination)
router.get('/', reminderController.getUserReminders);

// Get upcoming reminders
router.get('/upcoming', reminderController.getUpcomingReminders);

// Get overdue reminders
router.get('/overdue', reminderController.getOverdueReminders);

// Get a specific reminder by ID
router.get('/:id', reminderController.getReminderById);

// Update a reminder
router.put('/:id', reminderController.updateReminder);

// Delete a reminder
router.delete('/:id', reminderController.deleteReminder);

// Mark reminder as complete
router.post('/:id/complete', reminderController.markComplete);

// Snooze reminder
router.post('/:id/snooze', reminderController.snoozeReminder);

export default router;
