import { PrismaClient, Message, MessageType } from '@prisma/client';
import { auditLog } from './audit.service';

const prisma = new PrismaClient();

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CreateMessageData {
  connectionId: string;
  content: string;
  messageType?: MessageType;
  proposalId?: string;
  attachments?: string[];
}

export interface UpdateMessageData {
  content: string;
}

// ============================================================================
// SERVICE FUNCTIONS
// ============================================================================

export async function createMessage(
  senderId: string,
  data: CreateMessageData,
  ipAddress: string
): Promise<Message> {
  // Verify the user is part of the connection
  const connection = await prisma.connection.findFirst({
    where: {
      id: data.connectionId,
      OR: [{ initiatorId: senderId }, { recipientId: senderId }],
    },
  });

  if (!connection) {
    throw new Error('Connection not found or access denied');
  }

  const message = await prisma.message.create({
    data: {
      connectionId: data.connectionId,
      senderId,
      content: data.content,
      messageType: data.messageType || MessageType.TEXT,
      proposalId: data.proposalId,
      attachments: data.attachments || [],
    },
    include: {
      sender: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      proposal: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  await auditLog(senderId, 'MESSAGE_SENT', 'message', message.id, ipAddress, 'Mozilla/5.0', {
    connectionId: data.connectionId,
    messageType: data.messageType,
  });

  return message;
}

export async function updateMessage(
  id: string,
  senderId: string,
  data: UpdateMessageData,
  ipAddress: string
): Promise<Message> {
  // Verify ownership
  const existing = await prisma.message.findFirst({
    where: { id, senderId },
  });

  if (!existing) {
    throw new Error('Message not found or access denied');
  }

  const message = await prisma.message.update({
    where: { id },
    data: {
      content: data.content,
      isEdited: true,
      editedAt: new Date(),
    },
    include: {
      sender: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      proposal: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  await auditLog(senderId, 'MESSAGE_UPDATED', 'message', id, ipAddress, 'Mozilla/5.0');

  return message;
}

export async function deleteMessage(id: string, senderId: string, ipAddress: string): Promise<void> {
  // Verify ownership
  const existing = await prisma.message.findFirst({
    where: { id, senderId },
  });

  if (!existing) {
    throw new Error('Message not found or access denied');
  }

  await prisma.message.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });

  await auditLog(senderId, 'MESSAGE_DELETED', 'message', id, ipAddress, 'Mozilla/5.0');
}

export async function getConnectionMessages(
  connectionId: string,
  userId: string,
  page: number = 1,
  limit: number = 50
): Promise<{ messages: Message[]; total: number; totalPages: number }> {
  // Verify the user is part of the connection
  const connection = await prisma.connection.findFirst({
    where: {
      id: connectionId,
      OR: [{ initiatorId: userId }, { recipientId: userId }],
    },
  });

  if (!connection) {
    throw new Error('Connection not found or access denied');
  }

  const skip = (page - 1) * limit;

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where: {
        connectionId,
        isDeleted: false,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        proposal: {
          select: {
            id: true,
            title: true,
          },
        },
        readBy: {
          select: {
            userId: true,
            readAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.message.count({
      where: {
        connectionId,
        isDeleted: false,
      },
    }),
  ]);

  return {
    messages,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export async function markMessageAsRead(messageId: string, userId: string): Promise<void> {
  // Verify the message exists and user has access
  const message = await prisma.message.findFirst({
    where: {
      id: messageId,
      connection: {
        OR: [{ initiatorId: userId }, { recipientId: userId }],
      },
    },
  });

  if (!message) {
    throw new Error('Message not found or access denied');
  }

  // Don't mark as read if user is the sender
  if (message.senderId === userId) {
    return;
  }

  // Check if already marked as read
  const existing = await prisma.messageRead.findUnique({
    where: {
      messageId_userId: {
        messageId,
        userId,
      },
    },
  });

  if (existing) {
    return;
  }

  await prisma.messageRead.create({
    data: {
      messageId,
      userId,
    },
  });
}

export async function getUnreadCount(userId: string): Promise<number> {
  // Get all connections for this user
  const connections = await prisma.connection.findMany({
    where: {
      OR: [{ initiatorId: userId }, { recipientId: userId }],
      status: 'ACTIVE',
    },
    select: { id: true },
  });

  const connectionIds = connections.map((c) => c.id);

  // Count unread messages
  const unreadCount = await prisma.message.count({
    where: {
      connectionId: { in: connectionIds },
      senderId: { not: userId },
      isDeleted: false,
      readBy: {
        none: {
          userId,
        },
      },
    },
  });

  return unreadCount;
}

export async function getUserConversations(
  userId: string
): Promise<
  Array<{
    connectionId: string;
    otherUser: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    lastMessage: Message | null;
    unreadCount: number;
  }>
> {
  // Get all connections for this user
  const connections = await prisma.connection.findMany({
    where: {
      OR: [{ initiatorId: userId }, { recipientId: userId }],
      status: 'ACTIVE',
    },
    include: {
      initiator: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      recipient: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  const conversations = await Promise.all(
    connections.map(async (connection) => {
      const otherUser = connection.initiatorId === userId ? connection.recipient : connection.initiator;

      // Get last message
      const lastMessage = await prisma.message.findFirst({
        where: {
          connectionId: connection.id,
          isDeleted: false,
        },
        orderBy: { createdAt: 'desc' },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      // Count unread messages
      const unreadCount = await prisma.message.count({
        where: {
          connectionId: connection.id,
          senderId: { not: userId },
          isDeleted: false,
          readBy: {
            none: {
              userId,
            },
          },
        },
      });

      return {
        connectionId: connection.id,
        otherUser,
        lastMessage,
        unreadCount,
      };
    })
  );

  // Sort by last message date
  conversations.sort((a, b) => {
    const aDate = a.lastMessage?.createdAt || new Date(0);
    const bDate = b.lastMessage?.createdAt || new Date(0);
    return bDate.getTime() - aDate.getTime();
  });

  return conversations;
}
