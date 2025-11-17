import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { auditLog } from './audit.service';
import { sendSignatureRequestEmail, sendSignatureCompletedEmail, sendSignatureReminderEmail } from './email.service';
import { getProposalForSignature, hasActiveSignatureRequests } from './proposal.service';
import { SignatureType, SigningOrder, SignatureRequestStatus, SignerStatus, AuthMethod } from '@prisma/client';
import { canCreateSignatureRequest } from '../utils/validators';
import crypto from 'crypto';
import * as bcrypt from 'bcryptjs';

interface SignerRequirement {
  signerEmail: string;
  signerName: string;
  signingOrder?: number;
  authMethod?: AuthMethod;
}

interface CreateSignatureRequestData {
  proposalId: string;
  signatureType: SignatureType;
  signingOrder: SigningOrder;
  signers: SignerRequirement[];
  reminderDays?: number[];
  expirationDays?: number;
}

/**
 * Create a signature request for a proposal
 */
export const createSignatureRequest = async (
  data: CreateSignatureRequestData,
  createdById: string,
  ipAddress: string,
  userAgent: string
) => {
  const { proposalId, signatureType, signingOrder, signers, reminderDays, expirationDays } = data;

  // Use integrated proposal service to validate and get proposal
  const proposal = await getProposalForSignature(proposalId, createdById);

  // Validate proposal status using business rule validator
  if (!canCreateSignatureRequest(proposal.status)) {
    throw new AppError(
      `Signature requests can only be created for proposals in FINAL status. Current status: ${proposal.status}`,
      400
    );
  }

  // Check if there's already an active signature request using helper
  const hasActive = await hasActiveSignatureRequests(proposalId);
  if (hasActive) {
    throw new AppError(
      'An active signature request already exists for this proposal. Please cancel it before creating a new one.',
      400
    );
  }

  // Generate document hash for tamper detection
  const documentHash = crypto
    .createHash('sha256')
    .update(proposal.content)
    .digest('hex');

  // Create signature request
  const signatureRequest = await prisma.signatureRequest.create({
    data: {
      proposalId,
      signatureType,
      signingOrder,
      status: SignatureRequestStatus.PENDING,
      createdById,
      signers: {
        create: signers.map((signer, index) => ({
          signerEmail: signer.signerEmail,
          signerName: signer.signerName,
          signingOrder: signingOrder === SigningOrder.SEQUENTIAL ? (signer.signingOrder || index + 1) : 1,
          authMethod: signer.authMethod || AuthMethod.EMAIL_VERIFICATION,
          status: SignerStatus.PENDING,
          authToken: crypto.randomBytes(32).toString('hex')
        }))
      },
      reminderSchedule: reminderDays ? {
        create: {
          reminderDays,
          finalReminderBeforeExpiry: 24 // 24 hours before expiry
        }
      } : undefined
    },
    include: {
      signers: true,
      reminderSchedule: true,
      proposal: {
        include: {
          organization: true,
          creator: true
        }
      }
    }
  });

  // Update proposal status
  await prisma.proposal.update({
    where: { id: proposalId },
    data: { status: 'PENDING_REVIEW' }
  });

  // Audit log
  await auditLog({
    userId: createdById,
    action: 'SIGNATURE_REQUEST_CREATED',
    resourceType: 'signature_request',
    resourceId: signatureRequest.id,
    ipAddress,
    userAgent,
    metadata: {
      proposalId,
      signatureType,
      signingOrder,
      signerCount: signers.length,
      documentHash
    }
  });

  // Send email to first signer(s)
  if (signingOrder === SigningOrder.SEQUENTIAL) {
    // Send only to first signer
    const firstSigner = signatureRequest.signers.find(s => s.signingOrder === 1);
    if (firstSigner) {
      await sendSignatureRequestEmail(
        firstSigner.signerEmail,
        firstSigner.signerName,
        signatureRequest.proposal.title,
        `${signatureRequest.proposal.creator.firstName} ${signatureRequest.proposal.creator.lastName}`,
        firstSigner.authToken || ''
      );

      await prisma.signatureRequirement.update({
        where: { id: firstSigner.id },
        data: { status: SignerStatus.SENT }
      });
    }
  } else {
    // Send to all signers
    for (const signer of signatureRequest.signers) {
      await sendSignatureRequestEmail(
        signer.signerEmail,
        signer.signerName,
        signatureRequest.proposal.title,
        `${signatureRequest.proposal.creator.firstName} ${signatureRequest.proposal.creator.lastName}`,
        signer.authToken || ''
      );

      await prisma.signatureRequirement.update({
        where: { id: signer.id },
        data: { status: SignerStatus.SENT }
      });
    }
  }

  // Update request status to IN_PROGRESS
  await prisma.signatureRequest.update({
    where: { id: signatureRequest.id },
    data: { status: SignatureRequestStatus.IN_PROGRESS }
  });

  return signatureRequest;
};

