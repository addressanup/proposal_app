import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { auditLog } from './audit.service';
import { notifyProposalCreated, notifyProposalUpdated } from './notification.service';
import { createVersion } from './version.service';
import { ProposalStatus, Role, CollaboratorPermission, SignatureRequestStatus } from '@prisma/client';
import { validateStatusTransition, canUpdateProposal } from '../utils/validators';

interface CreateProposalData {
  title: string;
  description?: string;
  content: string;
  organizationId: string;
}

interface UpdateProposalData {
  title?: string;
  description?: string;
  content?: string;
  status?: ProposalStatus;
}

export const createProposal = async (
  data: CreateProposalData,
  creatorId: string,
  ipAddress: string,
  userAgent: string
) => {
  const { title, description, content, organizationId } = data;

  // Check if user is a member of the organization
  const membership = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId: creatorId,
        organizationId
      }
    }
  });

  if (!membership) {
    throw new AppError('Access denied', 403);
  }

  // Check if user has permission to create proposals
  if (membership.role === Role.VIEWER) {
    throw new AppError('Insufficient permissions to create proposals', 403);
  }

  // Create proposal with initial version
  const proposal = await prisma.proposal.create({
    data: {
      title,
      description,
      content,
      organizationId,
      creatorId,
      status: ProposalStatus.DRAFT,
      versions: {
        create: {
          versionNumber: 1,
          content,
          changeDescription: 'Initial version',
          createdById: creatorId
        }
      },
      collaborators: {
        create: {
          email: '', // Will be set when adding collaborators
          permission: CollaboratorPermission.OWNER,
          addedBy: creatorId
        }
      }
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
      organization: true,
      versions: {
        orderBy: { versionNumber: 'desc' },
        take: 1
      }
    }
  });

  // Remove the placeholder collaborator
  await prisma.proposalCollaborator.deleteMany({
    where: {
      proposalId: proposal.id,
      email: ''
    }
  });

  await auditLog({
    userId: creatorId,
    action: 'PROPOSAL_CREATED',
    resourceType: 'proposal',
    resourceId: proposal.id,
    ipAddress,
    userAgent,
    metadata: { organizationId, title }
  });

  // Notify organization members
  const orgMembers = await prisma.organizationMember.findMany({
    where: { organizationId },
    select: { userId: true }
  });
  await notifyProposalCreated(
    proposal.id,
    creatorId,
    orgMembers.map(m => m.userId)
  );

  return proposal;
};

export const getProposals = async (userId: string, organizationId?: string) => {
  // Get user's organizations
  const memberships = await prisma.organizationMember.findMany({
    where: { userId },
    select: { organizationId: true }
  });

  const orgIds = memberships.map(m => m.organizationId);

  const where: any = {
    organizationId: { in: orgIds }
  };

  if (organizationId) {
    where.organizationId = organizationId;
  }

  const proposals = await prisma.proposal.findMany({
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
          comments: true,
          versions: true,
          signatures: true
        }
      }
    },
    orderBy: { updatedAt: 'desc' }
  });

  return proposals;
};

export const getProposalById = async (proposalId: string, userId: string) => {
  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
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
      versions: {
        orderBy: { versionNumber: 'desc' },
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
      collaborators: true,
      comments: {
        where: { parentId: null },
        include: {
          author: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          },
          replies: {
            include: {
              author: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      },
      signatures: {
        orderBy: { signedAt: 'desc' }
      },
      signatureRequests: {
        orderBy: { createdAt: 'desc' },
        include: {
          signers: {
            orderBy: { signingOrder: 'asc' },
            select: {
              signerEmail: true,
              signerName: true,
              signingOrder: true,
              status: true,
              signedAt: true,
              declineReason: true
            }
          },
          createdBy: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          }
        }
      }
    }
  });

  if (!proposal) {
    throw new AppError('Proposal not found', 404);
  }

  // Check if user has access
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

  return proposal;
};

