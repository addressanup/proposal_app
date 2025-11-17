-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('EMPLOYMENT', 'OFFER_LETTER', 'NDA', 'VENDOR_SERVICE', 'CONSULTING', 'PARTNERSHIP', 'SALES', 'LEASE', 'IP_LICENSE', 'SUPPLY', 'PROCUREMENT', 'SUBSCRIPTION', 'FREELANCE', 'INTERNSHIP', 'OTHER');

-- CreateEnum
CREATE TYPE "ContractCategory" AS ENUM ('EMPLOYMENT_HR', 'VENDOR_SUPPLIER', 'CONSULTING_PROFESSIONAL', 'REAL_ESTATE', 'PARTNERSHIP_COLLABORATION', 'SALES_DISTRIBUTION', 'IP_TECHNOLOGY', 'CONFIDENTIALITY', 'OTHER');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'IN_REVIEW', 'APPROVED', 'PENDING_SIGNATURE', 'PARTIALLY_SIGNED', 'FULLY_EXECUTED', 'ACTIVE', 'EXPIRING_SOON', 'EXPIRED', 'RENEWED', 'AMENDED', 'TERMINATED', 'ARCHIVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ClauseCategory" AS ENUM ('DEFINITIONS', 'SCOPE_OF_WORK', 'PAYMENT_TERMS', 'TERM_DURATION', 'TERMINATION', 'CONFIDENTIALITY', 'IP_RIGHTS', 'WARRANTIES', 'INDEMNIFICATION', 'LIABILITY', 'INSURANCE', 'DISPUTE_RESOLUTION', 'FORCE_MAJEURE', 'COMPLIANCE', 'AMENDMENTS', 'NOTICES', 'GENERAL_PROVISIONS');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "Favorability" AS ENUM ('HIGHLY_FAVORABLE', 'FAVORABLE', 'NEUTRAL', 'UNFAVORABLE', 'HIGHLY_UNFAVORABLE');

-- CreateEnum
CREATE TYPE "PartyType" AS ENUM ('ORGANIZATION', 'INDIVIDUAL');

-- CreateEnum
CREATE TYPE "PartyRole" AS ENUM ('EMPLOYER', 'EMPLOYEE', 'CONTRACTOR', 'VENDOR', 'SUPPLIER', 'CLIENT', 'PARTNER', 'LANDLORD', 'TENANT', 'LICENSOR', 'LICENSEE', 'BUYER', 'SELLER', 'OTHER');

-- CreateEnum
CREATE TYPE "ObligationType" AS ENUM ('PAYMENT', 'DELIVERY', 'REPORTING', 'COMPLIANCE', 'MAINTENANCE', 'TRAINING', 'SUPPORT', 'OTHER');

-- CreateEnum
CREATE TYPE "ObligationStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MilestoneStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('NOT_DUE', 'DUE', 'PAID', 'OVERDUE', 'DISPUTED');

-- CreateEnum
CREATE TYPE "AmendmentStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PENDING_SIGNATURE', 'EXECUTED', 'REJECTED');

