import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { auditLog } from './audit.service';
import { notifyVersionCreated } from './notification.service';
import * as diff from 'diff';

interface CreateVersionData {
  proposalId: string;
  content: string;
  changeDescription: string;
  createdById: string;
  changeType?: 'MAJOR' | 'MINOR' | 'PATCH';
  changedBy?: string;
  changeReason?: string;
}

/**
 * Create a new version of a proposal (GitHub-like versioning)
 */
export const createVersion = async (
  data: CreateVersionData,
  ipAddress: string,
  userAgent: string
) => {
  const { proposalId, content, changeDescription, createdById, changeType = 'MINOR', changeReason } = data;

  // Get the latest version
  const latestVersion = await prisma.proposalVersion.findFirst({
    where: { proposalId },
    orderBy: { versionNumber: 'desc' }
  });

  const previousContent = latestVersion?.content || '';
  const versionNumber = (latestVersion?.versionNumber || 0) + 1;

  // Calculate diff between versions (like GitHub diff)
  const contentDiff = diff.createPatch(
    `version-${versionNumber}`,
    previousContent,
    content,
    `Version ${latestVersion?.versionNumber || 0}`,
    `Version ${versionNumber}`
  );

  // Count changes
  const changes = diff.diffLines(previousContent, content);
  const linesAdded = changes.filter(c => c.added).reduce((sum, c) => sum + (c.count || 0), 0);
  const linesRemoved = changes.filter(c => c.removed).reduce((sum, c) => sum + (c.count || 0), 0);

  // Create version with metadata
  const version = await prisma.proposalVersion.create({
    data: {
      proposalId,
      versionNumber,
      content,
      changeDescription,
      createdById,
      // Store diff and change metadata in a JSONB field (we'll need to add this to schema)
    },
    include: {
      createdBy: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true
        }
      },
      proposal: {
        select: {
          id: true,
          title: true,
          organizationId: true
        }
      }
    }
  });

  // Update proposal with latest content
  await prisma.proposal.update({
    where: { id: proposalId },
    data: { content }
  });

  // Audit log
  await auditLog({
    userId: createdById,
    action: 'VERSION_CREATED',
    resourceType: 'proposal_version',
    resourceId: version.id,
    ipAddress,
    userAgent,
    metadata: {
      proposalId,
      versionNumber,
      changeType,
      linesAdded,
      linesRemoved,
      changeReason
    }
  });

  // Notify collaborators
  const collaborators = await prisma.proposalCollaborator.findMany({
    where: { proposalId },
    select: { email: true }
  });

  await notifyVersionCreated(proposalId, versionNumber, createdById, changeDescription);

  return {
    version,
    statistics: {
      linesAdded,
      linesRemoved,
      totalChanges: linesAdded + linesRemoved
    },
    diff: contentDiff
  };
};

/**
 * Get all versions for a proposal (like GitHub commit history)
 */
export const getVersionHistory = async (proposalId: string, userId: string) => {
  // Check access
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

  // Get all versions
  const versions = await prisma.proposalVersion.findMany({
    where: { proposalId },
    include: {
      createdBy: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true
        }
      }
    },
    orderBy: { versionNumber: 'desc' }
  });

  return versions;
};

/**
 * Compare two versions (like GitHub compare)
 */
