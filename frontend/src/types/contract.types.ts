import { ContractType, ContractCategory } from './template.types';

// Re-export types from template.types for convenience
export { ContractType, ContractCategory } from './template.types';

export enum ContractStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  PENDING_SIGNATURE = 'PENDING_SIGNATURE',
  PARTIALLY_SIGNED = 'PARTIALLY_SIGNED',
  FULLY_EXECUTED = 'FULLY_EXECUTED',
  ACTIVE = 'ACTIVE',
  EXPIRING_SOON = 'EXPIRING_SOON',
  EXPIRED = 'EXPIRED',
  RENEWED = 'RENEWED',
  AMENDED = 'AMENDED',
  TERMINATED = 'TERMINATED',
  ARCHIVED = 'ARCHIVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export enum CounterpartyRole {
  EMPLOYEE = 'EMPLOYEE',
  EMPLOYER = 'EMPLOYER',
  VENDOR = 'VENDOR',
  CLIENT = 'CLIENT',
  BUYER = 'BUYER',
  SELLER = 'SELLER',
  LESSOR = 'LESSOR',
  LESSEE = 'LESSEE',
  LICENSOR = 'LICENSOR',
  LICENSEE = 'LICENSEE',
  PARTNER = 'PARTNER',
  CONSULTANT = 'CONSULTANT',
  CONTRACTOR = 'CONTRACTOR',
  OTHER = 'OTHER',
}

export enum ObligationType {
  PAYMENT = 'PAYMENT',
  DELIVERY = 'DELIVERY',
  PERFORMANCE = 'PERFORMANCE',
  REPORTING = 'REPORTING',
  COMPLIANCE = 'COMPLIANCE',
  INSURANCE = 'INSURANCE',
  WARRANTY = 'WARRANTY',
  MAINTENANCE = 'MAINTENANCE',
  RENEWAL_DECISION = 'RENEWAL_DECISION',
  OTHER = 'OTHER',
}

export enum ObligationStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

export interface Counterparty {
  id: string;
  name: string;
  role: CounterpartyRole;
  type: 'INDIVIDUAL' | 'COMPANY' | 'GOVERNMENT';
  email?: string;
  phone?: string;
  address?: string;
  isPrimary: boolean;
  status: string;
  signedAt?: string;
}

export interface Obligation {
  id: string;
  title: string;
  description?: string;
  type: ObligationType;
  responsibleParty: 'ORGANIZATION' | 'COUNTERPARTY';
  status: ObligationStatus;
  dueDate?: string;
  completedAt?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface Milestone {
  id: string;
  name: string;
  description?: string;
  sequence: number;
  dueDate?: string;
  status: string;
  paymentAmount?: number;
}

export interface Contract {
  id: string;
  title: string;
  description?: string;
  content: string;
  contractType: ContractType;
  category: ContractCategory;
  status: ContractStatus;
  templateId?: string;
  templateFields?: Record<string, any>;
  organizationId: string;
  organization?: {
    id: string;
    name: string;
  };
  creatorId: string;
  creator?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  contractValue?: number;
  totalValue?: number; // Alias for contractValue
  currency: string;
  effectiveDate?: string;
  expirationDate?: string;
  renewalDate?: string;
  terminationDate?: string;
  autoRenew: boolean;
  renewalTermMonths?: number;
  counterparties: Counterparty[];
  obligations: Obligation[];
  milestones: Milestone[];
  versions: any[];
  _count?: {
    counterparties: number;
    obligations: number;
    milestones: number;
    versions: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateContractFromTemplateData {
  templateId: string;
  organizationId?: string;
  title: string;
  description?: string;
  fieldValues: Record<string, any>;
  contractType?: ContractType;
  category?: ContractCategory;
  contractValue?: number;
  currency?: string;
  effectiveDate?: string;
  expirationDate?: string;
  counterparties?: Array<{
    name: string;
    role: CounterpartyRole;
    type: 'INDIVIDUAL' | 'COMPANY' | 'GOVERNMENT';
    email?: string;
  }>;
  tags?: string[];
}

export interface ContractFilters {
  organizationId?: string;
  contractType?: ContractType;
  category?: ContractCategory;
  status?: ContractStatus;
  search?: string;
  tags?: string[];
  expiringInDays?: number;
}

export interface ContractStatistics {
  totalContracts: number;
  activeContracts: number;
  expiringContracts: number;
  pendingApproval: number;
  pendingSignature: number;
  totalValue: number;
  contractsByType: Array<{
    contractType: ContractType;
    _count: number;
  }>;
  contractsByStatus: Array<{
    status: ContractStatus;
    _count: number;
  }>;
}
