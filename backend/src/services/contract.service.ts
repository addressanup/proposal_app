import { PrismaClient, Contract, ContractStatus, ContractType, ContractCategory, CounterpartyRole, ObligationType, ObligationStatus } from '@prisma/client';
import { populateTemplate } from './template.service';
import { auditLog } from '../utils/audit';

const prisma = new PrismaClient();

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CreateContractFromTemplateData {
  templateId: string;
  title: string;
  description?: string;
  fieldValues: Record<string, any>;
  contractType: ContractType;
  category: ContractCategory;
  subcategory?: string;

  // Financial
  contractValue?: number;
  currency?: string;

  // Dates
  effectiveDate?: Date;
  expirationDate?: Date;
  renewalDate?: Date;

  // Auto-renewal
  autoRenew?: boolean;
  renewalTermMonths?: number;
  renewalNoticeDays?: number;

  // Counterparties
  counterparties?: CounterpartyData[];

  // Obligations
  obligations?: ObligationData[];

  // Milestones
  milestones?: MilestoneData[];

  // Metadata
  jurisdiction?: string[];
  governingLaw?: string;
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface CreateContractData {
  title: string;
  description?: string;
  content: string;
  contractType: ContractType;
  category: ContractCategory;
  subcategory?: string;

  contractValue?: number;
  currency?: string;

  effectiveDate?: Date;
  expirationDate?: Date;
  renewalDate?: Date;

  autoRenew?: boolean;
  renewalTermMonths?: number;
  renewalNoticeDays?: number;

  counterparties?: CounterpartyData[];
  obligations?: ObligationData[];
  milestones?: MilestoneData[];

  jurisdiction?: string[];
  governingLaw?: string;
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface CounterpartyData {
  name: string;
  role: CounterpartyRole;
  type: 'INDIVIDUAL' | 'COMPANY' | 'GOVERNMENT';
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  registrationNumber?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface ObligationData {
  title: string;
  description?: string;
  type: ObligationType;
  responsibleParty: 'ORGANIZATION' | 'COUNTERPARTY';
  dueDate?: Date;
  recurringSchedule?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  alertDaysBefore?: number;
}

export interface MilestoneData {
  name: string;
  description?: string;
  dueDate?: Date;
  completionCriteria?: string;
  paymentAmount?: number;
  dependencies?: string;
}

export interface UpdateContractData {
  title?: string;
  description?: string;
  content?: string;
  status?: ContractStatus;

  contractValue?: number;
  currency?: string;

  effectiveDate?: Date;
  expirationDate?: Date;
  renewalDate?: Date;
  terminationDate?: Date;

  autoRenew?: boolean;
  renewalTermMonths?: number;
  renewalNoticeDays?: number;

  jurisdiction?: string[];
  governingLaw?: string;
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface ContractFilters {
  organizationId?: string;
  contractType?: ContractType;
  category?: ContractCategory;
  status?: ContractStatus;
  search?: string;
  tags?: string[];
  expiringInDays?: number;
  effectiveDateFrom?: Date;
  effectiveDateTo?: Date;
  minValue?: number;
  maxValue?: number;
  counterpartyName?: string;
}

// ============================================================================
// CONTRACT CREATION
// ============================================================================

/**
 * Create a contract from a template
 */
export const createContractFromTemplate = async (
  data: CreateContractFromTemplateData,
  userId: string,
  organizationId: string,
  ipAddress: string,
  userAgent: string
): Promise<Contract> => {
  // Verify template exists and user has access
  const template = await prisma.contractTemplate.findFirst({
    where: {
      id: data.templateId,
      isActive: true,
      OR: [
        { isGlobal: true },
        { organizationId }
      ]
    },
    include: {
      clauses: {
        orderBy: { position: 'asc' }
      }
    }
  });

  if (!template) {
    throw new Error('Template not found or access denied');
  }

  // Validate required fields
  const requiredFields = template.requiredFields as any;
  if (requiredFields && typeof requiredFields === 'object') {
    const missingFields = Object.keys(requiredFields).filter(
      field => !(field in data.fieldValues)
    );

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
  }

  // Populate template content with field values
  const populatedContent = populateTemplate(template.content, data.fieldValues);

  // Create contract with all relationships
  const contract = await prisma.contract.create({
    data: {
      // Basic Info
      title: data.title,
      description: data.description,
      content: populatedContent,
      contractType: data.contractType,
      category: data.category,
      subcategory: data.subcategory,
      status: ContractStatus.DRAFT,

      // Template Reference
      templateId: template.id,
      templateFields: data.fieldValues,

      // Organization & Creator
      organizationId,
      creatorId: userId,

      // Financial
      contractValue: data.contractValue,
      currency: data.currency || 'USD',

      // Dates
      effectiveDate: data.effectiveDate,
      expirationDate: data.expirationDate,
      renewalDate: data.renewalDate,

      // Auto-renewal
      autoRenew: data.autoRenew || false,
      renewalTermMonths: data.renewalTermMonths,
      renewalNoticeDays: data.renewalNoticeDays || 30,

      // Metadata
      jurisdiction: data.jurisdiction || template.jurisdiction,
      governingLaw: data.governingLaw || template.governingLaw,
      tags: data.tags || [],
      customFields: data.customFields || {},

      // Relationships
      counterparties: data.counterparties ? {
        create: data.counterparties.map((cp, index) => ({
          name: cp.name,
          role: cp.role,
          type: cp.type,
          email: cp.email,
          phone: cp.phone,
          address: cp.address,
          taxId: cp.taxId,
          registrationNumber: cp.registrationNumber,
          contactPerson: cp.contactPerson,
          contactEmail: cp.contactEmail,
          contactPhone: cp.contactPhone,
          isPrimary: index === 0,
          status: 'ACTIVE'
        }))
      } : undefined,

      obligations: data.obligations ? {
        create: data.obligations.map(ob => ({
          title: ob.title,
          description: ob.description,
          type: ob.type,
          responsibleParty: ob.responsibleParty,
          status: ObligationStatus.PENDING,
          dueDate: ob.dueDate,
          recurringSchedule: ob.recurringSchedule,
          priority: ob.priority,
          alertDaysBefore: ob.alertDaysBefore || 7
        }))
      } : undefined,

      milestones: data.milestones ? {
        create: data.milestones.map((ms, index) => ({
          name: ms.name,
          description: ms.description,
          sequence: index + 1,
          dueDate: ms.dueDate,
          status: 'PENDING',
          completionCriteria: ms.completionCriteria,
          paymentAmount: ms.paymentAmount,
          dependencies: ms.dependencies
        }))
      } : undefined
    },
    include: {
      template: true,
      creator: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true
        }
      },
      counterparties: true,
      obligations: true,
      milestones: true
    }
  });

  // Update template usage count
  await prisma.contractTemplate.update({
    where: { id: template.id },
    data: {
      usageCount: { increment: 1 },
      lastUsed: new Date()
    }
  });

  // Create initial version
  await prisma.contractVersion.create({
    data: {
      contractId: contract.id,
      version: 1,
      content: populatedContent,
      createdById: userId,
      changes: 'Initial version created from template',
      diffMetadata: {}
    }
  });

  // Audit log
  await auditLog({
    userId,
    action: 'CONTRACT_CREATED',
    resourceType: 'contract',
    resourceId: contract.id,
    details: {
      templateId: template.id,
      contractType: data.contractType,
      title: data.title
    },
    ipAddress,
    userAgent
  });

  return contract;
};

/**
 * Create a contract from scratch (without template)
 */
export const createContract = async (
  data: CreateContractData,
  userId: string,
  organizationId: string,
  ipAddress: string,
  userAgent: string
): Promise<Contract> => {
  const contract = await prisma.contract.create({
    data: {
      title: data.title,
      description: data.description,
      content: data.content,
      contractType: data.contractType,
      category: data.category,
      subcategory: data.subcategory,
      status: ContractStatus.DRAFT,

      organizationId,
      creatorId: userId,

      contractValue: data.contractValue,
      currency: data.currency || 'USD',

      effectiveDate: data.effectiveDate,
      expirationDate: data.expirationDate,
      renewalDate: data.renewalDate,

      autoRenew: data.autoRenew || false,
      renewalTermMonths: data.renewalTermMonths,
      renewalNoticeDays: data.renewalNoticeDays || 30,

      jurisdiction: data.jurisdiction || [],
      governingLaw: data.governingLaw,
      tags: data.tags || [],
      customFields: data.customFields || {},

      counterparties: data.counterparties ? {
        create: data.counterparties.map((cp, index) => ({
          name: cp.name,
          role: cp.role,
          type: cp.type,
          email: cp.email,
          phone: cp.phone,
          address: cp.address,
          taxId: cp.taxId,
          registrationNumber: cp.registrationNumber,
          contactPerson: cp.contactPerson,
          contactEmail: cp.contactEmail,
          contactPhone: cp.contactPhone,
          isPrimary: index === 0,
          status: 'ACTIVE'
        }))
      } : undefined,

      obligations: data.obligations ? {
        create: data.obligations.map(ob => ({
          title: ob.title,
          description: ob.description,
          type: ob.type,
          responsibleParty: ob.responsibleParty,
          status: ObligationStatus.PENDING,
          dueDate: ob.dueDate,
          recurringSchedule: ob.recurringSchedule,
          priority: ob.priority,
          alertDaysBefore: ob.alertDaysBefore || 7
        }))
      } : undefined,

      milestones: data.milestones ? {
        create: data.milestones.map((ms, index) => ({
          name: ms.name,
          description: ms.description,
          sequence: index + 1,
          dueDate: ms.dueDate,
          status: 'PENDING',
          completionCriteria: ms.completionCriteria,
          paymentAmount: ms.paymentAmount,
          dependencies: ms.dependencies
        }))
      } : undefined
    },
    include: {
      creator: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true
        }
      },
      counterparties: true,
      obligations: true,
      milestones: true
    }
  });

  // Create initial version
  await prisma.contractVersion.create({
    data: {
      contractId: contract.id,
      version: 1,
      content: data.content,
      createdById: userId,
      changes: 'Initial version',
      diffMetadata: {}
    }
  });

  // Audit log
  await auditLog({
    userId,
    action: 'CONTRACT_CREATED',
    resourceType: 'contract',
    resourceId: contract.id,
    details: {
      contractType: data.contractType,
      title: data.title,
      source: 'scratch'
    },
    ipAddress,
    userAgent
  });

  return contract;
};

