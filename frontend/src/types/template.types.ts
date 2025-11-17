export enum ContractType {
  EMPLOYMENT = 'EMPLOYMENT',
  OFFER_LETTER = 'OFFER_LETTER',
  NDA = 'NDA',
  VENDOR_SERVICE = 'VENDOR_SERVICE',
  CONSULTING = 'CONSULTING',
  PARTNERSHIP = 'PARTNERSHIP',
  SALES = 'SALES',
  LEASE = 'LEASE',
  IP_LICENSE = 'IP_LICENSE',
  SUPPLY = 'SUPPLY',
  PROCUREMENT = 'PROCUREMENT',
  SUBSCRIPTION = 'SUBSCRIPTION',
  FREELANCE = 'FREELANCE',
  INTERNSHIP = 'INTERNSHIP',
  OTHER = 'OTHER',
}

export enum ContractCategory {
  EMPLOYMENT_HR = 'EMPLOYMENT_HR',
  VENDOR_SUPPLIER = 'VENDOR_SUPPLIER',
  CONSULTING_PROFESSIONAL = 'CONSULTING_PROFESSIONAL',
  REAL_ESTATE = 'REAL_ESTATE',
  PARTNERSHIP_COLLABORATION = 'PARTNERSHIP_COLLABORATION',
  SALES_DISTRIBUTION = 'SALES_DISTRIBUTION',
  IP_TECHNOLOGY = 'IP_TECHNOLOGY',
  CONFIDENTIALITY = 'CONFIDENTIALITY',
  OTHER = 'OTHER',
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  contractType: ContractType;
  category: ContractCategory;
  content: string;
  structure: any;
  requiredFields: Record<string, any>;
  optionalFields: Record<string, any>;
  conditionalFields: Record<string, any>;
  organizationId?: string;
  isGlobal: boolean;
  isActive: boolean;
  version: number;
  parentTemplateId?: string;
  jurisdiction: string[];
  governingLaw?: string;
  language: string;
  tags: string[];
  industry: string[];
  usageCount: number;
  lastUsed?: string;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  creator?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface CreateTemplateData {
  name: string;
  description?: string;
  contractType: ContractType;
  category: ContractCategory;
  content: string;
  structure: any;
  requiredFields: Record<string, any>;
  optionalFields?: Record<string, any>;
  conditionalFields?: Record<string, any>;
  clauses?: any[];
  organizationId?: string;
  isGlobal?: boolean;
  jurisdiction: string[];
  governingLaw?: string;
  tags?: string[];
  industry?: string[];
}

export interface TemplateFilters {
  contractType?: ContractType;
  category?: ContractCategory;
  organizationId?: string;
  isGlobal?: boolean;
  search?: string;
  tags?: string[];
  industry?: string[];
}
