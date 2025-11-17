import express from 'express';
import * as messageController from '../controllers/message.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all conversations for current user
router.get('/conversations', messageController.getConversations);

// Get unread message count
router.get('/unread-count', messageController.getUnreadCount);

// Create a new message
router.post('/', messageController.createMessage);

// Get messages for a specific connection
router.get('/connection/:connectionId', messageController.getConnectionMessages);

// Mark a message as read
router.post('/:id/read', messageController.markAsRead);

// Update a message
router.put('/:id', messageController.updateMessage);

// Delete a message
router.delete('/:id', messageController.deleteMessage);

export default router;