// ============================================================================
// CONTRACT RETRIEVAL
// ============================================================================

/**
 * Get contract by ID with access control
 */
export const getContractById = async (
  contractId: string,
  userId: string
): Promise<Contract | null> => {
  // Get user's organizations
  const userOrgs = await prisma.organizationMember.findMany({
    where: { userId },
    select: { organizationId: true }
  });

  const orgIds = userOrgs.map(m => m.organizationId);

  const contract = await prisma.contract.findFirst({
    where: {
      id: contractId,
      organizationId: { in: orgIds }
    },
    include: {
      template: true,
      creator: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true
        }
      },
      organization: {
        select: {
          id: true,
          name: true
        }
      },
      counterparties: {
        orderBy: { isPrimary: 'desc' }
      },
      obligations: {
        orderBy: { dueDate: 'asc' }
      },
      milestones: {
        orderBy: { sequence: 'asc' }
      },
      versions: {
        orderBy: { version: 'desc' },
        take: 5,
        include: {
          createdBy: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          }
        }
      },
      amendments: {
        orderBy: { createdAt: 'desc' }
      },
      _count: {
        select: {
          versions: true,
          obligations: true,
          milestones: true,
          amendments: true
        }
      }
    }
  });

  return contract;
};

/**
 * List contracts with advanced filtering
 */
