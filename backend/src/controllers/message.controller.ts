import { Request, Response } from 'express';
import * as messageService from '../services/message.service';
import { MessageType } from '@prisma/client';

// Create a new message
export async function createMessage(req: Request, res: Response) {
  try {
    const senderId = req.user!.id;
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';

    const data: messageService.CreateMessageData = {
      connectionId: req.body.connectionId,
      content: req.body.content,
      messageType: req.body.messageType as MessageType,
      proposalId: req.body.proposalId,
      attachments: req.body.attachments,
    };

    const message = await messageService.createMessage(senderId, data, ipAddress);

    res.status(201).json({
      message: 'Message sent successfully',
      data: message,
    });
  } catch (error: any) {
    console.error('Create message error:', error);
    res.status(400).json({ message: error.message || 'Failed to send message' });
  }
}

// Update a message
export async function updateMessage(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const senderId = req.user!.id;
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';

    const data: messageService.UpdateMessageData = {
      content: req.body.content,
    };

    const message = await messageService.updateMessage(id, senderId, data, ipAddress);

    res.json({
      message: 'Message updated successfully',
      data: message,
    });
  } catch (error: any) {
    console.error('Update message error:', error);
    res.status(400).json({ message: error.message || 'Failed to update message' });
  }
}

// Delete a message
export async function deleteMessage(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const senderId = req.user!.id;
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';

    await messageService.deleteMessage(id, senderId, ipAddress);

    res.json({ message: 'Message deleted successfully' });
  } catch (error: any) {
    console.error('Delete message error:', error);
    res.status(400).json({ message: error.message || 'Failed to delete message' });
  }
}

// Get messages for a connection
export async function getConnectionMessages(req: Request, res: Response) {
  try {
    const { connectionId } = req.params;
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const result = await messageService.getConnectionMessages(connectionId, userId, page, limit);

    res.json(result);
  } catch (error: any) {
    console.error('Get connection messages error:', error);
    res.status(400).json({ message: error.message || 'Failed to fetch messages' });
  }
}

// Mark message as read
export async function markAsRead(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    await messageService.markMessageAsRead(id, userId);

    res.json({ message: 'Message marked as read' });
  } catch (error: any) {
    console.error('Mark as read error:', error);
    res.status(400).json({ message: error.message || 'Failed to mark message as read' });
  }
}

// Get unread count
export async function getUnreadCount(req: Request, res: Response) {
  try {
    const userId = req.user!.id;

    const count = await messageService.getUnreadCount(userId);

    res.json({ count });
  } catch (error: any) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: error.message || 'Failed to get unread count' });
  }
}

// Get all conversations for the user
export async function getConversations(req: Request, res: Response) {
  try {
    const userId = req.user!.id;

    const conversations = await messageService.getUserConversations(userId);

    res.json(conversations);
  } catch (error: any) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch conversations' });
  }
}