-- CreateTable
CREATE TABLE "contract_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "contractType" "ContractType" NOT NULL,
    "category" "ContractCategory" NOT NULL,
    "subcategory" TEXT,
    "organizationId" TEXT,
    "isGlobal" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "parentTemplateId" TEXT,
    "content" TEXT NOT NULL,
    "structure" JSONB NOT NULL,
    "requiredFields" JSONB NOT NULL,
    "optionalFields" JSONB NOT NULL,
    "conditionalFields" JSONB NOT NULL,
    "formatting" JSONB NOT NULL,
    "headerFooter" JSONB,
    "approvalWorkflow" JSONB,
    "autoActions" JSONB,
    "validationRules" JSONB,
    "jurisdiction" TEXT[],
    "governingLaw" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsed" TIMESTAMP(3),
    "tags" TEXT[],
    "industry" TEXT[],
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contract_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_clauses" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "ClauseCategory" NOT NULL,
    "content" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "alternatives" JSONB,
    "fallbackClause" TEXT,
    "riskLevel" "RiskLevel" NOT NULL,
    "favorability" "Favorability" NOT NULL,
    "complianceFlags" TEXT[],
    "regulatoryRefs" TEXT[],
    "recommendedFor" TEXT[],
    "keywords" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "template_clauses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contracts" (
    "id" TEXT NOT NULL,
    "contractType" "ContractType" NOT NULL,
    "category" "ContractCategory" NOT NULL,
    "subcategory" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "status" "ContractStatus" NOT NULL DEFAULT 'DRAFT',
    "templateId" TEXT,
    "templateFields" JSONB,
    "organizationId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "contractValue" DECIMAL(15,2),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "effectiveDate" TIMESTAMP(3),
    "expirationDate" TIMESTAMP(3),
    "renewalDate" TIMESTAMP(3),
    "terminationDate" TIMESTAMP(3),
    "autoRenew" BOOLEAN NOT NULL DEFAULT false,
    "renewalTermMonths" INTEGER,
    "renewalNoticeDays" INTEGER DEFAULT 30,
    "tags" TEXT[],
    "customFields" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contract_versions" (
    "id" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "changeDescription" TEXT,
    "contractId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "contentDiff" TEXT,
    "linesAdded" INTEGER,
    "linesRemoved" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contract_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "counterparties" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "type" "PartyType" NOT NULL,
    "organizationName" TEXT,
    "registrationNumber" TEXT,
    "taxId" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" JSONB,
    "role" "PartyRole" NOT NULL,
    "signingAuthority" BOOLEAN NOT NULL DEFAULT false,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verificationDate" TIMESTAMP(3),
    "verificationData" JSONB,
    "riskScore" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "counterparties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "obligations" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "type" "ObligationType" NOT NULL,
    "description" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "ObligationStatus" NOT NULL DEFAULT 'PENDING',
    "assignedTo" TEXT,
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "obligations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "milestones" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "targetDate" TIMESTAMP(3) NOT NULL,
    "actualDate" TIMESTAMP(3),
    "status" "MilestoneStatus" NOT NULL,
    "paymentAmount" DECIMAL(15,2),
    "paymentStatus" "PaymentStatus",
    "dependsOn" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "amendments" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "amendmentNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "changes" JSONB NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "status" "AmendmentStatus" NOT NULL,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "requiresSignature" BOOLEAN NOT NULL DEFAULT true,
    "signatureRequestId" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "amendments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contract_templates_organizationId_contractType_isActive_idx" ON "contract_templates"("organizationId", "contractType", "isActive");

-- CreateIndex
CREATE INDEX "contract_templates_isGlobal_contractType_idx" ON "contract_templates"("isGlobal", "contractType");

-- CreateIndex
CREATE INDEX "contract_templates_createdBy_idx" ON "contract_templates"("createdBy");

-- CreateIndex
CREATE INDEX "template_clauses_templateId_category_idx" ON "template_clauses"("templateId", "category");

-- CreateIndex
CREATE INDEX "template_clauses_category_idx" ON "template_clauses"("category");

-- CreateIndex
CREATE INDEX "contracts_organizationId_contractType_status_idx" ON "contracts"("organizationId", "contractType", "status");

-- CreateIndex
CREATE INDEX "contracts_effectiveDate_expirationDate_idx" ON "contracts"("effectiveDate", "expirationDate");

-- CreateIndex
CREATE INDEX "contracts_renewalDate_idx" ON "contracts"("renewalDate");

-- CreateIndex
CREATE INDEX "contracts_creatorId_idx" ON "contracts"("creatorId");

-- CreateIndex
CREATE UNIQUE INDEX "contract_versions_contractId_versionNumber_key" ON "contract_versions"("contractId", "versionNumber");

-- CreateIndex
CREATE INDEX "contract_versions_contractId_idx" ON "contract_versions"("contractId");

-- CreateIndex
CREATE INDEX "contract_versions_createdById_idx" ON "contract_versions"("createdById");

-- CreateIndex
CREATE INDEX "counterparties_contractId_idx" ON "counterparties"("contractId");

-- CreateIndex
CREATE INDEX "counterparties_email_idx" ON "counterparties"("email");

-- CreateIndex
CREATE INDEX "obligations_contractId_status_idx" ON "obligations"("contractId", "status");

-- CreateIndex
CREATE INDEX "obligations_dueDate_idx" ON "obligations"("dueDate");

-- CreateIndex
CREATE INDEX "milestones_contractId_status_idx" ON "milestones"("contractId", "status");

-- CreateIndex
CREATE INDEX "milestones_targetDate_idx" ON "milestones"("targetDate");

-- CreateIndex
CREATE INDEX "amendments_contractId_amendmentNumber_idx" ON "amendments"("contractId", "amendmentNumber");

-- CreateIndex
CREATE INDEX "amendments_status_idx" ON "amendments"("status");

-- AddForeignKey
ALTER TABLE "contract_templates" ADD CONSTRAINT "contract_templates_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_templates" ADD CONSTRAINT "contract_templates_parentTemplateId_fkey" FOREIGN KEY ("parentTemplateId") REFERENCES "contract_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_templates" ADD CONSTRAINT "contract_templates_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_clauses" ADD CONSTRAINT "template_clauses_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "contract_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "contract_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_versions" ADD CONSTRAINT "contract_versions_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_versions" ADD CONSTRAINT "contract_versions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "counterparties" ADD CONSTRAINT "counterparties_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "obligations" ADD CONSTRAINT "obligations_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "amendments" ADD CONSTRAINT "amendments_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "amendments" ADD CONSTRAINT "amendments_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

