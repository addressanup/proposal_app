import { PrismaClient, ConnectionType, ConnectionStatus, NotificationType } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

interface ConnectionInfo {
  id: string;
  initiatorId: string;
  recipientId: string;
  initiator: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  recipient: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  connectionType: ConnectionType;
  status: ConnectionStatus;
  originProposalId?: string;
  connectedAt: Date;
  lastInteraction?: Date;
}

/**
 * Create or retrieve connection between two users
 * This is called automatically when a recipient signs up via share link
 */
export const createConnection = async (
  initiatorId: string,
  recipientId: string,
  proposalId?: string,
  notes?: string
): Promise<ConnectionInfo> => {
  try {
    // Don't create connection with yourself
    if (initiatorId === recipientId) {
      throw new AppError('Cannot create connection with yourself', 400);
    }

    // Check if connection already exists (bidirectional)
    const existingConnection = await prisma.connection.findFirst({
      where: {
        OR: [
          { initiatorId, recipientId },
          { initiatorId: recipientId, recipientId: initiatorId }
        ]
      },
      include: {
        initiator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (existingConnection) {
      // Update last interaction time
      const updated = await prisma.connection.update({
        where: { id: existingConnection.id },
        data: { lastInteraction: new Date() },
        include: {
          initiator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          recipient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      return formatConnectionInfo(updated);
    }

    // Determine connection type
    const connectionType = await determineConnectionType(initiatorId, recipientId);

    // Create new connection
    const connection = await prisma.connection.create({
      data: {
        initiatorId,
        recipientId,
        connectionType,
        status: ConnectionStatus.ACTIVE,
        originProposalId: proposalId,
        notes,
        lastInteraction: new Date()
      },
      include: {
        initiator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Create notifications for both parties
    await createConnectionNotifications(initiatorId, recipientId, connection.id);

    return formatConnectionInfo(connection);
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error('Create connection error:', error);
    throw new AppError('Failed to create connection', 500);
  }
};

/**
 * Determine connection type based on organization membership
 */
async function determineConnectionType(
  userId1: string,
  userId2: string
): Promise<ConnectionType> {
  // Get organizations for both users
  const user1Orgs = await prisma.organizationMember.findMany({
    where: { userId: userId1 },
    select: { organizationId: true }
  });

  const user2Orgs = await prisma.organizationMember.findMany({
    where: { userId: userId2 },
    select: { organizationId: true }
  });

  const user1OrgIds = user1Orgs.map(om => om.organizationId);
  const user2OrgIds = user2Orgs.map(om => om.organizationId);

  // Check for shared organizations
  const sharedOrgs = user1OrgIds.filter(orgId => user2OrgIds.includes(orgId));

  if (sharedOrgs.length > 0) {
    return ConnectionType.SAME_ORGANIZATION;
  }

  // Check if either user has any organization
  if (user1OrgIds.length > 0 && user2OrgIds.length > 0) {
    return ConnectionType.CROSS_ORGANIZATION;
  }

  return ConnectionType.EXTERNAL_COLLABORATOR;
}

/**
 * Format connection info for response
 */
function formatConnectionInfo(connection: any): ConnectionInfo {
  return {
    id: connection.id,
    initiatorId: connection.initiatorId,
    recipientId: connection.recipientId,
    initiator: connection.initiator,
    recipient: connection.recipient,
    connectionType: connection.connectionType,
    status: connection.status,
    originProposalId: connection.originProposalId || undefined,
    connectedAt: connection.connectedAt,
    lastInteraction: connection.lastInteraction || undefined
  };
}

/**
 * Create notifications for new connection
 */
async function createConnectionNotifications(
  initiatorId: string,
  recipientId: string,
  connectionId: string
): Promise<void> {
  try {
    const [initiator, recipient] = await Promise.all([
      prisma.user.findUnique({ where: { id: initiatorId } }),
      prisma.user.findUnique({ where: { id: recipientId } })
    ]);

    if (!initiator || !recipient) return;

    // Notify recipient about new connection
    await prisma.notification.create({
      data: {
        userId: recipientId,
        type: NotificationType.CONNECTION_ESTABLISHED,
        title: 'New Connection',
        message: `You are now connected with ${initiator.firstName} ${initiator.lastName}`,
        resourceType: 'connection',
        resourceId: connectionId
      }
    });

    // Notify initiator about successful connection
    await prisma.notification.create({
      data: {
        userId: initiatorId,
        type: NotificationType.CONNECTION_ESTABLISHED,
        title: 'Connection Established',
        message: `You are now connected with ${recipient.firstName} ${recipient.lastName}`,
        resourceType: 'connection',
        resourceId: connectionId
      }
    });
  } catch (error) {
    console.error('Create connection notifications error:', error);
    // Don't throw - notification failure shouldn't break connection creation
  }
}

/**
 * Get all connections for a user
 */
export const getUserConnections = async (
  userId: string,
  status?: ConnectionStatus
): Promise<ConnectionInfo[]> => {
  try {
    const where: any = {
      OR: [
        { initiatorId: userId },
        { recipientId: userId }
      ]
    };

    if (status) {
      where.status = status;
    }

    const connections = await prisma.connection.findMany({
      where,
      include: {
        initiator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        lastInteraction: 'desc'
      }
    });

    return connections.map(formatConnectionInfo);
  } catch (error) {
    console.error('Get user connections error:', error);
    throw new AppError('Failed to retrieve connections', 500);
  }
};

/**
 * Get connection between two specific users
 */
export const getConnection = async (
  userId1: string,
  userId2: string
): Promise<ConnectionInfo | null> => {
  try {
    const connection = await prisma.connection.findFirst({
      where: {
        OR: [
          { initiatorId: userId1, recipientId: userId2 },
          { initiatorId: userId2, recipientId: userId1 }
        ]
      },
      include: {
        initiator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    return connection ? formatConnectionInfo(connection) : null;
  } catch (error) {
    console.error('Get connection error:', error);
    throw new AppError('Failed to retrieve connection', 500);
  }
};

/**
 * Update connection status
 */
export const updateConnectionStatus = async (
  connectionId: string,
  userId: string,
  newStatus: ConnectionStatus
): Promise<ConnectionInfo> => {
  try {
    // Verify user is part of the connection
    const connection = await prisma.connection.findFirst({
      where: {
        id: connectionId,
        OR: [
          { initiatorId: userId },
          { recipientId: userId }
        ]
      }
    });

    if (!connection) {
      throw new AppError('Connection not found or access denied', 404);
    }

    const updated = await prisma.connection.update({
      where: { id: connectionId },
      data: {
        status: newStatus,
        lastInteraction: new Date()
      },
      include: {
        initiator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    return formatConnectionInfo(updated);
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error('Update connection status error:', error);
    throw new AppError('Failed to update connection', 500);
  }
};

/**
 * Block a connection
 */
export const blockConnection = async (
  connectionId: string,
  userId: string
): Promise<void> => {
  await updateConnectionStatus(connectionId, userId, ConnectionStatus.BLOCKED);
};

/**
 * Archive a connection
 */
export const archiveConnection = async (
  connectionId: string,
  userId: string
): Promise<void> => {
  await updateConnectionStatus(connectionId, userId, ConnectionStatus.ARCHIVED);
};

/**
 * Activate a connection
 */
export const activateConnection = async (
  connectionId: string,
  userId: string
): Promise<void> => {
  await updateConnectionStatus(connectionId, userId, ConnectionStatus.ACTIVE);
};

/**
 * Check if two users are connected
 */
export const areUsersConnected = async (
  userId1: string,
  userId2: string
): Promise<boolean> => {
  try {
    const connection = await prisma.connection.findFirst({
      where: {
        OR: [
          { initiatorId: userId1, recipientId: userId2 },
          { initiatorId: userId2, recipientId: userId1 }
        ],
        status: ConnectionStatus.ACTIVE
      }
    });

    return !!connection;
  } catch (error) {
    console.error('Check connection error:', error);
    return false;
  }
};

/**
 * Get connection statistics for a user
 */
export const getConnectionStats = async (userId: string) => {
  try {
    const [total, active, pending, blocked, byType] = await Promise.all([
      // Total connections
      prisma.connection.count({
        where: {
          OR: [
            { initiatorId: userId },
            { recipientId: userId }
          ]
        }
      }),

      // Active connections
      prisma.connection.count({
        where: {
          OR: [
            { initiatorId: userId },
            { recipientId: userId }
          ],
          status: ConnectionStatus.ACTIVE
        }
      }),

      // Pending connections
      prisma.connection.count({
        where: {
          OR: [
            { initiatorId: userId },
            { recipientId: userId }
          ],
          status: ConnectionStatus.PENDING
        }
      }),

      // Blocked connections
      prisma.connection.count({
        where: {
          OR: [
            { initiatorId: userId },
            { recipientId: userId }
          ],
          status: ConnectionStatus.BLOCKED
        }
      }),

      // Group by connection type
      prisma.connection.groupBy({
        by: ['connectionType'],
        where: {
          OR: [
            { initiatorId: userId },
            { recipientId: userId }
          ],
          status: ConnectionStatus.ACTIVE
        },
        _count: true
      })
    ]);

    return {
      total,
      active,
      pending,
      blocked,
      byType: {
        sameOrganization: byType.find(t => t.connectionType === ConnectionType.SAME_ORGANIZATION)?._count || 0,
        crossOrganization: byType.find(t => t.connectionType === ConnectionType.CROSS_ORGANIZATION)?._count || 0,
        externalCollaborator: byType.find(t => t.connectionType === ConnectionType.EXTERNAL_COLLABORATOR)?._count || 0
      }
    };
  } catch (error) {
    console.error('Get connection stats error:', error);
    throw new AppError('Failed to retrieve connection statistics', 500);
  }
};
