import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { auditLog } from './audit.service';
import { ContractType, ContractCategory, ClauseCategory } from '@prisma/client';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface CreateTemplateData {
  name: string;
  description?: string;
  contractType: ContractType;
  category: ContractCategory;
  subcategory?: string;
  organizationId?: string;
  isGlobal?: boolean;
  content: string;
  structure: TemplateStructure;
  requiredFields: TemplateField[];
  optionalFields: TemplateField[];
  conditionalFields?: ConditionalField[];
  clauses: CreateClauseData[];
  formatting?: TemplateFormatting;
  headerFooter?: HeaderFooter;
  jurisdiction: string[];
  governingLaw?: string;
  language?: string;
  tags?: string[];
  industry?: string[];
}

interface UpdateTemplateData {
  name?: string;
  description?: string;
  content?: string;
  structure?: TemplateStructure;
  requiredFields?: TemplateField[];
  optionalFields?: TemplateField[];
  conditionalFields?: ConditionalField[];
  formatting?: TemplateFormatting;
  headerFooter?: HeaderFooter;
  jurisdiction?: string[];
  governingLaw?: string;
  tags?: string[];
  industry?: string[];
  isActive?: boolean;
}

interface TemplateField {
  id: string;
  name: string;
  label: string;
  type: 'TEXT' | 'NUMBER' | 'DATE' | 'SELECT' | 'MULTI_SELECT' | 'CURRENCY' | 'PERCENTAGE' | 'BOOLEAN' | 'FILE' | 'PARTY';
  required: boolean;
  defaultValue?: any;
  validation?: ValidationRule[];
  dataSource?: 'CRM' | 'HR' | 'ERP' | 'MANUAL';
  autoPopulate?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: SelectOption[];
}

interface ValidationRule {
  rule: 'min' | 'max' | 'regex' | 'email' | 'url' | 'custom';
  value: any;
  message?: string;
}

interface SelectOption {
  value: string;
  label: string;
}

interface ConditionalField {
  fieldId: string;
  conditions: Condition[];
  actions: FieldAction[];
}

interface Condition {
  field: string;
  operator: 'EQUALS' | 'NOT_EQUALS' | 'IN' | 'NOT_IN' | 'GREATER_THAN' | 'LESS_THAN';
  value: any;
}

interface FieldAction {
  type: 'SHOW' | 'HIDE' | 'REQUIRE' | 'OPTIONAL';
  targetField: string;
}

interface TemplateStructure {
  sections: TemplateSection[];
}

interface TemplateSection {
  id: string;
  name: string;
  order: number;
  description?: string;
  clauseIds: string[];
}

interface TemplateFormatting {
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  styles?: Record<string, any>;
}

interface HeaderFooter {
  header?: {
    enabled: boolean;
    content: string;
    height: number;
  };
  footer?: {
    enabled: boolean;
    content: string;
    height: number;
  };
}

interface CreateClauseData {
  name: string;
  category: ClauseCategory;
  content: string;
  section: string;
  position: number;
  isRequired?: boolean;
  alternatives?: string[];
  fallbackClause?: string;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  favorability?: 'HIGHLY_FAVORABLE' | 'FAVORABLE' | 'NEUTRAL' | 'UNFAVORABLE' | 'HIGHLY_UNFAVORABLE';
  complianceFlags?: string[];
  regulatoryRefs?: string[];
  recommendedFor?: string[];
  keywords?: string[];
}

// ============================================================================
// TEMPLATE CRUD OPERATIONS
// ============================================================================

/**
 * Create a new contract template
 */
