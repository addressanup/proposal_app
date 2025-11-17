export enum AmendmentType {
  EXTENSION = 'EXTENSION',
  VALUE_CHANGE = 'VALUE_CHANGE',
  SCOPE_CHANGE = 'SCOPE_CHANGE',
  TERMINATION_CLAUSE = 'TERMINATION_CLAUSE',
  PAYMENT_TERMS = 'PAYMENT_TERMS',
  DELIVERABLES = 'DELIVERABLES',
  PARTY_CHANGE = 'PARTY_CHANGE',
  OTHER = 'OTHER',
}

export enum AmendmentStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  EFFECTIVE = 'EFFECTIVE',
  SUPERSEDED = 'SUPERSEDED',
}

export interface Amendment {
  id: string;
  contractId: string;
  amendmentNumber: number;
  type: AmendmentType;
  status: AmendmentStatus;
  title: string;
  description: string;
  changesDescription?: string;
  effectiveDate?: string;
  oldValue?: string;
  newValue?: string;
  approvedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  approvedAt?: string;
  rejectedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  rejectedAt?: string;
  rejectionReason?: string;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateAmendmentData {
  contractId: string;
  type: AmendmentType;
  title: string;
  description: string;
  changesDescription?: string;
  effectiveDate?: string;
  oldValue?: string;
  newValue?: string;
}

export interface UpdateAmendmentData {
  type?: AmendmentType;
  title?: string;
  description?: string;
  changesDescription?: string;
  effectiveDate?: string;
  oldValue?: string;
  newValue?: string;
  status?: AmendmentStatus;
}

export interface AmendmentFilters {
  type?: AmendmentType;
  status?: AmendmentStatus;
  search?: string;
}
