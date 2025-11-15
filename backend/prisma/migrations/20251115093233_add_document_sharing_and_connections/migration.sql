-- CreateEnum
CREATE TYPE "ProcessingStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ScanStatus" AS ENUM ('PENDING', 'CLEAN', 'INFECTED', 'FAILED');

-- CreateEnum
CREATE TYPE "ShareLinkType" AS ENUM ('PUBLIC', 'EMAIL_SPECIFIC', 'ONE_TIME', 'PASSWORD_PROTECTED');

-- CreateEnum
CREATE TYPE "LinkAction" AS ENUM ('VIEWED', 'DOWNLOADED', 'COMMENTED', 'SIGNED', 'AUTHENTICATED');

-- CreateEnum
CREATE TYPE "ConnectionType" AS ENUM ('SAME_ORGANIZATION', 'CROSS_ORGANIZATION', 'EXTERNAL_COLLABORATOR');

-- CreateEnum
CREATE TYPE "ConnectionStatus" AS ENUM ('PENDING', 'ACTIVE', 'BLOCKED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'SYSTEM', 'PROPOSAL_UPDATE', 'STATUS_CHANGE');

-- CreateEnum
CREATE TYPE "SigningOrder" AS ENUM ('SEQUENTIAL', 'PARALLEL');

-- CreateEnum
CREATE TYPE "SignatureRequestStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'DECLINED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SignerStatus" AS ENUM ('PENDING', 'SENT', 'VIEWED', 'SIGNED', 'DECLINED');

-- CreateEnum
CREATE TYPE "AuthMethod" AS ENUM ('EMAIL_VERIFICATION', 'TWO_FACTOR_AUTH', 'SMS_OTP', 'BIOMETRIC');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'SHARE_LINK_ACCESSED';
ALTER TYPE "NotificationType" ADD VALUE 'CONNECTION_ESTABLISHED';

-- CreateTable
CREATE TABLE "ProposalDocument" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "originalFileName" TEXT NOT NULL,
    "storedFileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "pageCount" INTEGER,
    "processingStatus" "ProcessingStatus" NOT NULL DEFAULT 'PENDING',
    "ocrText" TEXT,
    "encryptionKey" TEXT,
    "virusScanStatus" "ScanStatus" NOT NULL DEFAULT 'PENDING',
    "virusScanResult" TEXT,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProposalDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProposalShareLink" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "linkType" "ShareLinkType" NOT NULL DEFAULT 'EMAIL_SPECIFIC',
    "allowedEmails" TEXT[],
    "requiresPassword" BOOLEAN NOT NULL DEFAULT false,
    "passwordHash" TEXT,
    "expiresAt" TIMESTAMP(3),
    "isOneTime" BOOLEAN NOT NULL DEFAULT false,
    "hasBeenAccessed" BOOLEAN NOT NULL DEFAULT false,
    "accessedAt" TIMESTAMP(3),
    "canComment" BOOLEAN NOT NULL DEFAULT true,
    "canDownload" BOOLEAN NOT NULL DEFAULT true,
    "canSign" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "lastViewedAt" TIMESTAMP(3),
    "customMessage" TEXT,
    "recipientName" TEXT,
    "recipientEmail" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProposalShareLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkAccessLog" (
    "id" TEXT NOT NULL,
    "shareLinkId" TEXT NOT NULL,
    "accessedBy" TEXT,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "geoLocation" TEXT,
    "action" "LinkAction" NOT NULL,
    "accessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LinkAccessLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Connection" (
    "id" TEXT NOT NULL,
    "initiatorId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "connectionType" "ConnectionType" NOT NULL,
    "status" "ConnectionStatus" NOT NULL DEFAULT 'ACTIVE',
    "originProposalId" TEXT,
    "notes" TEXT,
    "tags" TEXT[],
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastInteraction" TIMESTAMP(3),

    CONSTRAINT "Connection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "proposalId" TEXT,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "messageType" "MessageType" NOT NULL DEFAULT 'TEXT',
    "attachments" TEXT[],
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "editedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageRead" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageRead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SignatureRequest" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "signatureType" "SignatureType" NOT NULL,
    "signingOrder" "SigningOrder" NOT NULL DEFAULT 'SEQUENTIAL',
    "status" "SignatureRequestStatus" NOT NULL DEFAULT 'PENDING',
    "completedAt" TIMESTAMP(3),
    "signedDocumentUrl" TEXT,
    "certificateUrl" TEXT,
    "blockchainHash" TEXT,
    "lastReminderSent" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SignatureRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SignatureRequirement" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "signerEmail" TEXT NOT NULL,
    "signerName" TEXT NOT NULL,
    "signingOrder" INTEGER NOT NULL DEFAULT 1,
    "status" "SignerStatus" NOT NULL DEFAULT 'PENDING',
    "signedAt" TIMESTAMP(3),
    "declinedAt" TIMESTAMP(3),
    "declineReason" TEXT,
    "authMethod" "AuthMethod" NOT NULL,
    "authToken" TEXT,
    "signaturePageNumber" INTEGER,
    "signatureX" DOUBLE PRECISION,
    "signatureY" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SignatureRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReminderSchedule" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "reminderDays" INTEGER[],
    "finalReminderBeforeExpiry" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReminderSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProposalDocument_proposalId_idx" ON "ProposalDocument"("proposalId");

-- CreateIndex
CREATE INDEX "ProposalDocument_uploadedById_idx" ON "ProposalDocument"("uploadedById");

-- CreateIndex
CREATE UNIQUE INDEX "ProposalShareLink_token_key" ON "ProposalShareLink"("token");

-- CreateIndex
CREATE INDEX "ProposalShareLink_token_idx" ON "ProposalShareLink"("token");

-- CreateIndex
CREATE INDEX "ProposalShareLink_proposalId_idx" ON "ProposalShareLink"("proposalId");

-- CreateIndex
CREATE INDEX "ProposalShareLink_recipientEmail_idx" ON "ProposalShareLink"("recipientEmail");

-- CreateIndex
CREATE INDEX "ProposalShareLink_createdById_idx" ON "ProposalShareLink"("createdById");

-- CreateIndex
CREATE INDEX "LinkAccessLog_shareLinkId_idx" ON "LinkAccessLog"("shareLinkId");

-- CreateIndex
CREATE INDEX "LinkAccessLog_accessedAt_idx" ON "LinkAccessLog"("accessedAt");

-- CreateIndex
CREATE INDEX "Connection_initiatorId_idx" ON "Connection"("initiatorId");

-- CreateIndex
CREATE INDEX "Connection_recipientId_idx" ON "Connection"("recipientId");

-- CreateIndex
CREATE INDEX "Connection_status_idx" ON "Connection"("status");

-- CreateIndex
CREATE INDEX "Connection_originProposalId_idx" ON "Connection"("originProposalId");

-- CreateIndex
CREATE UNIQUE INDEX "Connection_initiatorId_recipientId_key" ON "Connection"("initiatorId", "recipientId");

-- CreateIndex
CREATE INDEX "Message_connectionId_idx" ON "Message"("connectionId");

-- CreateIndex
CREATE INDEX "Message_proposalId_idx" ON "Message"("proposalId");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- CreateIndex
CREATE INDEX "Message_createdAt_idx" ON "Message"("createdAt");

-- CreateIndex
CREATE INDEX "MessageRead_messageId_idx" ON "MessageRead"("messageId");

-- CreateIndex
CREATE INDEX "MessageRead_userId_idx" ON "MessageRead"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MessageRead_messageId_userId_key" ON "MessageRead"("messageId", "userId");

-- CreateIndex
CREATE INDEX "SignatureRequest_proposalId_idx" ON "SignatureRequest"("proposalId");

-- CreateIndex
CREATE INDEX "SignatureRequest_status_idx" ON "SignatureRequest"("status");

-- CreateIndex
CREATE INDEX "SignatureRequest_createdById_idx" ON "SignatureRequest"("createdById");

-- CreateIndex
CREATE INDEX "SignatureRequirement_requestId_idx" ON "SignatureRequirement"("requestId");

-- CreateIndex
CREATE INDEX "SignatureRequirement_signerEmail_idx" ON "SignatureRequirement"("signerEmail");

-- CreateIndex
CREATE INDEX "SignatureRequirement_status_idx" ON "SignatureRequirement"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ReminderSchedule_requestId_key" ON "ReminderSchedule"("requestId");

-- AddForeignKey
ALTER TABLE "ProposalDocument" ADD CONSTRAINT "ProposalDocument_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalDocument" ADD CONSTRAINT "ProposalDocument_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalShareLink" ADD CONSTRAINT "ProposalShareLink_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalShareLink" ADD CONSTRAINT "ProposalShareLink_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkAccessLog" ADD CONSTRAINT "LinkAccessLog_shareLinkId_fkey" FOREIGN KEY ("shareLinkId") REFERENCES "ProposalShareLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Connection" ADD CONSTRAINT "Connection_initiatorId_fkey" FOREIGN KEY ("initiatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Connection" ADD CONSTRAINT "Connection_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Connection" ADD CONSTRAINT "Connection_originProposalId_fkey" FOREIGN KEY ("originProposalId") REFERENCES "Proposal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "Connection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageRead" ADD CONSTRAINT "MessageRead_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageRead" ADD CONSTRAINT "MessageRead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignatureRequest" ADD CONSTRAINT "SignatureRequest_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignatureRequest" ADD CONSTRAINT "SignatureRequest_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignatureRequirement" ADD CONSTRAINT "SignatureRequirement_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "SignatureRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReminderSchedule" ADD CONSTRAINT "ReminderSchedule_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "SignatureRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
