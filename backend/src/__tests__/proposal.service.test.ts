import { prisma } from './setup';
import * as proposalService from '../services/proposal.service';
import * as authService from '../services/auth.service';

describe('Proposal Service', () => {
  let testUserId: string;
  let testOrgId: string;
  let secondUserId: string;

  beforeEach(async () => {
    // Create test user
    const user = await authService.register(
      {
        email: 'proposaltest@example.com',
        password: 'SecurePass123!',
        firstName: 'Test',
        lastName: 'User'
      },
      '127.0.0.1',
      'test-user-agent'
    );
    testUserId = user.user.id;

    // Create second user
    const secondUser = await authService.register(
      {
        email: 'seconduser@example.com',
        password: 'SecurePass123!',
        firstName: 'Second',
        lastName: 'User'
      },
      '127.0.0.1',
      'test-user-agent'
    );
    secondUserId = secondUser.user.id;

    // Create test organization
    const org = await prisma.organization.create({
      data: {
        name: 'Test Organization',
        slug: 'test-org',
        members: {
          create: [
            {
              userId: testUserId,
              role: 'ADMIN'
            },
            {
              userId: secondUserId,
              role: 'MEMBER'
            }
          ]
        }
      }
    });
    testOrgId = org.id;
  });

  describe('createProposal', () => {
    const proposalData = {
      title: 'Test Proposal',
      description: 'Test Description',
      content: '<p>Test content</p>',
      organizationId: ''
    };

    beforeEach(() => {
      proposalData.organizationId = testOrgId;
    });

    it('should successfully create a proposal', async () => {
      const result = await proposalService.createProposal(
        proposalData,
        testUserId,
        '127.0.0.1',
        'test-user-agent'
      );

      expect(result).toHaveProperty('id');
      expect(result.title).toBe(proposalData.title);
      expect(result.description).toBe(proposalData.description);
      expect(result.content).toBe(proposalData.content);
      expect(result.status).toBe('DRAFT');
      expect(result.organizationId).toBe(testOrgId);
      expect(result.createdById).toBe(testUserId);
    });

    it('should create initial version automatically', async () => {
      const result = await proposalService.createProposal(
        proposalData,
        testUserId,
        '127.0.0.1',
        'test-user-agent'
      );

      const versions = await prisma.proposalVersion.findMany({
        where: { proposalId: result.id }
      });

      expect(versions).toHaveLength(1);
      expect(versions[0].versionNumber).toBe(1);
      expect(versions[0].content).toBe(proposalData.content);
      expect(versions[0].createdById).toBe(testUserId);
    });

    it('should add creator as collaborator', async () => {
      const result = await proposalService.createProposal(
        proposalData,
        testUserId,
        '127.0.0.1',
        'test-user-agent'
      );

      const collaborators = await prisma.proposalCollaborator.findMany({
        where: { proposalId: result.id }
      });

      expect(collaborators).toHaveLength(1);
      expect(collaborators[0].userId).toBe(testUserId);
      expect(collaborators[0].role).toBe('OWNER');
    });

    it('should throw error if user not in organization', async () => {
      const outsideUser = await authService.register(
        {
          email: 'outside@example.com',
          password: 'SecurePass123!',
          firstName: 'Outside',
          lastName: 'User'
        },
        '127.0.0.1',
        'test-user-agent'
      );

      await expect(
        proposalService.createProposal(
          proposalData,
          outsideUser.user.id,
          '127.0.0.1',
          'test-user-agent'
        )
      ).rejects.toThrow('User not in organization');
    });

    it('should create audit log entry', async () => {
      const result = await proposalService.createProposal(
        proposalData,
        testUserId,
        '127.0.0.1',
        'test-user-agent'
      );

      const auditLog = await prisma.auditLog.findFirst({
        where: {
          userId: testUserId,
          action: 'PROPOSAL_CREATED',
          resourceType: 'Proposal',
          resourceId: result.id
        }
      });

      expect(auditLog).toBeTruthy();
    });
  });

  describe('updateProposal', () => {
    let proposalId: string;

    beforeEach(async () => {
      const proposal = await proposalService.createProposal(
        {
          title: 'Original Title',
          description: 'Original Description',
          content: '<p>Original content</p>',
          organizationId: testOrgId
        },
        testUserId,
        '127.0.0.1',
        'test-user-agent'
      );
      proposalId = proposal.id;
    });

    it('should successfully update proposal', async () => {
      const updateData = {
        title: 'Updated Title',
        description: 'Updated Description'
      };

      const result = await proposalService.updateProposal(
        proposalId,
        updateData,
        testUserId,
        '127.0.0.1',
        'test-user-agent'
      );

      expect(result.title).toBe(updateData.title);
      expect(result.description).toBe(updateData.description);
    });

    it('should create new version when content changes', async () => {
      const updateData = {
        content: '<p>New content</p>'
      };

      await proposalService.updateProposal(
        proposalId,
        updateData,
        testUserId,
        '127.0.0.1',
        'test-user-agent'
      );

      const versions = await prisma.proposalVersion.findMany({
        where: { proposalId },
        orderBy: { versionNumber: 'asc' }
      });

      expect(versions).toHaveLength(2);
      expect(versions[1].versionNumber).toBe(2);
      expect(versions[1].content).toBe(updateData.content);
    });

    it('should not create version when content unchanged', async () => {
      const updateData = {
        title: 'New Title Only'
      };

      await proposalService.updateProposal(
        proposalId,
        updateData,
        testUserId,
        '127.0.0.1',
        'test-user-agent'
      );

      const versions = await prisma.proposalVersion.findMany({
        where: { proposalId }
      });

      expect(versions).toHaveLength(1); // Only initial version
    });

    it('should throw error if user not collaborator', async () => {
      const outsideUser = await authService.register(
        {
          email: 'outside2@example.com',
          password: 'SecurePass123!',
          firstName: 'Outside',
          lastName: 'User'
        },
        '127.0.0.1',
        'test-user-agent'
      );

      await expect(
        proposalService.updateProposal(
          proposalId,
          { title: 'Hacked Title' },
          outsideUser.user.id,
          '127.0.0.1',
          'test-user-agent'
        )
      ).rejects.toThrow();
    });

    it('should allow organization members to update', async () => {
      // Second user is a member of the organization
      const updateData = {
        title: 'Updated by Member'
      };

      // First add second user as collaborator
      await prisma.proposalCollaborator.create({
        data: {
          proposalId,
          userId: secondUserId,
          role: 'EDITOR'
        }
      });

      const result = await proposalService.updateProposal(
        proposalId,
        updateData,
        secondUserId,
        '127.0.0.1',
        'test-user-agent'
      );

      expect(result.title).toBe(updateData.title);
    });
  });

  describe('getProposalById', () => {
    let proposalId: string;

    beforeEach(async () => {
      const proposal = await proposalService.createProposal(
        {
          title: 'Test Proposal',
          description: 'Test Description',
          content: '<p>Test content</p>',
          organizationId: testOrgId
        },
        testUserId,
        '127.0.0.1',
        'test-user-agent'
      );
      proposalId = proposal.id;
    });

    it('should retrieve proposal with all relations', async () => {
      const result = await proposalService.getProposalById(
        proposalId,
        testUserId
      );

      expect(result).toBeTruthy();
      expect(result!.id).toBe(proposalId);
      expect(result).toHaveProperty('organization');
      expect(result).toHaveProperty('createdBy');
      expect(result).toHaveProperty('collaborators');
      expect(result).toHaveProperty('versions');
    });

    it('should return null for non-existent proposal', async () => {
      const result = await proposalService.getProposalById(
        'non-existent-id',
        testUserId
      );

      expect(result).toBeNull();
    });

    it('should not return proposal if user not in organization', async () => {
      const outsideUser = await authService.register(
        {
          email: 'outside3@example.com',
          password: 'SecurePass123!',
          firstName: 'Outside',
          lastName: 'User'
        },
        '127.0.0.1',
        'test-user-agent'
      );

      const result = await proposalService.getProposalById(
        proposalId,
        outsideUser.user.id
      );

      expect(result).toBeNull();
    });
  });

  describe('deleteProposal', () => {
    let proposalId: string;

    beforeEach(async () => {
      const proposal = await proposalService.createProposal(
        {
          title: 'To Delete',
          description: 'Will be deleted',
          content: '<p>Delete me</p>',
          organizationId: testOrgId
        },
        testUserId,
        '127.0.0.1',
        'test-user-agent'
      );
      proposalId = proposal.id;
    });

    it('should successfully delete proposal', async () => {
      await proposalService.deleteProposal(
        proposalId,
        testUserId,
        '127.0.0.1',
        'test-user-agent'
      );

      const proposal = await prisma.proposal.findUnique({
        where: { id: proposalId }
      });

      expect(proposal).toBeNull();
    });

    it('should delete related versions', async () => {
      await proposalService.deleteProposal(
        proposalId,
        testUserId,
        '127.0.0.1',
        'test-user-agent'
      );

      const versions = await prisma.proposalVersion.findMany({
        where: { proposalId }
      });

      expect(versions).toHaveLength(0);
    });

    it('should delete related collaborators', async () => {
      await proposalService.deleteProposal(
        proposalId,
        testUserId,
        '127.0.0.1',
        'test-user-agent'
      );

      const collaborators = await prisma.proposalCollaborator.findMany({
        where: { proposalId }
      });

      expect(collaborators).toHaveLength(0);
    });

    it('should only allow owner or admin to delete', async () => {
      // Add second user as viewer (not owner)
      await prisma.proposalCollaborator.create({
        data: {
          proposalId,
          userId: secondUserId,
          role: 'VIEWER'
        }
      });

      await expect(
        proposalService.deleteProposal(
          proposalId,
          secondUserId,
          '127.0.0.1',
          'test-user-agent'
        )
      ).rejects.toThrow();
    });
  });

  describe('Proposal Status Transitions', () => {
    let proposalId: string;

    beforeEach(async () => {
      const proposal = await proposalService.createProposal(
        {
          title: 'Status Test',
          description: 'Testing status',
          content: '<p>Status content</p>',
          organizationId: testOrgId
        },
        testUserId,
        '127.0.0.1',
        'test-user-agent'
      );
      proposalId = proposal.id;
    });

    it('should start with DRAFT status', async () => {
      const proposal = await prisma.proposal.findUnique({
        where: { id: proposalId }
      });

      expect(proposal!.status).toBe('DRAFT');
    });

    it('should allow status update', async () => {
      const result = await proposalService.updateProposal(
        proposalId,
        { status: 'PENDING_REVIEW' },
        testUserId,
        '127.0.0.1',
        'test-user-agent'
      );

      expect(result.status).toBe('PENDING_REVIEW');
    });

    it('should create audit log for status changes', async () => {
      await proposalService.updateProposal(
        proposalId,
        { status: 'FINAL' },
        testUserId,
        '127.0.0.1',
        'test-user-agent'
      );

      const auditLog = await prisma.auditLog.findFirst({
        where: {
          resourceId: proposalId,
          action: 'PROPOSAL_UPDATED'
        }
      });

      expect(auditLog).toBeTruthy();
    });
  });
});
