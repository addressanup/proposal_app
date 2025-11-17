import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive seed...');

  // ========================================================================
  // DEMO USERS
  // ========================================================================
  console.log('👥 Creating demo users...');

  const hashedPassword = await bcrypt.hash('Demo123!', 10);

  const john = await prisma.user.upsert({
    where: { email: 'john.doe@techcorp.com' },
    update: {},
    create: {
      email: 'john.doe@techcorp.com',
      passwordHash: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });

  const jane = await prisma.user.upsert({
    where: { email: 'jane.smith@techcorp.com' },
    update: {},
    create: {
      email: 'jane.smith@techcorp.com',
      passwordHash: hashedPassword,
      firstName: 'Jane',
      lastName: 'Smith',
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob.wilson@acmecorp.com' },
    update: {},
    create: {
      email: 'bob.wilson@acmecorp.com',
      passwordHash: hashedPassword,
      firstName: 'Bob',
      lastName: 'Wilson',
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });

  const alice = await prisma.user.upsert({
    where: { email: 'alice.johnson@acmecorp.com' },
    update: {},
    create: {
      email: 'alice.johnson@acmecorp.com',
      passwordHash: hashedPassword,
      firstName: 'Alice',
      lastName: 'Johnson',
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });

  const sarah = await prisma.user.upsert({
    where: { email: 'sarah.brown@freelance.com' },
    update: {},
    create: {
      email: 'sarah.brown@freelance.com',
      passwordHash: hashedPassword,
      firstName: 'Sarah',
      lastName: 'Brown',
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });

  console.log('✅ Created 5 demo users');

  // ========================================================================
  // ORGANIZATIONS
  // ========================================================================
  console.log('🏢 Creating organizations...');

  const techCorp = await prisma.organization.upsert({
    where: { slug: 'techcorp' },
    update: {},
    create: {
      name: 'TechCorp Inc.',
      slug: 'techcorp',
      description: 'Leading technology company specializing in software development and consulting',
    },
  });

  const acmeCorp = await prisma.organization.upsert({
    where: { slug: 'acmecorp' },
    update: {},
    create: {
      name: 'Acme Corporation',
      slug: 'acmecorp',
      description: 'Global enterprise solutions provider',
    },
  });

  console.log('✅ Created 2 organizations');

  // ========================================================================
  // ORGANIZATION MEMBERS
  // ========================================================================
  console.log('👔 Adding organization members...');

  await prisma.organizationMember.upsert({
    where: {
      userId_organizationId: {
        userId: john.id,
        organizationId: techCorp.id,
      },
    },
    update: {},
    create: {
      userId: john.id,
      organizationId: techCorp.id,
      role: 'OWNER',
    },
  });

  await prisma.organizationMember.upsert({
    where: {
      userId_organizationId: {
        userId: jane.id,
        organizationId: techCorp.id,
      },
    },
    update: {},
    create: {
      userId: jane.id,
      organizationId: techCorp.id,
      role: 'ADMIN',
    },
  });

  await prisma.organizationMember.upsert({
    where: {
      userId_organizationId: {
        userId: bob.id,
        organizationId: acmeCorp.id,
      },
    },
    update: {},
    create: {
      userId: bob.id,
      organizationId: acmeCorp.id,
      role: 'OWNER',
    },
  });

  await prisma.organizationMember.upsert({
    where: {
      userId_organizationId: {
        userId: alice.id,
        organizationId: acmeCorp.id,
      },
    },
    update: {},
    create: {
      userId: alice.id,
      organizationId: acmeCorp.id,
      role: 'EDITOR',
    },
  });

  console.log('✅ Added organization members');

  // ========================================================================
  // PROPOSALS
  // ========================================================================
  console.log('📄 Creating proposals...');

  const proposal1 = await prisma.proposal.create({
    data: {
      title: 'Software Development Services Proposal',
      description: 'Comprehensive proposal for building a custom CRM system',
      content: '<h1>Software Development Proposal</h1><p>We propose to build a custom CRM solution tailored to your business needs...</p>',
      status: 'PENDING_REVIEW',
      organizationId: techCorp.id,
      creatorId: john.id,
    },
  });

  const proposal2 = await prisma.proposal.create({
    data: {
      title: 'Enterprise Consulting Services',
      description: 'Strategic consulting for digital transformation',
      content: '<h1>Consulting Proposal</h1><p>Our team will help guide your digital transformation journey...</p>',
      status: 'UNDER_NEGOTIATION',
      organizationId: techCorp.id,
      creatorId: jane.id,
    },
  });

  const proposal3 = await prisma.proposal.create({
    data: {
      title: 'Cloud Migration Project',
      description: 'Migration of legacy systems to AWS cloud infrastructure',
      content: '<h1>Cloud Migration Proposal</h1><p>We will migrate your infrastructure to AWS with zero downtime...</p>',
      status: 'DRAFT',
      organizationId: acmeCorp.id,
      creatorId: bob.id,
    },
  });

  console.log('✅ Created 3 proposals');

  // ========================================================================
  // COMMENTS
  // ========================================================================
  console.log('💬 Adding comments...');

  await prisma.comment.create({
    data: {
      content: 'Great proposal! I have a few questions about the timeline.',
      proposalId: proposal1.id,
      authorId: jane.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: 'Can we include additional features in Phase 2?',
      proposalId: proposal2.id,
      authorId: john.id,
    },
  });

  console.log('✅ Added comments');

  // ========================================================================
  // CONNECTIONS
  // ========================================================================
  console.log('🤝 Creating user connections...');

  await prisma.connection.create({
    data: {
      initiatorId: john.id,
      recipientId: bob.id,
      connectionType: 'CROSS_ORGANIZATION',
      status: 'ACTIVE',
      originProposalId: proposal1.id,
    },
  });

  await prisma.connection.create({
    data: {
      initiatorId: jane.id,
      recipientId: alice.id,
      connectionType: 'CROSS_ORGANIZATION',
      status: 'ACTIVE',
    },
  });

  console.log('✅ Created connections');

  // ========================================================================
  // CONTRACTS
  // ========================================================================
  console.log('📋 Creating contracts...');

  const employmentContract = await prisma.contract.create({
    data: {
      title: 'Employment Agreement - Senior Software Engineer',
      description: 'Full-time employment contract for senior developer position',
      content: '<h1>EMPLOYMENT AGREEMENT</h1><p>This agreement is between TechCorp Inc. and Sarah Brown...</p>',
      contractType: 'EMPLOYMENT',
      category: 'EMPLOYMENT_HR',
      status: 'ACTIVE',
      organizationId: techCorp.id,
      creatorId: john.id,
      contractValue: 120000,
      currency: 'USD',
      effectiveDate: new Date('2024-01-15'),
      expirationDate: new Date('2025-01-14'),
      autoRenew: true,
      renewalTermMonths: 12,
      tags: ['employment', 'engineering', 'full-time'],
    },
  });

  const vendorContract = await prisma.contract.create({
    data: {
      title: 'Master Services Agreement - Cloud Services',
      description: 'MSA with cloud infrastructure provider',
      content: '<h1>MASTER SERVICES AGREEMENT</h1><p>Agreement for cloud hosting and infrastructure services...</p>',
      contractType: 'VENDOR_SERVICE',
      category: 'VENDOR_SUPPLIER',
      status: 'ACTIVE',
      organizationId: techCorp.id,
      creatorId: jane.id,
      contractValue: 50000,
      currency: 'USD',
      effectiveDate: new Date('2024-06-01'),
      expirationDate: new Date('2025-05-31'),
      renewalDate: new Date('2025-04-01'),
      autoRenew: true,
      renewalTermMonths: 12,
      renewalNoticeDays: 60,
      tags: ['vendor', 'cloud', 'infrastructure'],
    },
  });

  const ndaContract = await prisma.contract.create({
    data: {
      title: 'Mutual Non-Disclosure Agreement',
      description: 'NDA for strategic partnership discussions',
      content: '<h1>MUTUAL NDA</h1><p>Confidentiality agreement between TechCorp and Acme Corp...</p>',
      contractType: 'NDA',
      category: 'CONFIDENTIALITY',
      status: 'FULLY_EXECUTED',
      organizationId: techCorp.id,
      creatorId: john.id,
      effectiveDate: new Date('2024-03-01'),
      expirationDate: new Date('2026-03-01'),
      tags: ['nda', 'confidentiality', 'partnership'],
    },
  });

  const consultingContract = await prisma.contract.create({
    data: {
      title: 'Independent Contractor Agreement - UX Designer',
      description: 'Consulting agreement for freelance UX design services',
      content: '<h1>CONSULTING AGREEMENT</h1><p>Independent contractor agreement for UX design services...</p>',
      contractType: 'CONSULTING',
      category: 'CONSULTING_PROFESSIONAL',
      status: 'PENDING_SIGNATURE',
      organizationId: acmeCorp.id,
      creatorId: bob.id,
      contractValue: 75000,
      currency: 'USD',
      effectiveDate: new Date('2024-09-01'),
      expirationDate: new Date('2025-02-28'),
      tags: ['consulting', 'design', 'freelance'],
    },
  });

  const expiringContract = await prisma.contract.create({
    data: {
      title: 'Office Lease Agreement',
      description: 'Commercial lease for office space',
      content: '<h1>LEASE AGREEMENT</h1><p>Commercial lease agreement for office premises...</p>',
      contractType: 'LEASE',
      category: 'REAL_ESTATE',
      status: 'EXPIRING_SOON',
      organizationId: techCorp.id,
      creatorId: john.id,
      contractValue: 240000,
      currency: 'USD',
      effectiveDate: new Date('2023-01-01'),
      expirationDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
      renewalDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      tags: ['lease', 'office', 'real-estate'],
    },
  });

  console.log('✅ Created 5 contracts');

  // ========================================================================
  // COUNTERPARTIES
  // ========================================================================
  console.log('👥 Adding counterparties...');

  await prisma.counterparty.create({
    data: {
      contractId: employmentContract.id,
      type: 'INDIVIDUAL',
      firstName: 'Sarah',
      lastName: 'Brown',
      email: 'sarah.brown@freelance.com',
      phone: '+1-555-0123',
      role: 'EMPLOYEE',
      signingAuthority: true,
      isPrimary: true,
    },
  });

  await prisma.counterparty.create({
    data: {
      contractId: vendorContract.id,
      type: 'ORGANIZATION',
      organizationName: 'CloudHost Solutions Inc.',
      registrationNumber: 'CH-2024-567',
      email: 'contracts@cloudhost.com',
      phone: '+1-555-0456',
      role: 'VENDOR',
      signingAuthority: true,
      isPrimary: true,
    },
  });

  await prisma.counterparty.create({
    data: {
      contractId: ndaContract.id,
      type: 'ORGANIZATION',
      organizationName: 'Acme Corporation',
      email: 'legal@acmecorp.com',
      role: 'PARTNER',
      signingAuthority: true,
      isPrimary: true,
    },
  });

  console.log('✅ Added counterparties');

  // ========================================================================
  // OBLIGATIONS
  // ========================================================================
  console.log('📌 Creating obligations...');

  await prisma.obligation.create({
    data: {
      contractId: vendorContract.id,
      type: 'PAYMENT',
      title: 'Monthly Service Payment',
      description: 'Monthly cloud hosting payment',
      responsibleParty: 'US',
      assignedToId: jane.id,
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      status: 'DUE_SOON',
      priority: 'HIGH',
      isRecurring: true,
      recurrenceRule: { freq: 'MONTHLY', interval: 1 },
      financialImpact: 4166.67,
    },
  });

  await prisma.obligation.create({
    data: {
      contractId: vendorContract.id,
      type: 'REVIEW',
      title: 'Quarterly Performance Review',
      description: 'Review vendor SLA compliance and performance metrics',
      responsibleParty: 'US',
      assignedToId: john.id,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: 'UPCOMING',
      priority: 'MEDIUM',
      isRecurring: true,
      recurrenceRule: { freq: 'QUARTERLY' },
    },
  });

  await prisma.obligation.create({
    data: {
      contractId: employmentContract.id,
      type: 'COMPLIANCE',
      title: 'Annual Performance Evaluation',
      description: 'Conduct annual performance review with employee',
      responsibleParty: 'US',
      assignedToId: john.id,
      dueDate: new Date('2025-01-01'),
      status: 'UPCOMING',
      priority: 'MEDIUM',
    },
  });

  await prisma.obligation.create({
    data: {
      contractId: expiringContract.id,
      type: 'RENEWAL',
      title: 'Lease Renewal Decision',
      description: 'Notify landlord of renewal intent',
      responsibleParty: 'US',
      assignedToId: john.id,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      status: 'DUE_SOON',
      priority: 'CRITICAL',
    },
  });

  console.log('✅ Created obligations');

  // ========================================================================
  // MILESTONES
  // ========================================================================
  console.log('🎯 Creating milestones...');

  await prisma.milestone.create({
    data: {
      contractId: consultingContract.id,
      name: 'Project Kickoff',
      description: 'Initial project planning and requirements gathering',
      targetDate: new Date('2024-09-01'),
      actualDate: new Date('2024-09-01'),
      status: 'COMPLETED',
      sequence: 1,
      paymentAmount: 15000,
      paymentStatus: 'PAID',
    },
  });

  await prisma.milestone.create({
    data: {
      contractId: consultingContract.id,
      name: 'Design Phase Complete',
      description: 'Complete UX designs and wireframes',
      targetDate: new Date('2024-10-15'),
      status: 'IN_PROGRESS',
      sequence: 2,
      paymentAmount: 20000,
      paymentStatus: 'NOT_DUE',
    },
  });

  await prisma.milestone.create({
    data: {
      contractId: consultingContract.id,
      name: 'Final Delivery',
      description: 'Deliver all design assets and documentation',
      targetDate: new Date('2025-02-28'),
      status: 'NOT_STARTED',
      sequence: 3,
      paymentAmount: 40000,
      paymentStatus: 'NOT_DUE',
    },
  });

  console.log('✅ Created milestones');

  // ========================================================================
  // AMENDMENTS
  // ========================================================================
  console.log('📝 Creating amendments...');

  await prisma.amendment.create({
    data: {
      contractId: vendorContract.id,
      amendmentNumber: 1,
      title: 'Increase Service Level',
      description: 'Upgrade to premium support tier with 24/7 coverage',
      changes: {
        section: 'Service Level',
        oldValue: 'Standard Support',
        newValue: 'Premium 24/7 Support',
        financialImpact: 10000,
      },
      effectiveDate: new Date('2024-10-01'),
      status: 'EXECUTED',
      approvedBy: jane.id,
      approvedAt: new Date('2024-09-15'),
      createdBy: jane.id,
      requiresSignature: true,
    },
  });

  await prisma.amendment.create({
    data: {
      contractId: employmentContract.id,
      amendmentNumber: 1,
      title: 'Salary Adjustment',
      description: 'Annual merit increase',
      changes: {
        section: 'Compensation',
        oldValue: '$120,000',
        newValue: '$132,000',
        increasePercentage: 10,
      },
      effectiveDate: new Date('2025-01-15'),
      status: 'PENDING_APPROVAL',
      createdBy: john.id,
      requiresSignature: true,
    },
  });

  console.log('✅ Created amendments');

  // ========================================================================
  // REMINDERS
  // ========================================================================
  console.log('⏰ Creating reminders...');

  await prisma.reminder.create({
    data: {
      userId: jane.id,
      type: 'PAYMENT_DUE',
      priority: 'HIGH',
      title: 'Monthly Cloud Hosting Payment Due',
      description: 'Payment due for CloudHost Solutions monthly invoice',
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      reminderDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'PENDING',
      contractId: vendorContract.id,
      isRecurring: true,
      recurringFrequency: 'MONTHLY',
    },
  });

  await prisma.reminder.create({
    data: {
      userId: john.id,
      type: 'CONTRACT_EXPIRATION',
      priority: 'URGENT',
      title: 'Office Lease Expiring Soon',
      description: 'Office lease expires in 25 days - renewal decision needed',
      dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      reminderDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      status: 'PENDING',
      contractId: expiringContract.id,
    },
  });

  await prisma.reminder.create({
    data: {
      userId: john.id,
      type: 'REVIEW_DUE',
      priority: 'MEDIUM',
      title: 'Quarterly Vendor Review',
      description: 'Review CloudHost performance and SLA compliance',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      reminderDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      status: 'PENDING',
      contractId: vendorContract.id,
    },
  });

  await prisma.reminder.create({
    data: {
      userId: bob.id,
      type: 'SIGNATURE_REQUEST',
      priority: 'HIGH',
      title: 'Consulting Agreement Signature Needed',
      description: 'UX Designer contract awaiting signature',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      reminderDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      status: 'PENDING',
      contractId: consultingContract.id,
    },
  });

  await prisma.reminder.create({
    data: {
      userId: jane.id,
      type: 'MILESTONE',
      priority: 'MEDIUM',
      title: 'Design Phase Milestone Due',
      description: 'UX design milestone targetDate approaching',
      dueDate: new Date('2024-10-15'),
      reminderDate: new Date('2024-10-10'),
      status: 'COMPLETED',
      completedAt: new Date('2024-10-08'),
      contractId: consultingContract.id,
    },
  });

  await prisma.reminder.create({
    data: {
      userId: john.id,
      type: 'CUSTOM',
      priority: 'LOW',
      title: 'Follow up on partnership proposal',
      description: 'Check in with Acme Corp about strategic partnership discussions',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      reminderDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      status: 'PENDING',
      proposalId: proposal2.id,
    },
  });

  console.log('✅ Created 6 reminders');

  // ========================================================================
  // NOTIFICATIONS
  // ========================================================================
  console.log('🔔 Creating notifications...');

  await prisma.notification.create({
    data: {
      userId: john.id,
      type: 'PROPOSAL_CREATED',
      title: 'New Proposal Created',
      message: 'Jane Smith created a new proposal: Enterprise Consulting Services',
      resourceType: 'proposal',
      resourceId: proposal2.id,
    },
  });

  await prisma.notification.create({
    data: {
      userId: jane.id,
      type: 'COMMENT_ADDED',
      title: 'New Comment on Proposal',
      message: 'John Doe commented on Software Development Services Proposal',
      isRead: true,
      readAt: new Date(),
      resourceType: 'proposal',
      resourceId: proposal1.id,
    },
  });

  await prisma.notification.create({
    data: {
      userId: bob.id,
      type: 'CONNECTION_ESTABLISHED',
      title: 'New Connection',
      message: 'John Doe connected with you',
      resourceType: 'connection',
    },
  });

  await prisma.notification.create({
    data: {
      userId: john.id,
      type: 'STATUS_CHANGE',
      title: 'Contract Status Updated',
      message: 'Office Lease Agreement status changed to Expiring Soon',
      resourceType: 'contract',
      resourceId: expiringContract.id,
    },
  });

  console.log('✅ Created notifications');

  // ========================================================================
  // MESSAGES
  // ========================================================================
  console.log('💬 Creating messages...');

  const connection = await prisma.connection.findFirst({
    where: {
      initiatorId: john.id,
      recipientId: bob.id,
    },
  });

  if (connection) {
    const message1 = await prisma.message.create({
      data: {
        connectionId: connection.id,
        senderId: john.id,
        content: 'Hi Bob! I wanted to discuss the proposal we sent over. Do you have time this week?',
        messageType: 'TEXT',
        proposalId: proposal1.id,
      },
    });

    await prisma.message.create({
      data: {
        connectionId: connection.id,
        senderId: bob.id,
        content: 'Hi John! Yes, I reviewed it. Looks great! Can we schedule a call for Thursday?',
        messageType: 'TEXT',
        proposalId: proposal1.id,
      },
    });

    // Mark first message as read
    await prisma.messageRead.create({
      data: {
        messageId: message1.id,
        userId: bob.id,
      },
    });

    console.log('✅ Created messages');
  }

  // ========================================================================
  // AUDIT LOGS
  // ========================================================================
  console.log('📊 Creating audit logs...');

  await prisma.auditLog.create({
    data: {
      userId: john.id,
      action: 'CONTRACT_CREATED',
      resourceType: 'contract',
      resourceId: employmentContract.id,
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0',
      metadata: {
        contractTitle: 'Employment Agreement - Senior Software Engineer',
        contractType: 'EMPLOYMENT',
      },
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: jane.id,
      action: 'CONTRACT_UPDATED',
      resourceType: 'contract',
      resourceId: vendorContract.id,
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0',
      metadata: {
        changes: ['status'],
        oldStatus: 'DRAFT',
        newStatus: 'ACTIVE',
      },
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: bob.id,
      action: 'PROPOSAL_VIEWED',
      resourceType: 'proposal',
      resourceId: proposal1.id,
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0',
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: john.id,
      action: 'OBLIGATION_CREATED',
      resourceType: 'obligation',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0',
      metadata: {
        obligationType: 'PAYMENT',
        contractId: vendorContract.id,
      },
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: jane.id,
      action: 'REMINDER_CREATED',
      resourceType: 'reminder',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0',
      metadata: {
        reminderType: 'PAYMENT_DUE',
        priority: 'HIGH',
      },
    },
  });

  console.log('✅ Created audit logs');

  // ========================================================================
  // CONTRACT TEMPLATES
  // ========================================================================
  console.log('📋 Creating contract templates...');

  await prisma.contractTemplate.upsert({
    where: { id: 'template-employment-tech' },
    update: {},
    create: {
      id: 'template-employment-tech',
      name: 'Full-Time Employment Agreement - Tech Industry',
      description: 'Comprehensive employment agreement for technology companies',
      contractType: 'EMPLOYMENT',
      category: 'EMPLOYMENT_HR',
      isGlobal: true,
      isActive: true,
      version: 1,
      content: `<h1>EMPLOYMENT AGREEMENT</h1>
<p>This Employment Agreement is entered into between {{company_name}} and {{employee_name}}.</p>
<h2>Position</h2>
<p>Title: {{job_title}}</p>
<p>Department: {{department}}</p>
<h2>Compensation</h2>
<p>Annual Salary: ${{annual_salary}}</p>
<p>Benefits: {{benefits}}</p>`,
      structure: {
        sections: [
          { id: 's1', name: 'Position', order: 1 },
          { id: 's2', name: 'Compensation', order: 2 },
          { id: 's3', name: 'Confidentiality', order: 3 },
        ],
      },
      requiredFields: {
        company_name: { type: 'TEXT', label: 'Company Name' },
        employee_name: { type: 'TEXT', label: 'Employee Name' },
        job_title: { type: 'TEXT', label: 'Job Title' },
        annual_salary: { type: 'CURRENCY', label: 'Annual Salary' },
      },
      optionalFields: {
        department: { type: 'TEXT', label: 'Department' },
        benefits: { type: 'TEXT', label: 'Benefits' },
      },
      conditionalFields: {},
      jurisdiction: ['US'],
      governingLaw: 'State of California',
      language: 'en',
      tags: ['employment', 'full-time', 'tech'],
      industry: ['Technology', 'Software'],
      createdBy: john.id,
    },
  });

  await prisma.contractTemplate.upsert({
    where: { id: 'template-nda-mutual' },
    update: {},
    create: {
      id: 'template-nda-mutual',
      name: 'Mutual Non-Disclosure Agreement',
      description: 'Mutual NDA for two parties sharing confidential information',
      contractType: 'NDA',
      category: 'CONFIDENTIALITY',
      isGlobal: true,
      isActive: true,
      version: 1,
      content: `<h1>MUTUAL NON-DISCLOSURE AGREEMENT</h1>
<p>Between {{party_a_name}} and {{party_b_name}}.</p>
<p>Effective Date: {{effective_date}}</p>
<p>Purpose: {{purpose}}</p>`,
      structure: {
        sections: [
          { id: 's1', name: 'Definitions', order: 1 },
          { id: 's2', name: 'Obligations', order: 2 },
          { id: 's3', name: 'Term', order: 3 },
        ],
      },
      requiredFields: {
        party_a_name: { type: 'TEXT', label: 'Party A Name' },
        party_b_name: { type: 'TEXT', label: 'Party B Name' },
        effective_date: { type: 'DATE', label: 'Effective Date' },
        purpose: { type: 'TEXT', label: 'Purpose' },
      },
      optionalFields: {},
      conditionalFields: {},
      jurisdiction: ['US', 'UK', 'EU'],
      language: 'en',
      tags: ['nda', 'mutual', 'confidentiality'],
      industry: ['General'],
      createdBy: john.id,
    },
  });

  await prisma.contractTemplate.upsert({
    where: { id: 'template-consulting' },
    update: {},
    create: {
      id: 'template-consulting',
      name: 'Independent Contractor Agreement',
      description: 'Consulting agreement for independent contractors',
      contractType: 'CONSULTING',
      category: 'CONSULTING_PROFESSIONAL',
      isGlobal: true,
      isActive: true,
      version: 1,
      content: `<h1>INDEPENDENT CONTRACTOR AGREEMENT</h1>
<p>Company: {{company_name}}</p>
<p>Consultant: {{consultant_name}}</p>
<h2>Scope of Work</h2>
<p>{{scope_of_work}}</p>
<h2>Compensation</h2>
<p>Rate: ${{hourly_rate}}/hour</p>`,
      structure: {
        sections: [
          { id: 's1', name: 'Scope', order: 1 },
          { id: 's2', name: 'Compensation', order: 2 },
          { id: 's3', name: 'IP Rights', order: 3 },
        ],
      },
      requiredFields: {
        company_name: { type: 'TEXT', label: 'Company Name' },
        consultant_name: { type: 'TEXT', label: 'Consultant Name' },
        scope_of_work: { type: 'TEXT', label: 'Scope of Work' },
        hourly_rate: { type: 'CURRENCY', label: 'Hourly Rate' },
      },
      optionalFields: {},
      conditionalFields: {},
      jurisdiction: ['US'],
      language: 'en',
      tags: ['consulting', 'independent contractor', 'freelance'],
      industry: ['Professional Services'],
      createdBy: jane.id,
    },
  });

  console.log('✅ Created 3 contract templates');

  // ========================================================================
  // SUMMARY
  // ========================================================================
  console.log('\n🎉 Seed completed successfully!\n');
  console.log('Summary:');
  console.log('- 5 Demo Users');
  console.log('- 2 Organizations');
  console.log('- 4 Organization Members');
  console.log('- 3 Proposals');
  console.log('- 2 Comments');
  console.log('- 2 User Connections');
  console.log('- 5 Contracts (Employment, Vendor, NDA, Consulting, Lease)');
  console.log('- 3 Counterparties');
  console.log('- 4 Obligations');
  console.log('- 3 Milestones');
  console.log('- 2 Amendments');
  console.log('- 6 Reminders');
  console.log('- 4 Notifications');
  console.log('- 2+ Messages');
  console.log('- 5 Audit Logs');
  console.log('- 3 Contract Templates');
  console.log('\n📝 Demo Credentials:');
  console.log('Email: john.doe@techcorp.com');
  console.log('Password: Demo123!');
  console.log('\nAll users have the same password: Demo123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