export const compareVersions = async (
  proposalId: string,
  fromVersion: number,
  toVersion: number,
  userId: string
) => {
  // Check access
  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
    select: { organizationId: true, title: true }
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

  // Get both versions
  const [versionFrom, versionTo] = await Promise.all([
    prisma.proposalVersion.findFirst({
      where: { proposalId, versionNumber: fromVersion },
      include: {
        createdBy: {
          select: { id: true, email: true, firstName: true, lastName: true }
        }
      }
    }),
    prisma.proposalVersion.findFirst({
      where: { proposalId, versionNumber: toVersion },
      include: {
        createdBy: {
          select: { id: true, email: true, firstName: true, lastName: true }
        }
      }
    })
  ]);

  if (!versionFrom || !versionTo) {
    throw new AppError('One or both versions not found', 404);
  }

  // Generate diff
  const diffResult = diff.diffLines(versionFrom.content, versionTo.content);

  // Generate unified diff patch
  const patch = diff.createPatch(
    proposal.title,
    versionFrom.content,
    versionTo.content,
    `Version ${fromVersion}`,
    `Version ${toVersion}`
  );

  // Calculate statistics
  let linesAdded = 0;
  let linesRemoved = 0;
  let linesUnchanged = 0;

  diffResult.forEach(part => {
    if (part.added) {
      linesAdded += part.count || 0;
    } else if (part.removed) {
      linesRemoved += part.count || 0;
    } else {
      linesUnchanged += part.count || 0;
    }
  });

  return {
    proposalId,
    proposalTitle: proposal.title,
    fromVersion: {
      number: fromVersion,
      createdAt: versionFrom.createdAt,
      createdBy: versionFrom.createdBy,
      description: versionFrom.changeDescription
    },
    toVersion: {
      number: toVersion,
      createdAt: versionTo.createdAt,
      createdBy: versionTo.createdBy,
      description: versionTo.changeDescription
    },
    diff: diffResult,
    patch,
    statistics: {
      linesAdded,
      linesRemoved,
      linesUnchanged,
      totalLines: linesAdded + linesRemoved + linesUnchanged,
      changePercentage: ((linesAdded + linesRemoved) / (linesAdded + linesRemoved + linesUnchanged) * 100).toFixed(2)
    }
  };
};

/**
 * Get specific version content
 */
export const getVersion = async (proposalId: string, versionNumber: number, userId: string) => {
  // Check access
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

  const version = await prisma.proposalVersion.findFirst({
    where: { proposalId, versionNumber },
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
  });

  if (!version) {
    throw new AppError('Version not found', 404);
  }

  return version;
};

/**
 * Revert to a specific version
 */
export const revertToVersion = async (
  proposalId: string,
  versionNumber: number,
  userId: string,
  ipAddress: string,
  userAgent: string
) => {
  // Get the version to revert to
  const targetVersion = await prisma.proposalVersion.findFirst({
    where: { proposalId, versionNumber }
  });

  if (!targetVersion) {
    throw new AppError('Version not found', 404);
  }

  // Create a new version with the old content
  return await createVersion(
    {
      proposalId,
      content: targetVersion.content,
      changeDescription: `Reverted to version ${versionNumber}`,
      createdById: userId,
      changeType: 'MAJOR',
      changeReason: 'REVERT'
    },
    ipAddress,
    userAgent
  );
};

/**
 * Get version statistics for a proposal
 */
export const getVersionStatistics = async (proposalId: string, userId: string) => {
  // Check access
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

  const versions = await prisma.proposalVersion.findMany({
    where: { proposalId },
    include: {
      createdBy: {
        select: { id: true, firstName: true, lastName: true }
      }
    },
    orderBy: { versionNumber: 'asc' }
  });

  // Calculate contributor statistics
  const contributors = new Map();
  versions.forEach(v => {
    const key = v.createdById;
    if (!contributors.has(key)) {
      contributors.set(key, {
        user: v.createdBy,
        versionCount: 0,
        firstContribution: v.createdAt,
        lastContribution: v.createdAt
      });
    }
    const contrib = contributors.get(key);
    contrib.versionCount++;
    if (v.createdAt > contrib.lastContribution) {
      contrib.lastContribution = v.createdAt;
    }
  });

  return {
    totalVersions: versions.length,
    currentVersion: versions[versions.length - 1]?.versionNumber || 0,
    firstVersion: {
      number: versions[0]?.versionNumber,
      createdAt: versions[0]?.createdAt,
      createdBy: versions[0]?.createdBy
    },
    latestVersion: {
      number: versions[versions.length - 1]?.versionNumber,
      createdAt: versions[versions.length - 1]?.createdAt,
      createdBy: versions[versions.length - 1]?.createdBy
    },
    contributors: Array.from(contributors.values()),
    timespan: {
      start: versions[0]?.createdAt,
      end: versions[versions.length - 1]?.createdAt,
      durationDays: versions.length > 1
        ? Math.floor((new Date(versions[versions.length - 1].createdAt).getTime() - new Date(versions[0].createdAt).getTime()) / (1000 * 60 * 60 * 24))
        : 0
    }
  };
};