/**
 * Verify signer and get signature request details
 */
export const verifySignerToken = async (token: string) => {
  const requirement = await prisma.signatureRequirement.findFirst({
    where: { authToken: token },
    include: {
      request: {
        include: {
          proposal: {
            include: {
              organization: true,
              creator: true
            }
          },
          signers: true
        }
      }
    }
  });

  if (!requirement) {
    throw new AppError('Invalid or expired signature token', 404);
  }

  if (requirement.status === SignerStatus.SIGNED) {
    throw new AppError('This document has already been signed by you', 400);
  }

  if (requirement.status === SignerStatus.DECLINED) {
    throw new AppError('You have declined to sign this document', 400);
  }

  // Mark as viewed
  if (requirement.status === SignerStatus.SENT || requirement.status === SignerStatus.PENDING) {
    await prisma.signatureRequirement.update({
      where: { id: requirement.id },
      data: { status: SignerStatus.VIEWED }
    });
  }

  return {
    requirement,
    proposal: requirement.request.proposal,
    signatureRequest: requirement.request
  };
};

/**
 * Sign the document
 */
export const signDocument = async (
  token: string,
  signatureData: {
    signatureImage?: string; // Base64 encoded signature
    ipAddress: string;
    userAgent: string;
    geoLocation?: string;
  }
) => {
  const requirement = await prisma.signatureRequirement.findFirst({
    where: { authToken: token },
    include: {
      request: {
        include: {
          proposal: true,
          signers: {
            orderBy: { signingOrder: 'asc' }
          }
        }
      }
    }
  });

  if (!requirement) {
    throw new AppError('Invalid signature token', 404);
  }

  if (requirement.status === SignerStatus.SIGNED) {
    throw new AppError('Document already signed', 400);
  }

  // Generate document hash for signature
  const documentHash = crypto
    .createHash('sha256')
    .update(requirement.request.proposal.content)
    .digest('hex');

  // Create signature record
  const signature = await prisma.signature.create({
    data: {
      proposalId: requirement.request.proposalId,
      signerEmail: requirement.signerEmail,
      signerName: requirement.signerName,
      signatureType: requirement.request.signatureType,
      signatureData: signatureData.signatureImage,
      ipAddress: signatureData.ipAddress,
      userAgent: signatureData.userAgent,
      geoLocation: signatureData.geoLocation,
      documentHash
    }
  });

  // Update requirement status
  await prisma.signatureRequirement.update({
    where: { id: requirement.id },
    data: {
      status: SignerStatus.SIGNED,
      signedAt: new Date()
    }
  });

  // Audit log
  await auditLog({
    action: 'DOCUMENT_SIGNED',
    resourceType: 'signature',
    resourceId: signature.id,
    ipAddress: signatureData.ipAddress,
    userAgent: signatureData.userAgent,
    metadata: {
      signerEmail: requirement.signerEmail,
      proposalId: requirement.request.proposalId,
      signatureRequestId: requirement.requestId,
      documentHash
    }
  });

  // Check if all signatures are completed
  const allSigners = requirement.request.signers;
  const signedCount = await prisma.signatureRequirement.count({
    where: {
      requestId: requirement.requestId,
      status: SignerStatus.SIGNED
    }
  });

  if (signedCount === allSigners.length) {
    // All signatures completed
    await completeSignatureRequest(requirement.requestId);
  } else if (requirement.request.signingOrder === SigningOrder.SEQUENTIAL) {
    // Send email to next signer
    const nextSigner = allSigners.find(
      s => s.signingOrder === requirement.signingOrder + 1
    );

    if (nextSigner && nextSigner.status === SignerStatus.PENDING) {
      await sendSignatureRequestEmail(
        nextSigner.signerEmail,
        nextSigner.signerName,
        requirement.request.proposal.title,
        requirement.signerName,
        nextSigner.authToken || ''
      );

      await prisma.signatureRequirement.update({
        where: { id: nextSigner.id },
        data: { status: SignerStatus.SENT }
      });
    }
  }

  return {
    signature,
    message: 'Document signed successfully',
    allSignaturesCompleted: signedCount === allSigners.length
  };
};

/**
 * Decline to sign
 */