export const createTemplate = async (
  data: CreateTemplateData,
  creatorId: string,
  ipAddress: string,
  userAgent: string
) => {
  // Validate structure
  validateTemplateStructure(data.structure);

  // Validate fields
  validateTemplateFields(data.requiredFields, data.optionalFields);

  // Check permissions if organization-specific
  if (data.organizationId && !data.isGlobal) {
    const membership = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: creatorId,
          organizationId: data.organizationId
        }
      }
    });

    if (!membership || membership.role === 'VIEWER') {
      throw new AppError('Insufficient permissions to create templates', 403);
    }
  }

  // Create template with clauses
  const template = await prisma.contractTemplate.create({
    data: {
      name: data.name,
      description: data.description,
      contractType: data.contractType,
      category: data.category,
      subcategory: data.subcategory,
      organizationId: data.organizationId,
      isGlobal: data.isGlobal || false,
      content: data.content,
      structure: data.structure,
      requiredFields: data.requiredFields,
      optionalFields: data.optionalFields,
      conditionalFields: data.conditionalFields || [],
      formatting: data.formatting || getDefaultFormatting(),
      headerFooter: data.headerFooter,
      jurisdiction: data.jurisdiction,
      governingLaw: data.governingLaw,
      language: data.language || 'en',
      tags: data.tags || [],
      industry: data.industry || [],
      createdBy: creatorId,
      clauses: {
        create: data.clauses.map((clause, index) => ({
          name: clause.name,
          category: clause.category,
          content: clause.content,
          section: clause.section,
          position: clause.position || index + 1,
          isRequired: clause.isRequired || false,
          alternatives: clause.alternatives,
          fallbackClause: clause.fallbackClause,
          riskLevel: clause.riskLevel || 'LOW',
          favorability: clause.favorability || 'NEUTRAL',
          complianceFlags: clause.complianceFlags || [],
          regulatoryRefs: clause.regulatoryRefs || [],
          recommendedFor: clause.recommendedFor || [],
          keywords: clause.keywords || []
        }))
      }
    },
    include: {
      clauses: {
        orderBy: { position: 'asc' }
      },
      creator: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true
        }
      },
      organization: true
    }
  });

  await auditLog({
    userId: creatorId,
    action: 'TEMPLATE_CREATED',
    resourceType: 'template',
    resourceId: template.id,
    ipAddress,
    userAgent,
    metadata: {
      templateName: template.name,
      contractType: template.contractType,
      isGlobal: template.isGlobal
    }
  });

  return template;
};

/**
 * Get template by ID
 */
export const getTemplateById = async (
  templateId: string,
  userId: string
) => {
  const template = await prisma.contractTemplate.findUnique({
    where: { id: templateId },
    include: {
      clauses: {
        orderBy: { position: 'asc' }
      },
      creator: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true
        }
      },
      organization: true,
      _count: {
        select: {
          contracts: true
        }
      }
    }
  });

  if (!template) {
    throw new AppError('Template not found', 404);
  }

  // Check access permissions
  if (template.organizationId && !template.isGlobal) {
    const membership = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: template.organizationId
        }
      }
    });

    if (!membership) {
      throw new AppError('Access denied', 403);
    }
  }

  return template;
};

/**
 * List templates with filtering
 */
export const listTemplates = async (
  userId: string,
  filters: {
    contractType?: ContractType;
    category?: ContractCategory;
    organizationId?: string;
    isGlobal?: boolean;
    isActive?: boolean;
    search?: string;
    tags?: string[];
    industry?: string[];
  } = {}
) => {
  // Build where clause
  const where: any = {};

  if (filters.contractType) {
    where.contractType = filters.contractType;
  }

  if (filters.category) {
    where.category = filters.category;
  }

  if (filters.isActive !== undefined) {
    where.isActive = filters.isActive;
  }

  // Access control: global templates OR templates from user's organizations
  const userOrgs = await prisma.organizationMember.findMany({
    where: { userId },
    select: { organizationId: true }
  });

  const orgIds = userOrgs.map(m => m.organizationId);

  where.OR = [
    { isGlobal: true },
    { organizationId: { in: orgIds } }
  ];

  // Organization filter
  if (filters.organizationId) {
    where.AND = [
      { organizationId: filters.organizationId }
    ];
  }

  // Search filter
  if (filters.search) {
    where.AND = [
      ...(where.AND || []),
      {
        OR: [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } }
        ]
      }
    ];
  }

  // Tags filter
  if (filters.tags && filters.tags.length > 0) {
    where.tags = {
      hasSome: filters.tags
    };
  }

  // Industry filter
  if (filters.industry && filters.industry.length > 0) {
    where.industry = {
      hasSome: filters.industry
    };
  }

  const templates = await prisma.contractTemplate.findMany({
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
          name: true,
          slug: true
        }
      },
      _count: {
        select: {
          clauses: true,
          contracts: true
        }
      }
    },
    orderBy: [
      { usageCount: 'desc' },
      { createdAt: 'desc' }
    ]
  });

  return templates;
};

/**
 * Update template
 */