export const listContracts = async (
  userId: string,
  filters: ContractFilters = {},
  page: number = 1,
  limit: number = 20
): Promise<{
  contracts: Contract[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  // Get user's organizations
  const userOrgs = await prisma.organizationMember.findMany({
    where: { userId },
    select: { organizationId: true }
  });

  const orgIds = userOrgs.map(m => m.organizationId);

  // Build where clause
  const where: any = {
    organizationId: filters.organizationId || { in: orgIds }
  };

  if (filters.contractType) {
    where.contractType = filters.contractType;
  }

  if (filters.category) {
    where.category = filters.category;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } }
    ];
  }

  if (filters.tags && filters.tags.length > 0) {
    where.tags = {
      hasSome: filters.tags
    };
  }

  if (filters.expiringInDays) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + filters.expiringInDays);

    where.expirationDate = {
      gte: new Date(),
      lte: expiryDate
    };
    where.status = {
      in: [ContractStatus.ACTIVE, ContractStatus.FULLY_EXECUTED]
    };
  }

  if (filters.effectiveDateFrom || filters.effectiveDateTo) {
    where.effectiveDate = {};
    if (filters.effectiveDateFrom) {
      where.effectiveDate.gte = filters.effectiveDateFrom;
    }
    if (filters.effectiveDateTo) {
      where.effectiveDate.lte = filters.effectiveDateTo;
    }
  }

  if (filters.minValue || filters.maxValue) {
    where.contractValue = {};
    if (filters.minValue) {
      where.contractValue.gte = filters.minValue;
    }
    if (filters.maxValue) {
      where.contractValue.lte = filters.maxValue;
    }
  }

  if (filters.counterpartyName) {
    where.counterparties = {
      some: {
        name: {
          contains: filters.counterpartyName,
          mode: 'insensitive'
        }
      }
    };
  }

  // Get total count
  const total = await prisma.contract.count({ where });

  // Get paginated results
  const contracts = await prisma.contract.findMany({
    where,
    include: {
      creator: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true
        }
      },
      organization: {
        select: {
          id: true,
          name: true
        }
      },
      counterparties: {
        where: { isPrimary: true },
        take: 1
      },
      _count: {
        select: {
          counterparties: true,
          obligations: true,
          milestones: true,
          versions: true
        }
      }
    },
    orderBy: [
      { createdAt: 'desc' }
    ],
    skip: (page - 1) * limit,
    take: limit
  });

  return {
    contracts,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
};

