import { z } from 'zod';
import { SignatureType, SigningOrder, AuthMethod, ProposalStatus } from '@prisma/client';

/**
 * Common validation schemas for the platform
 */

// Email validation
export const emailSchema = z.string().email().toLowerCase();

// CUID validation
export const cuidSchema = z.string().cuid();

// Proposal validation schemas
export const proposalTitleSchema = z.string().min(1).max(200);
export const proposalDescriptionSchema = z.string().max(1000).optional();
export const proposalContentSchema = z.string().min(1);

export const createProposalSchema = z.object({
  title: proposalTitleSchema,
  description: proposalDescriptionSchema,
  content: proposalContentSchema,
  organizationId: cuidSchema
});

export const updateProposalSchema = z.object({
  title: proposalTitleSchema.optional(),
  description: proposalDescriptionSchema,
  content: proposalContentSchema.optional(),
  status: z.nativeEnum(ProposalStatus).optional()
});

// Version validation schemas
export const createVersionSchema = z.object({
  content: proposalContentSchema,
  changeDescription: z.string().min(1).max(500),
  changeType: z.enum(['MAJOR', 'MINOR', 'PATCH']).optional(),
  changeReason: z.string().optional()
});

export const compareVersionsSchema = z.object({
  fromVersion: z.number().int().positive(),
  toVersion: z.number().int().positive()
}).refine(data => data.fromVersion !== data.toVersion, {
  message: "From and to versions must be different"
}).refine(data => data.fromVersion < data.toVersion, {
  message: "From version should be less than to version"
});

// Signature validation schemas
export const signerSchema = z.object({
  signerEmail: emailSchema,
  signerName: z.string().min(1).max(100),
  signingOrder: z.number().int().positive().optional(),
  authMethod: z.nativeEnum(AuthMethod).optional()
});

export const createSignatureRequestSchema = z.object({
  proposalId: cuidSchema,
  signatureType: z.nativeEnum(SignatureType),
  signingOrder: z.nativeEnum(SigningOrder),
  signers: z.array(signerSchema).min(1).max(20),
  reminderDays: z.array(z.number().int().positive()).optional(),
  expirationDays: z.number().int().positive().max(365).optional()
});

export const signDocumentSchema = z.object({
  signatureImage: z.string().optional(), // Base64 encoded
  geoLocation: z.string().optional()
});

export const declineSignatureSchema = z.object({
  reason: z.string().min(1).max(500)
});

// Comment validation schemas
export const createCommentSchema = z.object({
  content: z.string().min(1).max(5000),
  parentId: cuidSchema.optional(),
  anchorText: z.string().optional(),
  anchorPosition: z.number().int().optional()
});

export const updateCommentSchema = z.object({
  content: z.string().min(1).max(5000)
});

// Organization validation schemas
export const createOrganizationSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z.string().max(500).optional()
});

export const inviteMemberSchema = z.object({
  email: emailSchema,
  role: z.enum(['OWNER', 'ADMIN', 'EDITOR', 'COMMENTATOR', 'VIEWER'])
});

// Collaborator validation schemas
export const addCollaboratorSchema = z.object({
  email: emailSchema,
  permission: z.enum(['OWNER', 'EDITOR', 'COMMENTATOR', 'VIEWER'])
});

// Share link validation schemas
export const createShareLinkSchema = z.object({
  recipientEmail: emailSchema,
  recipientName: z.string().min(1).max(100).optional(),
  linkType: z.enum(['PUBLIC', 'EMAIL_SPECIFIC', 'ONE_TIME', 'PASSWORD_PROTECTED']).optional(),
  password: z.string().min(6).optional(),
  expiresInDays: z.number().int().positive().max(365).optional(),
  canComment: z.boolean().optional(),
  canDownload: z.boolean().optional(),
  canSign: z.boolean().optional(),
  customMessage: z.string().max(1000).optional(),
  sendEmail: z.boolean().optional()
});

// Pagination schemas
export const paginationSchema = z.object({
  limit: z.number().int().positive().max(100).optional().default(50),
  offset: z.number().int().nonnegative().optional().default(0)
});

// Search and filter schemas
export const proposalFilterSchema = z.object({
  organizationId: cuidSchema.optional(),
  status: z.nativeEnum(ProposalStatus).optional(),
  creatorId: cuidSchema.optional(),
  search: z.string().optional()
});

/**
 * Helper function to validate and sanitize data
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Helper function to validate and return errors
 */
export function validateDataSafe<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, errors: result.error };
  }
}

/**
 * Extract validation errors as formatted messages
 */
export function formatValidationErrors(error: z.ZodError): string[] {
  return error.errors.map(err => {
    const path = err.path.join('.');
    return `${path}: ${err.message}`;
  });
}

/**
 * Custom validators
 */

// Validate proposal status transition
export function validateStatusTransition(
  currentStatus: ProposalStatus,
  newStatus: ProposalStatus
): boolean {
  const validTransitions: Record<ProposalStatus, ProposalStatus[]> = {
    DRAFT: ['PENDING_REVIEW', 'ARCHIVED'],
    PENDING_REVIEW: ['UNDER_NEGOTIATION', 'FINAL', 'REJECTED', 'DRAFT'],
    UNDER_NEGOTIATION: ['PENDING_REVIEW', 'FINAL', 'REJECTED'],
    FINAL: ['SIGNED', 'REJECTED'],
    SIGNED: ['ARCHIVED'],
    ARCHIVED: [],
    REJECTED: ['DRAFT']
  };

  return validTransitions[currentStatus]?.includes(newStatus) || false;
}

// Validate file upload
export const fileUploadSchema = z.object({
  filename: z.string().min(1),
  mimetype: z.string().refine(
    (type) => ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'].includes(type),
    { message: 'Invalid file type. Only PDF, DOC, DOCX, JPG, and PNG are allowed.' }
  ),
  size: z.number().max(50 * 1024 * 1024, 'File size must be less than 50MB')
});

/**
 * Business rule validators
 */

// Check if user can edit proposal based on role
export function canEditProposal(role: string): boolean {
  return ['OWNER', 'ADMIN', 'EDITOR'].includes(role);
}

// Check if user can manage members
export function canManageMembers(role: string): boolean {
  return ['OWNER', 'ADMIN'].includes(role);
}

// Check if user can delete proposal
export function canDeleteProposal(role: string): boolean {
  return ['OWNER'].includes(role);
}

// Check if signature request can be created
export function canCreateSignatureRequest(status: ProposalStatus): boolean {
  return status === 'FINAL';
}

// Check if proposal can be updated
export function canUpdateProposal(status: ProposalStatus): boolean {
  return !['SIGNED', 'ARCHIVED'].includes(status);
}