export const updateTemplate = async (
  templateId: string,
  data: UpdateTemplateData,
  userId: string,
  ipAddress: string,
  userAgent: string
) => {
  const template = await getTemplateById(templateId, userId);

  // Check permissions
  if (template.organizationId) {
    const membership = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: template.organizationId
        }
      }
    });

    if (!membership || (membership.role !== 'OWNER' && membership.role !== 'ADMIN' && template.createdBy !== userId)) {
      throw new AppError('Insufficient permissions to update template', 403);
    }
  } else if (template.isGlobal && template.createdBy !== userId) {
    throw new AppError('Only the creator can update global templates', 403);
  }

  // If structure or fields changed, create new version
  let newVersion = template;
  if (data.structure || data.requiredFields || data.optionalFields) {
    // Create new version
    newVersion = await prisma.contractTemplate.create({
      data: {
        ...template,
        id: undefined,
        version: template.version + 1,
        parentTemplateId: template.id,
        content: data.content || template.content,
        structure: data.structure || template.structure,
        requiredFields: data.requiredFields || template.requiredFields,
        optionalFields: data.optionalFields || template.optionalFields,
        conditionalFields: data.conditionalFields || template.conditionalFields,
        formatting: data.formatting || template.formatting,
        headerFooter: data.headerFooter || template.headerFooter,
        name: data.name || template.name,
        description: data.description || template.description,
        jurisdiction: data.jurisdiction || template.jurisdiction,
        governingLaw: data.governingLaw || template.governingLaw,
        tags: data.tags || template.tags,
        industry: data.industry || template.industry,
        updatedAt: new Date()
      } as any,
      include: {
        clauses: true,
        creator: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
  } else {
    // Simple update
    newVersion = await prisma.contractTemplate.update({
      where: { id: templateId },
      data: {
        name: data.name,
        description: data.description,
        content: data.content,
        formatting: data.formatting,
        headerFooter: data.headerFooter,
        jurisdiction: data.jurisdiction,
        governingLaw: data.governingLaw,
        tags: data.tags,
        industry: data.industry,
        isActive: data.isActive
      },
      include: {
        clauses: true,
        creator: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
  }

  await auditLog({
    userId,
    action: 'TEMPLATE_UPDATED',
    resourceType: 'template',
    resourceId: templateId,
    ipAddress,
    userAgent,
    metadata: {
      changes: Object.keys(data),
      newVersion: newVersion.version
    }
  });

  return newVersion;
};

/**
 * Delete template (soft delete by marking inactive)
 */
export const deleteTemplate = async (
  templateId: string,
  userId: string,
  ipAddress: string,
  userAgent: string
) => {
  const template = await getTemplateById(templateId, userId);

  // Check if template is in use
  const usageCount = await prisma.contract.count({
    where: { templateId }
  });

  if (usageCount > 0) {
    // Soft delete - mark as inactive
    await prisma.contractTemplate.update({
      where: { id: templateId },
      data: { isActive: false }
    });

    await auditLog({
      userId,
      action: 'TEMPLATE_DEACTIVATED',
      resourceType: 'template',
      resourceId: templateId,
      ipAddress,
      userAgent,
      metadata: { reason: 'Template in use', usageCount }
    });

    return { message: 'Template deactivated (in use by contracts)', usageCount };
  }

  // Hard delete if not in use
  await prisma.contractTemplate.delete({
    where: { id: templateId }
  });

  await auditLog({
    userId,
    action: 'TEMPLATE_DELETED',
    resourceType: 'template',
    resourceId: templateId,
    ipAddress,
    userAgent
  });

  return { message: 'Template deleted successfully' };
};

/**
 * Duplicate template
 */
export const duplicateTemplate = async (
  templateId: string,
  name: string,
  userId: string,
  organizationId?: string
) => {
  const original = await getTemplateById(templateId, userId);

  const duplicate = await prisma.contractTemplate.create({
    data: {
      name,
      description: original.description,
      contractType: original.contractType,
      category: original.category,
      subcategory: original.subcategory,
      organizationId: organizationId || original.organizationId,
      isGlobal: false, // Duplicates are never global
      content: original.content,
      structure: original.structure,
      requiredFields: original.requiredFields,
      optionalFields: original.optionalFields,
      conditionalFields: original.conditionalFields,
      formatting: original.formatting,
      headerFooter: original.headerFooter,
      jurisdiction: original.jurisdiction,
      governingLaw: original.governingLaw,
      language: original.language,
      tags: original.tags,
      industry: original.industry,
      createdBy: userId,
      clauses: {
        create: original.clauses.map(clause => ({
          name: clause.name,
          category: clause.category,
          content: clause.content,
          section: clause.section,
          position: clause.position,
          isRequired: clause.isRequired,
          alternatives: clause.alternatives,
          fallbackClause: clause.fallbackClause,
          riskLevel: clause.riskLevel,
          favorability: clause.favorability,
          complianceFlags: clause.complianceFlags,
          regulatoryRefs: clause.regulatoryRefs,
          recommendedFor: clause.recommendedFor,
          keywords: clause.keywords
        }))
      }
    },
    include: {
      clauses: true,
      creator: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });

  return duplicate;
};

/**
 * Clone template (alias with audit logging)
 */
export const cloneTemplate = async (
  templateId: string,
  name: string,
  userId: string,
  organizationId: string | undefined,
  ipAddress: string,
  userAgent: string
) => {
  const cloned = await duplicateTemplate(templateId, name, userId, organizationId);
  await auditLog({
    userId,
    action: 'TEMPLATE_CLONED',
    resourceType: 'template',
    resourceId: cloned.id,
    ipAddress,
    userAgent,
    metadata: { fromTemplateId: templateId, name }
  });
  return cloned;
};

/**
 * Create a new template version (explicit endpoint)
 */
export const createTemplateVersion = async (
  templateId: string,
  data: Partial<CreateTemplateData>,
  userId: string,
  ipAddress: string,
  userAgent: string
) => {
  const base = await getTemplateById(templateId, userId);

  const newVersion = await prisma.contractTemplate.create({
    data: {
      name: data.name || base.name,
      description: data.description ?? base.description,
      contractType: data.contractType || base.contractType,
      category: data.category || base.category,
      subcategory: data.subcategory ?? base.subcategory,
      organizationId: base.organizationId,
      isGlobal: false,
      content: data.content || base.content,
      structure: data.structure || (base.structure as any),
      requiredFields: data.requiredFields || (base.requiredFields as any),
      optionalFields: data.optionalFields || (base.optionalFields as any),
      conditionalFields: data.conditionalFields || (base.conditionalFields as any),
      formatting: data.formatting || (base.formatting as any),
      headerFooter: data.headerFooter || (base.headerFooter as any),
      jurisdiction: data.jurisdiction || base.jurisdiction,
      governingLaw: data.governingLaw || base.governingLaw,
      language: base.language,
      tags: data.tags || base.tags,
      industry: data.industry || base.industry,
      createdBy: userId,
      version: (base as any).version + 1,
      parentTemplateId: base.id,
      clauses: {
        create: (await prisma.templateClause.findMany({ where: { templateId: base.id } })).map(
          c => ({
            name: c.name,
            category: c.category,
            content: c.content,
            section: c.section,
            position: c.position,
            isRequired: c.isRequired,
            alternatives: c.alternatives as any,
            fallbackClause: c.fallbackClause || undefined,
            riskLevel: c.riskLevel,
            favorability: c.favorability,
            complianceFlags: c.complianceFlags as any,
            regulatoryRefs: c.regulatoryRefs as any,
            recommendedFor: c.recommendedFor as any,
            keywords: c.keywords as any
          })
        )
      }
    },
    include: {
      clauses: true,
      creator: {
        select: { id: true, email: true, firstName: true, lastName: true }
      }
    }
  });

  await auditLog({
    userId,
    action: 'TEMPLATE_VERSION_CREATED',
    resourceType: 'template',
    resourceId: newVersion.id,
    ipAddress,
    userAgent,
    metadata: { fromTemplateId: templateId, version: newVersion.version }
  });

  return newVersion;
};

/**
 * Basic usage stats for a template
 */
export const getTemplateUsageStats = async (templateId: string, userId: string) => {
  // Access check via getTemplateById (throws if not allowed)
  await getTemplateById(templateId, userId);

  const totalContracts = await prisma.contract.count({ where: { templateId } });
  const last30Days = await prisma.contract.count({
    where: {
      templateId,
      createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }
  });

  return {
    totalContracts,
    last30Days
  };
};

// ============================================================================
// TEMPLATE POPULATION (CONTRACT CREATION FROM TEMPLATE)
// ============================================================================

/**
 * Populate template with field values to create contract content
 */
export function populateTemplate(
  content: string,
  fieldValues: Record<string, any>
): string {
  let populated = content;

  // Replace {{field_name}} with actual values
  for (const [key, value] of Object.entries(fieldValues)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    populated = populated.replace(regex, formatValue(value));
  }

  // Handle conditional sections {{#if field}}...{{/if}}
  populated = processConditionals(populated, fieldValues);

  // Handle loops {{#each items}}...{{/each}}
  populated = processLoops(populated, fieldValues);

  return populated;
}

function formatValue(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (value instanceof Date) {
    return value.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  if (typeof value === 'number') {
    return value.toLocaleString();
  }

  if (Array.isArray(value)) {
    return value.join(', ');
  }

  if (typeof value === 'object') {
    // Handle complex objects (e.g., party information)
    return Object.values(value).join(' ');
  }

  return String(value);
}

function processConditionals(content: string, values: Record<string, any>): string {
  // Process {{#if field}}content{{/if}}
  const ifRegex = /{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g;

  return content.replace(ifRegex, (match, field, innerContent) => {
    const value = values[field];
    return value ? innerContent : '';
  });
}

function processLoops(content: string, values: Record<string, any>): string {
  // Process {{#each items}}{{name}}{{/each}}
  const eachRegex = /{{#each\s+(\w+)}}([\s\S]*?){{\/each}}/g;

  return content.replace(eachRegex, (match, field, template) => {
    const items = values[field];
    if (!Array.isArray(items)) {
      return '';
    }

    return items
      .map(item => {
        let itemContent = template;
        for (const [key, value] of Object.entries(item)) {
          itemContent = itemContent.replace(new RegExp(`{{${key}}}`, 'g'), formatValue(value));
        }
        return itemContent;
      })
      .join('\n');
  });
}

// ============================================================================
// TEMPLATE PREVIEW
// ============================================================================

/**
 * Generate preview of template with sample data
 */
export const previewTemplate = async (
  templateId: string,
  sampleData?: Record<string, any>
) => {
  const template = await prisma.contractTemplate.findUnique({
    where: { id: templateId },
    include: {
      clauses: {
        orderBy: { position: 'asc' }
      }
    }
  });

  if (!template) {
    throw new AppError('Template not found', 404);
  }

  // Generate sample data if not provided
  const data = sampleData || generateSampleData(template.requiredFields as TemplateField[]);

  // Populate template
  const populatedContent = populateTemplate(template.content, data);

  return {
    template: {
      id: template.id,
      name: template.name,
      contractType: template.contractType
    },
    preview: populatedContent,
    sampleData: data
  };
};

function generateSampleData(fields: TemplateField[]): Record<string, any> {
  const data: Record<string, any> = {};

  for (const field of fields) {
    switch (field.type) {
      case 'TEXT':
        data[field.name] = field.placeholder || `Sample ${field.label}`;
        break;
      case 'NUMBER':
        data[field.name] = 1000;
        break;
      case 'DATE':
        data[field.name] = new Date();
        break;
      case 'CURRENCY':
        data[field.name] = 50000;
        break;
      case 'PERCENTAGE':
        data[field.name] = 15;
        break;
      case 'BOOLEAN':
        data[field.name] = true;
        break;
      case 'SELECT':
        data[field.name] = field.options?.[0]?.value || 'Option 1';
        break;
      case 'MULTI_SELECT':
        data[field.name] = field.options?.slice(0, 2).map(o => o.value) || [];
        break;
      default:
        data[field.name] = field.defaultValue || '';
    }
  }

  return data;
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

function validateTemplateStructure(structure: TemplateStructure) {
  if (!structure.sections || !Array.isArray(structure.sections)) {
    throw new AppError('Template structure must have sections array', 400);
  }

  if (structure.sections.length === 0) {
    throw new AppError('Template must have at least one section', 400);
  }

  // Check for unique section IDs
  const sectionIds = structure.sections.map(s => s.id);
  const uniqueIds = new Set(sectionIds);
  if (sectionIds.length !== uniqueIds.size) {
    throw new AppError('Section IDs must be unique', 400);
  }
}

function validateTemplateFields(
  requiredFields: TemplateField[],
  optionalFields: TemplateField[]
) {
  const allFields = [...requiredFields, ...optionalFields];

  // Check for unique field names
  const fieldNames = allFields.map(f => f.name);
  const uniqueNames = new Set(fieldNames);
  if (fieldNames.length !== uniqueNames.size) {
    throw new AppError('Field names must be unique', 400);
  }

  // Validate field structure
  for (const field of allFields) {
    if (!field.name || !field.label || !field.type) {
      throw new AppError('Fields must have name, label, and type', 400);
    }

    if (field.type === 'SELECT' || field.type === 'MULTI_SELECT') {
      if (!field.options || field.options.length === 0) {
        throw new AppError(`${field.label} must have options`, 400);
      }
    }
  }
}

function getDefaultFormatting(): TemplateFormatting {
  return {
    fontSize: 12,
    fontFamily: 'Arial, sans-serif',
    lineHeight: 1.5,
    margins: {
      top: 72,  // 1 inch
      bottom: 72,
      left: 72,
      right: 72
    }
  };
}
