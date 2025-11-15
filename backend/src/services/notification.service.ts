import prisma from '../config/database';
import { NotificationType } from '@prisma/client';
import nodemailer from 'nodemailer';

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  resourceType?: string;
  resourceId?: string;
}

export const createNotification = async (data: CreateNotificationData) => {
  const notification = await prisma.notification.create({
    data: {
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      resourceType: data.resourceType,
      resourceId: data.resourceId,
    },
    include: {
      user: {
        select: {
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  // Send email notification
  await sendEmailNotification(notification);

  return notification;
};

export const createBulkNotifications = async (notifications: CreateNotificationData[]) => {
  const created = await Promise.all(
    notifications.map((notif) => createNotification(notif))
  );
  return created;
};

export const getUserNotifications = async (
  userId: string,
  limit: number = 50,
  offset: number = 0,
  unreadOnly: boolean = false
) => {
  const where: any = { userId };
  if (unreadOnly) {
    where.isRead = false;
  }

  const notifications = await prisma.notification.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  });

  const total = await prisma.notification.count({ where });

  return { notifications, total, limit, offset };
};

export const markAsRead = async (notificationId: string, userId: string) => {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
  });

  if (!notification) {
    throw new Error('Notification not found');
  }

  return await prisma.notification.update({
    where: { id: notificationId },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
};

export const markAllAsRead = async (userId: string) => {
  return await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
};

export const deleteNotification = async (notificationId: string, userId: string) => {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
  });

  if (!notification) {
    throw new Error('Notification not found');
  }

  return await prisma.notification.delete({
    where: { id: notificationId },
  });
};

// Email notification helper
const sendEmailNotification = async (notification: any) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.log('Email not configured, skipping email notification');
      return;
    }

    const emailContent = getEmailTemplate(notification);

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: notification.user.email,
      subject: notification.title,
      html: emailContent,
    });

    console.log(`Email sent to ${notification.user.email}`);
  } catch (error) {
    console.error('Failed to send email notification:', error);
    // Don't throw - notification was created, email is optional
  }
};

const getEmailTemplate = (notification: any) => {
  const { user, title, message, resourceType, resourceId } = notification;
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  let actionUrl = `${baseUrl}/dashboard`;
  if (resourceType === 'proposal' && resourceId) {
    actionUrl = `${baseUrl}/dashboard/proposals/${resourceId}`;
  } else if (resourceType === 'organization' && resourceId) {
    actionUrl = `${baseUrl}/dashboard/organizations/${resourceId}`;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Proposal Platform</h2>
        </div>
        <div class="content">
          <p>Hi ${user.firstName},</p>
          <h3>${title}</h3>
          <p>${message}</p>
          <a href="${actionUrl}" class="button">View Details</a>
        </div>
        <div class="footer">
          <p>This is an automated notification from Proposal Platform.</p>
          <p>If you have any questions, please contact support.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Notification creators for different events
export const notifyProposalCreated = async (proposalId: string, creatorId: string, orgMembers: string[]) => {
  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
    include: { creator: true },
  });

  if (!proposal) return;

  const notifications = orgMembers
    .filter((memberId) => memberId !== creatorId)
    .map((memberId) => ({
      userId: memberId,
      type: NotificationType.PROPOSAL_CREATED,
      title: 'New Proposal Created',
      message: `${proposal.creator.firstName} ${proposal.creator.lastName} created a new proposal: "${proposal.title}"`,
      resourceType: 'proposal',
      resourceId: proposalId,
    }));

  await createBulkNotifications(notifications);
};

export const notifyProposalUpdated = async (proposalId: string, updaterId: string) => {
  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
    include: {
      creator: true,
      organization: {
        include: {
          members: true,
        },
      },
    },
  });

  if (!proposal) return;

  const notifications = proposal.organization.members
    .filter((member) => member.userId !== updaterId)
    .map((member) => ({
      userId: member.userId,
      type: NotificationType.PROPOSAL_UPDATED,
      title: 'Proposal Updated',
      message: `"${proposal.title}" has been updated`,
      resourceType: 'proposal',
      resourceId: proposalId,
    }));

  await createBulkNotifications(notifications);
};

export const notifyCommentAdded = async (
  proposalId: string,
  commentId: string,
  authorId: string,
  parentId?: string
) => {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: {
      author: true,
      proposal: {
        include: {
          creator: true,
          organization: {
            include: {
              members: true,
            },
          },
        },
      },
      parent: {
        include: {
          author: true,
        },
      },
    },
  });

  if (!comment) return;

  const notifications: CreateNotificationData[] = [];

  if (parentId && comment.parent) {
    // Notify parent comment author of reply
    if (comment.parent.authorId !== authorId) {
      notifications.push({
        userId: comment.parent.authorId,
        type: NotificationType.COMMENT_REPLY,
        title: 'New Reply to Your Comment',
        message: `${comment.author.firstName} ${comment.author.lastName} replied to your comment on "${comment.proposal.title}"`,
        resourceType: 'proposal',
        resourceId: proposalId,
      });
    }
  } else {
    // Notify proposal creator of new comment
    if (comment.proposal.creatorId !== authorId) {
      notifications.push({
        userId: comment.proposal.creatorId,
        type: NotificationType.COMMENT_ADDED,
        title: 'New Comment on Your Proposal',
        message: `${comment.author.firstName} ${comment.author.lastName} commented on "${comment.proposal.title}"`,
        resourceType: 'proposal',
        resourceId: proposalId,
      });
    }
  }

  await createBulkNotifications(notifications);
};

export const notifyMention = async (userId: string, mentionedBy: string, proposalId: string) => {
  const [user, proposal] = await Promise.all([
    prisma.user.findUnique({ where: { id: mentionedBy } }),
    prisma.proposal.findUnique({ where: { id: proposalId } }),
  ]);

  if (!user || !proposal) return;

  await createNotification({
    userId,
    type: NotificationType.MENTION,
    title: 'You Were Mentioned',
    message: `${user.firstName} ${user.lastName} mentioned you in "${proposal.title}"`,
    resourceType: 'proposal',
    resourceId: proposalId,
  });
};

export const notifyVersionCreated = async (
  proposalId: string,
  versionNumber: number,
  createdById: string,
  changeDescription: string
) => {
  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
    include: {
      organization: {
        include: {
          members: true,
        },
      },
    },
  });

  if (!proposal) return;

  const creator = await prisma.user.findUnique({
    where: { id: createdById },
  });

  if (!creator) return;

  const notifications = proposal.organization.members
    .filter((member) => member.userId !== createdById)
    .map((member) => ({
      userId: member.userId,
      type: NotificationType.PROPOSAL_UPDATED,
      title: `New Version: ${proposal.title}`,
      message: `${creator.firstName} ${creator.lastName} created version ${versionNumber}: ${changeDescription}`,
      resourceType: 'proposal',
      resourceId: proposalId,
    }));

  await createBulkNotifications(notifications);
};