// ============================================================================
// CONTRACT UPDATES
// ============================================================================

/**
 * Update contract
 */
export const updateContract = async (
  contractId: string,
  data: UpdateContractData,
  userId: string,
  ipAddress: string,
  userAgent: string
): Promise<Contract> => {
  // Get current contract
  const current = await getContractById(contractId, userId);

  if (!current) {
    throw new Error('Contract not found or access denied');
  }

  // Validate status transitions
  if (data.status && data.status !== current.status) {
    validateStatusTransition(current.status, data.status);
  }

  // Check if content changed (requires versioning)
  const contentChanged = data.content && data.content !== current.content;

  // Update contract
  const updated = await prisma.contract.update({
    where: { id: contractId },
    data: {
      ...data,
      updatedAt: new Date()
    },
    include: {
      template: true,
      creator: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true
        }
      },
      counterparties: true,
      obligations: true,
      milestones: true
    }
  });

  // Create new version if content changed
  if (contentChanged) {
    const lastVersion = await prisma.contractVersion.findFirst({
      where: { contractId },
      orderBy: { version: 'desc' }
    });

    await prisma.contractVersion.create({
      data: {
        contractId,
        version: (lastVersion?.version || 0) + 1,
        content: data.content!,
        createdById: userId,
        changes: 'Contract content updated',
        diffMetadata: {
          // Could implement diff calculation here
        }
      }
    });
  }

  // Audit log
  await auditLog({
    userId,
    action: 'CONTRACT_UPDATED',
    resourceType: 'contract',
    resourceId: contractId,
    details: {
      changes: Object.keys(data),
      newStatus: data.status
    },
    ipAddress,
    userAgent
  });

  return updated;
};

/**
 * Delete contract (soft delete by archiving)
 */
export const deleteContract = async (
  contractId: string,
  userId: string,
  ipAddress: string,
  userAgent: string
): Promise<void> => {
  const contract = await getContractById(contractId, userId);

  if (!contract) {
    throw new Error('Contract not found or access denied');
  }

  // Only allow deletion of draft contracts
  if (contract.status !== ContractStatus.DRAFT) {
    throw new Error('Only draft contracts can be deleted. Use archive for executed contracts.');
  }

  await prisma.contract.delete({
    where: { id: contractId }
  });

  await auditLog({
    userId,
    action: 'CONTRACT_DELETED',
    resourceType: 'contract',
    resourceId: contractId,
    details: {
      title: contract.title
    },
    ipAddress,
    userAgent
  });
};

/**
 * Archive contract
 */
export const archiveContract = async (
  contractId: string,
  userId: string,
  ipAddress: string,
  userAgent: string
): Promise<Contract> => {
  return await updateContract(
    contractId,
    { status: ContractStatus.ARCHIVED },
    userId,
    ipAddress,
    userAgent
  );
};

// ============================================================================
// COUNTERPARTY MANAGEMENT
// ============================================================================