export const updateProposal = async (
  proposalId: string,
  data: UpdateProposalData,
  userId: string,
  ipAddress: string,
  userAgent: string,
  changeDescription?: string
) => {
  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
    include: {
      organization: true,
      signatureRequests: {
        where: {
          status: {
            in: [SignatureRequestStatus.PENDING, SignatureRequestStatus.IN_PROGRESS]
          }
        }
      }
    }
  });

  if (!proposal) {
    throw new AppError('Proposal not found', 404);
  }

  // Check if proposal can be updated based on status
  if (!canUpdateProposal(proposal.status)) {
    throw new AppError(
      `Cannot update proposal with status ${proposal.status}. Signed and archived proposals cannot be modified.`,
      400
    );
  }

  // Check permissions
  const membership = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId: proposal.organizationId
      }
    }
  });

  if (!membership || membership.role === Role.VIEWER || membership.role === Role.COMMENTATOR) {
    throw new AppError('Insufficient permissions', 403);
  }

  // Check for active signature requests before allowing content changes
  if ((data.content && data.content !== proposal.content) || data.status) {
    const activeSignatureRequests = proposal.signatureRequests;

    if (activeSignatureRequests && activeSignatureRequests.length > 0) {
      throw new AppError(
        'Cannot modify proposal content or status while there are active signature requests. Please cancel the signature request first.',
        400
      );
    }
  }

  // Validate status transition if status is being changed
  if (data.status && data.status !== proposal.status) {
    if (!validateStatusTransition(proposal.status, data.status)) {
      throw new AppError(
        `Invalid status transition from ${proposal.status} to ${data.status}`,
        400
      );
    }
  }

  // If content changed, create new version using version service
  let versionCreated = false;
  let versionInfo = null;
  if (data.content && data.content !== proposal.content) {
    // Use the enhanced version service to create version with diff
    const versionResult = await createVersion(
      {
        proposalId,
        content: data.content,
        changeDescription: changeDescription || 'Updated proposal content',
        createdById: userId,
        changeType: 'MINOR'
      },
      ipAddress,
      userAgent
    );
    versionCreated = true;
    versionInfo = versionResult;
  }

  const updated = await prisma.proposal.update({
    where: { id: proposalId },
    data: {
      title: data.title,
      description: data.description,
      content: data.content,
      status: data.status
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
      organization: true,
      versions: {
        orderBy: { versionNumber: 'desc' },
        take: 5 // Get latest 5 versions
      }
    }
  });

  await auditLog({
    userId,
    action: 'PROPOSAL_UPDATED',
    resourceType: 'proposal',
    resourceId: proposalId,
    ipAddress,
    userAgent,
    metadata: {
      versionCreated,
      changes: Object.keys(data),
      versionNumber: versionInfo?.version?.versionNumber,
      linesChanged: versionInfo?.statistics,
      statusChanged: data.status !== proposal.status,
      oldStatus: proposal.status,
      newStatus: data.status
    }
  });

  // Notify about update
  await notifyProposalUpdated(proposalId, userId);

  return {
    proposal: updated,
    versionCreated,
    versionInfo
  };
};

