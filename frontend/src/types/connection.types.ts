export enum ConnectionStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  BLOCKED = 'BLOCKED',
}

export interface Connection {
  id: string;
  requesterId: string;
  requester: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    jobTitle?: string;
    department?: string;
    organization?: {
      id: string;
      name: string;
    };
  };
  addresseeId: string;
  addressee: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    jobTitle?: string;
    department?: string;
    organization?: {
      id: string;
      name: string;
    };
  };
  status: ConnectionStatus;
  message?: string;
  createdAt: string;
  updatedAt: string;
  acceptedAt?: string;
  rejectedAt?: string;
}

export interface CreateConnectionData {
  addresseeId: string;
  message?: string;
}

export interface ConnectionFilters {
  status?: ConnectionStatus;
  search?: string;
}

export interface ConnectionStats {
  total: number;
  accepted: number;
  pending: number;
  sentRequests: number;
}