/**
 * Add counterparty to contract
 */
export const addCounterparty = async (
  contractId: string,
  data: CounterpartyData,
  userId: string,
  ipAddress: string,
  userAgent: string
) => {
  const contract = await getContractById(contractId, userId);

  if (!contract) {
    throw new Error('Contract not found or access denied');
  }

  const counterparty = await prisma.counterparty.create({
    data: {
      contractId,
      name: data.name,
      role: data.role,
      type: data.type,
      email: data.email,
      phone: data.phone,
      address: data.address,
      taxId: data.taxId,
      registrationNumber: data.registrationNumber,
      contactPerson: data.contactPerson,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      isPrimary: false,
      status: 'ACTIVE'
    }
  });

  await auditLog({
    userId,
    action: 'COUNTERPARTY_ADDED',
    resourceType: 'contract',
    resourceId: contractId,
    details: {
      counterpartyName: data.name,
      role: data.role
    },
    ipAddress,
    userAgent
  });

  return counterparty;
};

/**
 * Remove counterparty from contract
 */
export const removeCounterparty = async (
  contractId: string,
  counterpartyId: string,
  userId: string,
  ipAddress: string,
  userAgent: string
): Promise<void> => {
  const contract = await getContractById(contractId, userId);

  if (!contract) {
    throw new Error('Contract not found or access denied');
  }

  const counterparty = await prisma.counterparty.findFirst({
    where: {
      id: counterpartyId,
      contractId
    }
  });

  if (!counterparty) {
    throw new Error('Counterparty not found');
  }

  if (counterparty.isPrimary) {
    throw new Error('Cannot remove primary counterparty');
  }

  await prisma.counterparty.delete({
    where: { id: counterpartyId }
  });

  await auditLog({
    userId,
    action: 'COUNTERPARTY_REMOVED',
    resourceType: 'contract',
    resourceId: contractId,
    details: {
      counterpartyName: counterparty.name
    },
    ipAddress,
    userAgent
  });
};

// ============================================================================
// OBLIGATION MANAGEMENT
// ============================================================================

/**
 * Add obligation to contract
 */
export const addObligation = async (
  contractId: string,
  data: ObligationData,
  userId: string,
  ipAddress: string,
  userAgent: string
) => {
  const contract = await getContractById(contractId, userId);

  if (!contract) {
    throw new Error('Contract not found or access denied');
  }

  const obligation = await prisma.obligation.create({
    data: {
      contractId,
      title: data.title,
      description: data.description,
      type: data.type,
      responsibleParty: data.responsibleParty,
      status: ObligationStatus.PENDING,
      dueDate: data.dueDate,
      recurringSchedule: data.recurringSchedule,
      priority: data.priority,
      alertDaysBefore: data.alertDaysBefore || 7
    }
  });

  await auditLog({
    userId,
    action: 'OBLIGATION_ADDED',
    resourceType: 'contract',
    resourceId: contractId,
    details: {
      obligationTitle: data.title,
      type: data.type
    },
    ipAddress,
    userAgent
  });

  return obligation;
};

/**
 * Update obligation status
 */
export const updateObligationStatus = async (
  obligationId: string,
  status: ObligationStatus,
  userId: string,
  completionNotes?: string,
  ipAddress?: string,
  userAgent?: string
) => {
  const obligation = await prisma.obligation.findUnique({
    where: { id: obligationId },
    include: { contract: true }
  });

  if (!obligation) {
    throw new Error('Obligation not found');
  }

  // Verify user has access to contract
  const contract = await getContractById(obligation.contractId, userId);
  if (!contract) {
    throw new Error('Access denied');
  }

  const updated = await prisma.obligation.update({
    where: { id: obligationId },
    data: {
      status,
      completedAt: status === ObligationStatus.COMPLETED ? new Date() : null,
      completionNotes
    }
  });

  if (ipAddress && userAgent) {
    await auditLog({
      userId,
      action: 'OBLIGATION_STATUS_UPDATED',
      resourceType: 'obligation',
      resourceId: obligationId,
      details: {
        newStatus: status,
        contractId: obligation.contractId
      },
      ipAddress,
      userAgent
    });
  }

  return updated;
};

// ============================================================================
// MILESTONE MANAGEMENT
// ============================================================================

/**
 * Add milestone to contract
 */
