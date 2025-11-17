export enum OrganizationMemberRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER',
}

export interface Organization {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    members: number;
    proposals: number;
    contracts: number;
  };
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: OrganizationMemberRole;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  joinedAt: string;
}

export interface CreateOrganizationData {
  name: string;
  description?: string;
}

export interface UpdateOrganizationData {
  name?: string;
  description?: string;
}

export interface InviteMemberData {
  email: string;
  role: OrganizationMemberRole;
}
