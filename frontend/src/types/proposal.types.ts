export enum ProposalStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  UNDER_NEGOTIATION = 'UNDER_NEGOTIATION',
  FINAL = 'FINAL',
  SIGNED = 'SIGNED',
  ARCHIVED = 'ARCHIVED',
  REJECTED = 'REJECTED',
}

export enum CollaboratorRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  COMMENTATOR = 'COMMENTATOR',
  VIEWER = 'VIEWER',
}

export interface Proposal {
  id: string;
  title: string;
  content: string;
  status: ProposalStatus;
  organizationId: string;
  creatorId: string;
  creator?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  currentVersion?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProposalCollaborator {
  id: string;
  proposalId: string;
  userId: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  role: CollaboratorRole;
  canComment: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canShare: boolean;
  createdAt: string;
}

export interface ProposalVersion {
  id: string;
  proposalId: string;
  versionNumber: number;
  title: string;
  content: string;
  changeDescription?: string;
  createdById: string;
  createdBy?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  diffFromPrevious?: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  proposalId: string;
  userId: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  content: string;
  parentId?: string;
  replies?: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProposalData {
  title: string;
  content: string;
  status?: ProposalStatus;
}

export interface UpdateProposalData {
  title?: string;
  content?: string;
  status?: ProposalStatus;
}

export interface ProposalFilters {
  status?: ProposalStatus;
  search?: string;
  creatorId?: string;
  organizationId?: string;
}

export interface AddCollaboratorData {
  userId: string;
  role: CollaboratorRole;
  canComment?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canShare?: boolean;
}

export interface CreateCommentData {
  content: string;
  parentId?: string;
}