export const declineSignature = async (
  token: string,
  reason: string,
  ipAddress: string,
  userAgent: string
) => {
  const requirement = await prisma.signatureRequirement.findFirst({
    where: { authToken: token },
    include: {
      request: {
        include: {
          proposal: {
            include: {
              creator: true
            }
          }
        }
      }
    }
  });

  if (!requirement) {
    throw new AppError('Invalid signature token', 404);
  }

  // Update requirement
  await prisma.signatureRequirement.update({
    where: { id: requirement.id },
    data: {
      status: SignerStatus.DECLINED,
      declinedAt: new Date(),
      declineReason: reason
    }
  });

  // Update signature request status
  await prisma.signatureRequest.update({
    where: { id: requirement.requestId },
    data: { status: SignatureRequestStatus.DECLINED }
  });

  // Update proposal status
  await prisma.proposal.update({
    where: { id: requirement.request.proposalId },
    data: { status: 'REJECTED' }
  });

  // Audit log
  await auditLog({
    action: 'SIGNATURE_DECLINED',
    resourceType: 'signature_request',
    resourceId: requirement.requestId,
    ipAddress,
    userAgent,
    metadata: {
      signerEmail: requirement.signerEmail,
      reason
    }
  });

  // Notify proposal creator
  await prisma.notification.create({
    data: {
      userId: requirement.request.proposal.creatorId,
      type: 'STATUS_CHANGE',
      title: 'Signature Declined',
      message: `${requirement.signerName} declined to sign "${requirement.request.proposal.title}"`,
      resourceType: 'proposal',
      resourceId: requirement.request.proposalId
    }
  });

  return { message: 'Signature declined' };
};

/**
 * Complete signature request and generate certificate
 */
const completeSignatureRequest = async (requestId: string) => {
  const request = await prisma.signatureRequest.findUnique({
    where: { id: requestId },
    include: {
      proposal: {
        include: {
          creator: true,
          organization: true
        }
      },
      signers: {
        include: {
          request: true
        }
      }
    }
  });

  if (!request) {
    throw new AppError('Signature request not found', 404);
  }

  // Generate certificate of completion
  const certificate = await generateCompletionCertificate(request);

  // Generate blockchain hash for tamper-proof record (optional)
  const blockchainHash = crypto
    .createHash('sha256')
    .update(JSON.stringify({
      proposalId: request.proposalId,
      requestId: request.id,
      signers: request.signers.map(s => ({
        email: s.signerEmail,
        signedAt: s.signedAt
      })),
      completedAt: new Date()
    }))
    .digest('hex');

  // Update signature request
  await prisma.signatureRequest.update({
    where: { id: requestId },
    data: {
      status: SignatureRequestStatus.COMPLETED,
      completedAt: new Date(),
      certificateUrl: certificate.url,
      blockchainHash
    }
  });

  // Update proposal status to SIGNED
  await prisma.proposal.update({
    where: { id: request.proposalId },
    data: { status: 'SIGNED' }
  });

  // Send completion emails to all parties
  const allParties = [
    { email: request.proposal.creator.email, name: `${request.proposal.creator.firstName} ${request.proposal.creator.lastName}` },
    ...request.signers.map(s => ({ email: s.signerEmail, name: s.signerName }))
  ];

  for (const party of allParties) {
    await sendSignatureCompletedEmail(
      party.email,
      party.name,
      request.proposal.title,
      certificate.url,
      blockchainHash
    );
  }

  // Notify all parties
  for (const party of allParties) {
    const user = await prisma.user.findUnique({ where: { email: party.email } });
    if (user) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'PROPOSAL_SIGNED',
          title: 'Agreement Signed',
          message: `All parties have signed "${request.proposal.title}". The agreement is now legally binding.`,
          resourceType: 'proposal',
          resourceId: request.proposalId
        }
      });
    }
  }

  return {
    message: 'All signatures completed',
    certificate,
    blockchainHash
  };
};

/**
 * Generate certificate of completion
 */
const generateCompletionCertificate = async (request: any) => {
  // Get all signatures
  const signatures = await prisma.signature.findMany({
    where: { proposalId: request.proposalId },
    orderBy: { signedAt: 'asc' }
  });

  const certificateData = {
    certificateId: crypto.randomBytes(16).toString('hex'),
    proposalId: request.proposalId,
    proposalTitle: request.proposal.title,
    organizationName: request.proposal.organization.name,
    completedAt: new Date().toISOString(),
    signatureType: request.signatureType,
    signingOrder: request.signingOrder,
    signatures: signatures.map(sig => ({
      signerName: sig.signerName,
      signerEmail: sig.signerEmail,
      signedAt: sig.signedAt,
      ipAddress: sig.ipAddress,
      documentHash: sig.documentHash
    })),
    documentHash: signatures[0]?.documentHash,
    legalStatement: 'This certificate confirms that all parties have electronically signed this agreement in accordance with applicable electronic signature laws (ESIGN Act, UETA, eIDAS). The platform acts as a legal witness to this agreement.',
    platformWitness: {
      platform: 'Proposal Sharing Platform',
      witnessedAt: new Date().toISOString(),
      verificationMethod: 'Email verification and IP tracking',
      complianceFrameworks: ['ESIGN Act', 'UETA', 'eIDAS']
    }
  };

  // In production, you would generate a PDF certificate and upload to S3
  // For now, we'll return the URL structure
  const certificateUrl = `/certificates/${certificateData.certificateId}.pdf`;

  return {
    url: certificateUrl,
    data: certificateData
  };
};