export const addMilestone = async (
  contractId: string,
  data: MilestoneData,
  userId: string,
  ipAddress: string,
  userAgent: string
) => {
  const contract = await getContractById(contractId, userId);

  if (!contract) {
    throw new Error('Contract not found or access denied');
  }

  // Get next sequence number
  const lastMilestone = await prisma.milestone.findFirst({
    where: { contractId },
    orderBy: { sequence: 'desc' }
  });

  const milestone = await prisma.milestone.create({
    data: {
      contractId,
      name: data.name,
      description: data.description,
      sequence: (lastMilestone?.sequence || 0) + 1,
      dueDate: data.dueDate,
      status: 'PENDING',
      completionCriteria: data.completionCriteria,
      paymentAmount: data.paymentAmount,
      dependencies: data.dependencies
    }
  });

  await auditLog({
    userId,
    action: 'MILESTONE_ADDED',
    resourceType: 'contract',
    resourceId: contractId,
    details: {
      milestoneName: data.name
    },
    ipAddress,
    userAgent
  });

  return milestone;
};

/**
 * Update milestone status
 */
export const updateMilestoneStatus = async (
  milestoneId: string,
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED' | 'CANCELLED',
  userId: string,
  completionNotes?: string,
  ipAddress?: string,
  userAgent?: string
) => {
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: { contract: true }
  });

  if (!milestone) {
    throw new Error('Milestone not found');
  }

  const contract = await getContractById(milestone.contractId, userId);
  if (!contract) {
    throw new Error('Access denied');
  }

  const updated = await prisma.milestone.update({
    where: { id: milestoneId },
    data: {
      status,
      completedAt: status === 'COMPLETED' ? new Date() : null,
      completionNotes
    }
  });

  if (ipAddress && userAgent) {
    await auditLog({
      userId,
      action: 'MILESTONE_STATUS_UPDATED',
      resourceType: 'milestone',
      resourceId: milestoneId,
      details: {
        newStatus: status,
        contractId: milestone.contractId
      },
      ipAddress,
      userAgent
    });
  }

  return updated;
};

// ============================================================================
// STATUS MANAGEMENT
// ============================================================================

/**
 * Validate contract status transition
 */
function validateStatusTransition(from: ContractStatus, to: ContractStatus): void {
  const validTransitions: Record<ContractStatus, ContractStatus[]> = {
    [ContractStatus.DRAFT]: [
      ContractStatus.PENDING_APPROVAL,
      ContractStatus.CANCELLED
    ],
    [ContractStatus.PENDING_APPROVAL]: [
      ContractStatus.IN_REVIEW,
      ContractStatus.APPROVED,
      ContractStatus.REJECTED,
      ContractStatus.DRAFT
    ],
    [ContractStatus.IN_REVIEW]: [
      ContractStatus.APPROVED,
      ContractStatus.REJECTED,
      ContractStatus.PENDING_APPROVAL
    ],
    [ContractStatus.APPROVED]: [
      ContractStatus.PENDING_SIGNATURE,
      ContractStatus.REJECTED
    ],
    [ContractStatus.PENDING_SIGNATURE]: [
      ContractStatus.PARTIALLY_SIGNED,
      ContractStatus.FULLY_EXECUTED,
      ContractStatus.CANCELLED
    ],
    [ContractStatus.PARTIALLY_SIGNED]: [
      ContractStatus.FULLY_EXECUTED,
      ContractStatus.CANCELLED
    ],
    [ContractStatus.FULLY_EXECUTED]: [
      ContractStatus.ACTIVE
    ],
    [ContractStatus.ACTIVE]: [
      ContractStatus.EXPIRING_SOON,
      ContractStatus.EXPIRED,
      ContractStatus.RENEWED,
      ContractStatus.AMENDED,
      ContractStatus.TERMINATED,
      ContractStatus.ARCHIVED
    ],
    [ContractStatus.EXPIRING_SOON]: [
      ContractStatus.EXPIRED,
      ContractStatus.RENEWED,
      ContractStatus.ACTIVE
    ],
    [ContractStatus.EXPIRED]: [
      ContractStatus.RENEWED,
      ContractStatus.ARCHIVED
    ],
    [ContractStatus.RENEWED]: [
      ContractStatus.ACTIVE,
      ContractStatus.ARCHIVED
    ],
    [ContractStatus.AMENDED]: [
      ContractStatus.ACTIVE,
      ContractStatus.PENDING_SIGNATURE
    ],
    [ContractStatus.TERMINATED]: [
      ContractStatus.ARCHIVED
    ],
    [ContractStatus.ARCHIVED]: [],
    [ContractStatus.REJECTED]: [
      ContractStatus.DRAFT,
      ContractStatus.ARCHIVED
    ],
    [ContractStatus.CANCELLED]: [
      ContractStatus.DRAFT,
      ContractStatus.ARCHIVED
    ]
  };

  const allowedTransitions = validTransitions[from] || [];

  if (!allowedTransitions.includes(to)) {
    throw new Error(`Invalid status transition from ${from} to ${to}`);
  }
}

