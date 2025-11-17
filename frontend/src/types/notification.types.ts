export enum NotificationType {
  PROPOSAL_SHARED = 'PROPOSAL_SHARED',
  COMMENT_ADDED = 'COMMENT_ADDED',
  COMMENT_REPLY = 'COMMENT_REPLY',
  PROPOSAL_STATUS_CHANGED = 'PROPOSAL_STATUS_CHANGED',
  COLLABORATOR_ADDED = 'COLLABORATOR_ADDED',
  SIGNATURE_REQUESTED = 'SIGNATURE_REQUESTED',
  SIGNATURE_COMPLETED = 'SIGNATURE_COMPLETED',
  DOCUMENT_UPLOADED = 'DOCUMENT_UPLOADED',
  CONNECTION_REQUEST = 'CONNECTION_REQUEST',
  CONNECTION_ACCEPTED = 'CONNECTION_ACCEPTED',
  MENTION = 'MENTION',
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}