export const deleteProposal = async (
  proposalId: string,
  userId: string,
  ipAddress: string,
  userAgent: string
) => {
  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
    include: {
      signatureRequests: {
        where: {
          status: {
            in: [SignatureRequestStatus.PENDING, SignatureRequestStatus.IN_PROGRESS]
          }
        }
      }
    }
  });

  if (!proposal) {
    throw new AppError('Proposal not found', 404);
  }

  // Check for active signature requests
  if (proposal.signatureRequests && proposal.signatureRequests.length > 0) {
    throw new AppError(
      'Cannot delete proposal with active signature requests. Please cancel the signature request first.',
      400
    );
  }

  // Prevent deletion of signed proposals (important for legal compliance)
  if (proposal.status === ProposalStatus.SIGNED) {
    throw new AppError(
      'Cannot delete signed proposals. Signed proposals must be retained for legal compliance. You can archive it instead.',
      400
    );
  }

  // Only creator or organization owner can delete
  if (proposal.creatorId !== userId) {
    const membership = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: proposal.organizationId
        }
      }
    });

    if (!membership || membership.role !== Role.OWNER) {
      throw new AppError('Only proposal creator or organization owner can delete', 403);
    }
  }

  await prisma.proposal.delete({
    where: { id: proposalId }
  });

  await auditLog({
    userId,
    action: 'PROPOSAL_DELETED',
    resourceType: 'proposal',
    resourceId: proposalId,
    ipAddress,
    userAgent,
    metadata: {
      status: proposal.status,
      title: proposal.title
    }
  });

  return { message: 'Proposal deleted successfully' };
};

export const addCollaborator = async (
  proposalId: string,
  email: string,
  permission: CollaboratorPermission,
  userId: string,
  ipAddress: string,
  userAgent: string
) => {
  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId }
  });

  if (!proposal) {
    throw new AppError('Proposal not found', 404);
  }

  // Check permissions
  if (proposal.creatorId !== userId) {
    const membership = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: proposal.organizationId
        }
      }
    });

    if (!membership || (membership.role !== Role.OWNER && membership.role !== Role.ADMIN)) {
      throw new AppError('Insufficient permissions', 403);
    }
  }

  // Check if already a collaborator
  const existing = await prisma.proposalCollaborator.findUnique({
    where: {
      proposalId_email: {
        proposalId,
        email
      }
    }
  });

  if (existing) {
    throw new AppError('User is already a collaborator', 400);
  }

  const collaborator = await prisma.proposalCollaborator.create({
    data: {
      proposalId,
      email,
      permission,
      addedBy: userId
    }
  });

  await auditLog({
    userId,
    action: 'COLLABORATOR_ADDED',
    resourceType: 'proposal',
    resourceId: proposalId,
    ipAddress,
    userAgent,
    metadata: { email, permission }
  });

  return collaborator;
};

export const removeCollaborator = async (
  proposalId: string,
  collaboratorId: string,
  userId: string,
  ipAddress: string,
  userAgent: string
) => {
  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId }
  });

  if (!proposal) {
    throw new AppError('Proposal not found', 404);
  }

  // Check permissions
  if (proposal.creatorId !== userId) {
    throw new AppError('Only proposal creator can remove collaborators', 403);
  }

  await prisma.proposalCollaborator.delete({
    where: { id: collaboratorId }
  });

  await auditLog({
    userId,
    action: 'COLLABORATOR_REMOVED',
    resourceType: 'proposal',
    resourceId: proposalId,
    ipAddress,
    userAgent,
    metadata: { collaboratorId }
  });

  return { message: 'Collaborator removed successfully' };
};

/**
 * Check if a proposal has active signature requests
 * Used by signature service to validate signature request creation
 */
export const hasActiveSignatureRequests = async (proposalId: string): Promise<boolean> => {
  const activeRequests = await prisma.signatureRequest.count({
    where: {
      proposalId,
      status: {
        in: [SignatureRequestStatus.PENDING, SignatureRequestStatus.IN_PROGRESS]
      }
    }
  });

  return activeRequests > 0;
};

/**
 * Get proposal status for signature workflow validation
 * Used by signature service before creating signature requests
 */
export const getProposalForSignature = async (proposalId: string, userId: string) => {
  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
    select: {
      id: true,
      title: true,
      content: true,
      status: true,
      organizationId: true,
      creatorId: true,
      updatedAt: true,
      versions: {
        orderBy: { versionNumber: 'desc' },
        take: 1,
        select: {
          versionNumber: true,
          content: true,
          createdAt: true
        }
      }
    }
  });

  if (!proposal) {
    throw new AppError('Proposal not found', 404);
  }

  // Check if user has access
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

  return proposal;
};