/**
 * Get contracts expiring soon
 */
export const getExpiringContracts = async (
  userId: string,
  daysAhead: number = 30
): Promise<Contract[]> => {
  const userOrgs = await prisma.organizationMember.findMany({
    where: { userId },
    select: { organizationId: true }
  });

  const orgIds = userOrgs.map(m => m.organizationId);

  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + daysAhead);

  return await prisma.contract.findMany({
    where: {
      organizationId: { in: orgIds },
      expirationDate: {
        gte: new Date(),
        lte: expiryDate
      },
      status: {
        in: [ContractStatus.ACTIVE, ContractStatus.FULLY_EXECUTED]
      }
    },
    include: {
      organization: {
        select: {
          id: true,
          name: true
        }
      },
      counterparties: {
        where: { isPrimary: true }
      }
    },
    orderBy: {
      expirationDate: 'asc'
    }
  });
};

/**
 * Get dashboard statistics
 */
export const getContractStatistics = async (
  userId: string,
  organizationId?: string
) => {
  const userOrgs = await prisma.organizationMember.findMany({
    where: { userId },
    select: { organizationId: true }
  });

  const orgIds = organizationId ? [organizationId] : userOrgs.map(m => m.organizationId);

  const [
    totalContracts,
    activeContracts,
    expiringContracts,
    pendingApproval,
    pendingSignature,
    totalValue,
    contractsByType,
    contractsByStatus
  ] = await Promise.all([
    // Total contracts
    prisma.contract.count({
      where: { organizationId: { in: orgIds } }
    }),

    // Active contracts
    prisma.contract.count({
      where: {
        organizationId: { in: orgIds },
        status: ContractStatus.ACTIVE
      }
    }),

    // Expiring in 30 days
    prisma.contract.count({
      where: {
        organizationId: { in: orgIds },
        expirationDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        },
        status: {
          in: [ContractStatus.ACTIVE, ContractStatus.FULLY_EXECUTED]
        }
      }
    }),

    // Pending approval
    prisma.contract.count({
      where: {
        organizationId: { in: orgIds },
        status: ContractStatus.PENDING_APPROVAL
      }
    }),

    // Pending signature
    prisma.contract.count({
      where: {
        organizationId: { in: orgIds },
        status: {
          in: [ContractStatus.PENDING_SIGNATURE, ContractStatus.PARTIALLY_SIGNED]
        }
      }
    }),

    // Total contract value
    prisma.contract.aggregate({
      where: {
        organizationId: { in: orgIds },
        status: {
          in: [ContractStatus.ACTIVE, ContractStatus.FULLY_EXECUTED]
        }
      },
      _sum: {
        contractValue: true
      }
    }),

    // By type
    prisma.contract.groupBy({
      by: ['contractType'],
      where: { organizationId: { in: orgIds } },
      _count: true
    }),

    // By status
    prisma.contract.groupBy({
      by: ['status'],
      where: { organizationId: { in: orgIds } },
      _count: true
    })
  ]);

  return {
    totalContracts,
    activeContracts,
    expiringContracts,
    pendingApproval,
    pendingSignature,
    totalValue: totalValue._sum.contractValue || 0,
    contractsByType,
    contractsByStatus
  };
};

export default {
  createContractFromTemplate,
  createContract,
  getContractById,
  listContracts,
  updateContract,
  deleteContract,
  archiveContract,
  addCounterparty,
  removeCounterparty,
  addObligation,
  updateObligationStatus,
  addMilestone,
  updateMilestoneStatus,
  getExpiringContracts,
  getContractStatistics
};