/**
 * Get signature request details
 */
export const getSignatureRequest = async (requestId: string, userId: string) => {
  const request = await prisma.signatureRequest.findUnique({
    where: { id: requestId },
    include: {
      proposal: {
        include: {
          organization: true,
          creator: true
        }
      },
      signers: {
        orderBy: { signingOrder: 'asc' }
      },
      reminderSchedule: true
    }
  });

  if (!request) {
    throw new AppError('Signature request not found', 404);
  }

  // Check access
  const membership = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId: request.proposal.organizationId
      }
    }
  });

  if (!membership) {
    throw new AppError('Access denied', 403);
  }

  return request;
};

/**
 * Get all signature requests for a proposal
 */
export const getProposalSignatureRequests = async (proposalId: string, userId: string) => {
  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
    select: { organizationId: true }
  });

  if (!proposal) {
    throw new AppError('Proposal not found', 404);
  }

  const membership = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId: proposal.organizationId
      }
    }
  });

  if (!membership) {
    throw new AppError('Access denied', 403);
  }

  const requests = await prisma.signatureRequest.findMany({
    where: { proposalId },
    include: {
      signers: true,
      createdBy: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return requests;
};

/**
 * Send reminder to pending signers
 */
export const sendSignatureReminder = async (requestId: string, userId: string) => {
  const request = await prisma.signatureRequest.findUnique({
    where: { id: requestId },
    include: {
      proposal: {
        include: {
          organization: true,
          creator: true
        }
      },
      signers: true
    }
  });

  if (!request) {
    throw new AppError('Signature request not found', 404);
  }

  // Check permission
  const membership = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId: request.proposal.organizationId
      }
    }
  });

  if (!membership) {
    throw new AppError('Access denied', 403);
  }

  // Get pending signers
  const pendingSigners = request.signers.filter(
    s => s.status !== SignerStatus.SIGNED && s.status !== SignerStatus.DECLINED
  );

  if (pendingSigners.length === 0) {
    throw new AppError('No pending signers to remind', 400);
  }

  // Send reminders
  for (const signer of pendingSigners) {
    await sendSignatureReminderEmail(
      signer.signerEmail,
      signer.signerName,
      request.proposal.title,
      signer.authToken || ''
    );
  }

  // Update last reminder sent
  await prisma.signatureRequest.update({
    where: { id: requestId },
    data: { lastReminderSent: new Date() }
  });

  return {
    message: 'Reminders sent',
    remindersSent: pendingSigners.length
  };
};

/**
 * Cancel signature request
 */
export const cancelSignatureRequest = async (
  requestId: string,
  userId: string,
  ipAddress: string,
  userAgent: string
) => {
  const request = await prisma.signatureRequest.findUnique({
    where: { id: requestId },
    include: {
      proposal: {
        include: {
          organization: true
        }
      }
    }
  });

  if (!request) {
    throw new AppError('Signature request not found', 404);
  }

  // Check permission (only creator or org admin)
  if (request.createdById !== userId) {
    const membership = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: request.proposal.organizationId
        }
      }
    });

    if (!membership || (membership.role !== 'OWNER' && membership.role !== 'ADMIN')) {
      throw new AppError('Access denied', 403);
    }
  }

  if (request.status === SignatureRequestStatus.COMPLETED) {
    throw new AppError('Cannot cancel completed signature request', 400);
  }

  // Update status
  await prisma.signatureRequest.update({
    where: { id: requestId },
    data: { status: SignatureRequestStatus.CANCELLED }
  });

  // Revert proposal status
  await prisma.proposal.update({
    where: { id: request.proposalId },
    data: { status: 'FINAL' }
  });

  // Audit log
  await auditLog({
    userId,
    action: 'SIGNATURE_REQUEST_CANCELLED',
    resourceType: 'signature_request',
    resourceId: requestId,
    ipAddress,
    userAgent
  });

  return { message: 'Signature request cancelled' };
};
