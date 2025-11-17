export enum MessageStatus {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  ARCHIVED = 'ARCHIVED',
}

export enum MessagePriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export interface Message {
  id: string;
  subject: string;
  body: string;
  senderId: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  recipientId: string;
  recipient: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  status: MessageStatus;
  priority: MessagePriority;
  contractId?: string;
  proposalId?: string;
  contract?: {
    id: string;
    title: string;
  };
  proposal?: {
    id: string;
    title: string;
  };
  parentMessageId?: string;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMessageData {
  recipientId: string;
  subject: string;
  body: string;
  priority?: MessagePriority;
  contractId?: string;
  proposalId?: string;
  parentMessageId?: string;
}

export interface MessageThread {
  id: string;
  subject: string;
  participants: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  }[];
  lastMessage: Message;
  messageCount: number;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MessageFilters {
  status?: MessageStatus;
  priority?: MessagePriority;
  search?: string;
  contractId?: string;
  proposalId?: string;
  senderId?: string;
  recipientId?: string;
}
