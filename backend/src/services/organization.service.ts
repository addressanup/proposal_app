import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { auditLog } from './audit.service';
import { Role } from '@prisma/client';

interface CreateOrganizationData {
  name: string;
  slug: string;
  description?: string;
}

export const createOrganization = async (
  data: CreateOrganizationData,
  creatorId: string,
  ipAddress: string,
  userAgent: string
) => {
  const { name, slug, description } = data;

  // Check if slug is already taken
  const existing = await prisma.organization.findUnique({ where: { slug } });
  if (existing) {
    throw new AppError('Organization slug already exists', 400);
  }

  // Create organization and add creator as owner
  const organization = await prisma.organization.create({
    data: {
      name,
      slug,
      description,
      members: {
        create: {
          userId: creatorId,
          role: Role.OWNER
        }
      }
    },
    include: {
      members: {
        include: {
          user: {
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

  await auditLog({
    userId: creatorId,
    action: 'ORGANIZATION_CREATED',
    resourceType: 'organization',
    resourceId: organization.id,
    ipAddress,
    userAgent
  });

  return organization;
};

export const getUserOrganizations = async (userId: string) => {
  const memberships = await prisma.organizationMember.findMany({
    where: { userId },
    include: {
      organization: {
        include: {
          _count: {
            select: {
              members: true,
              proposals: true
            }
          }
        }
      }
    },
    orderBy: { joinedAt: 'desc' }
  });

  return memberships.map(m => ({
    ...m.organization,
    role: m.role,
    joinedAt: m.joinedAt
  }));
};

export const getOrganizationById = async (orgId: string, userId: string) => {
  // Check if user is a member
  const membership = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId: orgId
      }
    }
  });

  if (!membership) {
    throw new AppError('Access denied', 403);
  }

  const organization = await prisma.organization.findUnique({
    where: { id: orgId },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { joinedAt: 'asc' }
      },
      _count: {
        select: {
          proposals: true
        }
      }
    }
  });

  if (!organization) {
    throw new AppError('Organization not found', 404);
  }

  return organization;
};

export const inviteMember = async (
  orgId: string,
  email: string,
  role: Role,
  inviterId: string,
  ipAddress: string,
  userAgent: string
) => {
  // Check if inviter has permission (must be OWNER or ADMIN)
  const inviter = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId: inviterId,
        organizationId: orgId
      }
    }
  });

  if (!inviter || (inviter.role !== Role.OWNER && inviter.role !== Role.ADMIN)) {
    throw new AppError('Insufficient permissions', 403);
  }

  // Find user by email
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Check if user is already a member
  const existingMember = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId: user.id,
        organizationId: orgId
      }
    }
  });

  if (existingMember) {
    throw new AppError('User is already a member', 400);
  }

  // Add user as member
  const member = await prisma.organizationMember.create({
    data: {
      userId: user.id,
      organizationId: orgId,
      role,
      invitedBy: inviterId
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });

  await auditLog({
    userId: inviterId,
    action: 'MEMBER_INVITED',
    resourceType: 'organization',
    resourceId: orgId,
    ipAddress,
    userAgent,
    metadata: { invitedUserId: user.id, role }
  });

  return member;
};

export const removeMember = async (
  orgId: string,
  memberId: string,
  removerId: string,
  ipAddress: string,
  userAgent: string
) => {
  // Check if remover has permission (must be OWNER or ADMIN)
  const remover = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId: removerId,
        organizationId: orgId
      }
    }
  });

  if (!remover || (remover.role !== Role.OWNER && remover.role !== Role.ADMIN)) {
    throw new AppError('Insufficient permissions', 403);
  }

  // Cannot remove yourself
  if (removerId === memberId) {
    throw new AppError('Cannot remove yourself', 400);
  }

  // Remove member
  await prisma.organizationMember.delete({
    where: {
      userId_organizationId: {
        userId: memberId,
        organizationId: orgId
      }
    }
  });

  await auditLog({
    userId: removerId,
    action: 'MEMBER_REMOVED',
    resourceType: 'organization',
    resourceId: orgId,
    ipAddress,
    userAgent,
    metadata: { removedUserId: memberId }
  });

  return { message: 'Member removed successfully' };
};

export const updateMemberRole = async (
  orgId: string,
  memberId: string,
  newRole: Role,
  updaterId: string,
  ipAddress: string,
  userAgent: string
) => {
  // Check if updater has permission (must be OWNER)
  const updater = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId: updaterId,
        organizationId: orgId
      }
    }
  });

  if (!updater || updater.role !== Role.OWNER) {
    throw new AppError('Only organization owners can update roles', 403);
  }

  // Update role
  const member = await prisma.organizationMember.update({
    where: {
      userId_organizationId: {
        userId: memberId,
        organizationId: orgId
      }
    },
    data: { role: newRole },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });

  await auditLog({
    userId: updaterId,
    action: 'MEMBER_ROLE_UPDATED',
    resourceType: 'organization',
    resourceId: orgId,
    ipAddress,
    userAgent,
    metadata: { memberId, newRole }
  });

  return member;
};
