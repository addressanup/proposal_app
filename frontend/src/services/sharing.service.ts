import api from '../lib/api';

export enum ShareLinkType {
  PUBLIC = 'PUBLIC',
  EMAIL_SPECIFIC = 'EMAIL_SPECIFIC',
  ONE_TIME = 'ONE_TIME',
  PASSWORD_PROTECTED = 'PASSWORD_PROTECTED',
}

export enum LinkAction {
  VIEWED = 'VIEWED',
  DOWNLOADED = 'DOWNLOADED',
  COMMENTED = 'COMMENTED',
  SIGNED = 'SIGNED',
}

export interface ShareLink {
  id: string;
  proposalId: string;
  linkType: ShareLinkType;
  token: string;
  expiresAt?: string;
  recipientEmail?: string;
  recipientName?: string;
  authorizedEmails?: string[];
  password?: string;
  canComment: boolean;
  canDownload: boolean;
  canSign: boolean;
  viewCount: number;
  message?: string;
  createdBy: string;
  createdAt: string;
  isRevoked: boolean;
}

export interface CreateShareLinkData {
  proposalId: string;
  linkType: ShareLinkType;
  recipientEmail?: string;
  recipientName?: string;
  password?: string;
  expiresAt?: Date;
  canComment: boolean;
  canDownload: boolean;
  canSign: boolean;
  message?: string;
}

export interface SharedProposalInfo {
  id: string;
  title: string;
  status: string;
  content: string;
  canComment: boolean;
  canDownload: boolean;
  canSign: boolean;
  requiresPassword: boolean;
  recipientEmail?: string;
}

export interface AccessLinkData {
  email?: string;
  password?: string;
}

export interface LogActionData {
  action: LinkAction;
  metadata?: Record<string, any>;
}

export const sharingService = {
  /**
   * Create a new share link for a proposal
   */
  async createShareLink(data: CreateShareLinkData): Promise<ShareLink> {
    const response = await api.post<{ success: boolean; data: ShareLink }>(
      '/sharing/links',
      data
    );
    return response.data.data;
  },

  /**
   * Get all share links for a proposal
   */
  async getProposalShareLinks(proposalId: string): Promise<ShareLink[]> {
    const response = await api.get<{ success: boolean; data: ShareLink[] }>(
      `/sharing/proposals/${proposalId}/share-links`
    );
    return response.data.data;
  },

  /**
   * Revoke a share link
   */
  async revokeShareLink(shareLinkId: string): Promise<void> {
    await api.delete(`/sharing/links/${shareLinkId}`);
  },

  /**
   * Get proposal info via share link token (public)
   */
  async getSharedProposalInfo(token: string): Promise<SharedProposalInfo> {
    const response = await api.get<{ success: boolean; data: SharedProposalInfo }>(
      `/sharing/preview/${token}`
    );
    return response.data.data;
  },

  /**
   * Access a proposal via share link token (public)
   */
  async accessProposalViaLink(token: string, data: AccessLinkData): Promise<SharedProposalInfo> {
    const response = await api.post<{ success: boolean; data: SharedProposalInfo }>(
      `/sharing/access/${token}`,
      data
    );
    return response.data.data;
  },

  /**
   * Log an action on a share link (public)
   */
  async logLinkAction(token: string, data: LogActionData): Promise<void> {
    await api.post(`/sharing/log-action/${token}`, data);
  },
};
