import { prisma } from './setup';
import * as commentService from '../services/comment.service';
import * as authService from '../services/auth.service';
import * as proposalService from '../services/proposal.service';

describe('Comment Service', () => {
  let testUserId: string;
  let secondUserId: string;
  let testOrgId: string;
  let testProposalId: string;

  beforeEach(async () => {
    // Create test users
    const user = await authService.register(
      {
        email: 'commenttest@example.com',
        password: 'SecurePass123!',
        firstName: 'Test',
        lastName: 'User'
      },
      '127.0.0.1',
      'test-user-agent'
    );
    testUserId = user.user.id;

    const secondUser = await authService.register(
      {
        email: 'commenttest2@example.com',
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
        name: 'Comment Test Organization',
        slug: 'comment-test-org',
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

    // Create test proposal
    const proposal = await proposalService.createProposal(
      {
        title: 'Test Proposal',
        description: 'For comment testing',
        content: '<p>Test content</p>',
        organizationId: testOrgId
      },
      testUserId,
      '127.0.0.1',
      'test-user-agent'
    );
    testProposalId = proposal.id;

    // Add second user as collaborator
    await prisma.proposalCollaborator.create({
      data: {
        proposalId: testProposalId,
        userId: secondUserId,
        role: 'EDITOR'
      }
    });
  });

  describe('createComment', () => {
    const commentData = {
      content: 'This is a test comment',
      proposalId: ''
    };

    beforeEach(() => {
      commentData.proposalId = testProposalId;
    });

    it('should successfully create a comment', async () => {
      const result = await commentService.createComment(
        commentData,
        testUserId,
        '127.0.0.1',
        'test-user-agent'
      );

      expect(result).toHaveProperty('id');
      expect(result.content).toBe(commentData.content);
      expect(result.proposalId).toBe(testProposalId);
      expect(result.authorId).toBe(testUserId);
      expect(result.isResolved).toBe(false);
    });

    it('should create comment with anchor', async () => {
      const commentWithAnchor = {
        ...commentData,
        anchor: 'line-42'
      };

      const result = await commentService.createComment(
        commentWithAnchor,
        testUserId,
        '127.0.0.1',
        'test-user-agent'
      );

      expect(result.anchor).toBe('line-42');
    });

    it('should create threaded comment (reply)', async () => {
      // Create parent comment first
      const parentComment = await commentService.createComment(
        commentData,
        testUserId,
        '127.0.0.1',
        'test-user-agent'
      );

      // Create reply
      const replyData = {
        content: 'This is a reply',
        proposalId: testProposalId,
        parentId: parentComment.id
      };

      const result = await commentService.createComment(
        replyData,
        secondUserId,
        '127.0.0.1',
        'test-user-agent'
      );

      expect(result.parentId).toBe(parentComment.id);
      expect(result.authorId).toBe(secondUserId);
    });

    it('should throw error if user not collaborator', async () => {
      const outsideUser = await authService.register(
        {
          email: 'outsidecomment@example.com',
          password: 'SecurePass123!',
          firstName: 'Outside',
          lastName: 'User'
        },
        '127.0.0.1',
        'test-user-agent'
      );

      await expect(
        commentService.createComment(
          commentData,
          outsideUser.user.id,
          '127.0.0.1',
          'test-user-agent'
        )
      ).rejects.toThrow();
    });

    it('should create audit log entry', async () => {
      const result = await commentService.createComment(
        commentData,
        testUserId,
        '127.0.0.1',
        'test-user-agent'
      );

      const auditLog = await prisma.auditLog.findFirst({
        where: {
          userId: testUserId,
          action: 'COMMENT_CREATED',
          resourceType: 'Comment',
          resourceId: result.id
        }
      });

      expect(auditLog).toBeTruthy();
    });
  });

  describe('updateComment', () => {
    let commentId: string;

    beforeEach(async () => {
      const comment = await commentService.createComment(
        {
          content: 'Original comment',
          proposalId: testProposalId
        },
        testUserId,
        '127.0.0.1',
        'test-user-agent'
      );
      commentId = comment.id;
    });

    it('should successfully update own comment', async () => {
      const updateData = {
        content: 'Updated comment content'
      };

      const result = await commentService.updateComment(
        commentId,
        updateData,
        testUserId,
        '127.0.0.1',
        'test-user-agent'
      );

      expect(result.content).toBe(updateData.content);
    });

    it('should not allow updating other users comments', async () => {
      await expect(
        commentService.updateComment(
          commentId,
          { content: 'Hacked comment' },
          secondUserId,
          '127.0.0.1',
          'test-user-agent'
        )
      ).rejects.toThrow();
    });

    it('should preserve other fields when updating', async () => {
      const originalComment = await prisma.comment.findUnique({
        where: { id: commentId }
      });

      await commentService.updateComment(
        commentId,
        { content: 'New content' },
        testUserId,
        '127.0.0.1',
        'test-user-agent'
      );

      const updatedComment = await prisma.comment.findUnique({
        where: { id: commentId }
      });

      expect(updatedComment!.proposalId).toBe(originalComment!.proposalId);
      expect(updatedComment!.authorId).toBe(originalComment!.authorId);
      expect(updatedComment!.isResolved).toBe(originalComment!.isResolved);
    });
  });

  describe('deleteComment', () => {
    let commentId: string;

    beforeEach(async () => {
      const comment = await commentService.createComment(
        {
          content: 'To be deleted',
          proposalId: testProposalId
        },
        testUserId,
        '127.0.0.1',
        'test-user-agent'
      );
      commentId = comment.id;
    });

    it('should successfully delete own comment', async () => {
      await commentService.deleteComment(
        commentId,
        testUserId,
        '127.0.0.1',
        'test-user-agent'
      );

      const comment = await prisma.comment.findUnique({
        where: { id: commentId }
      });

      expect(comment).toBeNull();
    });

    it('should not allow deleting other users comments', async () => {
      await expect(
        commentService.deleteComment(
          commentId,
          secondUserId,
          '127.0.0.1',
          'test-user-agent'
        )
      ).rejects.toThrow();
    });

    it('should delete child comments when parent deleted', async () => {
      // Create child comment
      const childComment = await commentService.createComment(
        {
          content: 'Child comment',
          proposalId: testProposalId,
          parentId: commentId
        },
        secondUserId,
        '127.0.0.1',
        'test-user-agent'
      );

      // Delete parent
      await commentService.deleteComment(
        commentId,
        testUserId,
        '127.0.0.1',
        'test-user-agent'
      );

      // Check child is also deleted (cascade)
      const child = await prisma.comment.findUnique({
        where: { id: childComment.id }
      });

      expect(child).toBeNull();
    });

    it('should create audit log entry', async () => {
      await commentService.deleteComment(
        commentId,
        testUserId,
        '127.0.0.1',
        'test-user-agent'
      );

      const auditLog = await prisma.auditLog.findFirst({
        where: {
          userId: testUserId,
          action: 'COMMENT_DELETED',
          resourceType: 'Comment',
          resourceId: commentId
        }
      });

      expect(auditLog).toBeTruthy();
    });
  });

  describe('resolveComment', () => {
    let commentId: string;

    beforeEach(async () => {
      const comment = await commentService.createComment(
        {
          content: 'Comment to resolve',
          proposalId: testProposalId
        },
        testUserId,
        '127.0.0.1',
        'test-user-agent'
      );
      commentId = comment.id;
    });

    it('should successfully resolve comment', async () => {
      const result = await commentService.resolveComment(
        commentId,
        testUserId,
        '127.0.0.1',
        'test-user-agent'
      );

      expect(result.isResolved).toBe(true);
    });

    it('should allow any collaborator to resolve', async () => {
      const result = await commentService.resolveComment(
        commentId,
        secondUserId,
        '127.0.0.1',
        'test-user-agent'
      );

      expect(result.isResolved).toBe(true);
    });

    it('should not allow non-collaborators to resolve', async () => {
      const outsideUser = await authService.register(
        {
          email: 'outsideresolve@example.com',
          password: 'SecurePass123!',
          firstName: 'Outside',
          lastName: 'User'
        },
        '127.0.0.1',
        'test-user-agent'
      );

      await expect(
        commentService.resolveComment(
          commentId,
          outsideUser.user.id,
          '127.0.0.1',
          'test-user-agent'
        )
      ).rejects.toThrow();
    });
  });

  describe('unresolveComment', () => {
    let commentId: string;

    beforeEach(async () => {
      const comment = await commentService.createComment(
        {
          content: 'Comment to unresolve',
          proposalId: testProposalId
        },
        testUserId,
        '127.0.0.1',
        'test-user-agent'
      );
      commentId = comment.id;

      // Resolve it first
      await commentService.resolveComment(
        commentId,
        testUserId,
        '127.0.0.1',
        'test-user-agent'
      );
    });

    it('should successfully unresolve comment', async () => {
      const result = await commentService.unresolveComment(
        commentId,
        testUserId,
        '127.0.0.1',
        'test-user-agent'
      );

      expect(result.isResolved).toBe(false);
    });

    it('should allow any collaborator to unresolve', async () => {
      const result = await commentService.unresolveComment(
        commentId,
        secondUserId,
        '127.0.0.1',
        'test-user-agent'
      );

      expect(result.isResolved).toBe(false);
    });
  });

  describe('getCommentsByProposal', () => {
    beforeEach(async () => {
      // Create multiple comments
      await commentService.createComment(
        {
          content: 'First comment',
          proposalId: testProposalId
        },
        testUserId,
        '127.0.0.1',
        'test-user-agent'
      );

      await commentService.createComment(
        {
          content: 'Second comment',
          proposalId: testProposalId
        },
        secondUserId,
        '127.0.0.1',
        'test-user-agent'
      );
    });

    it('should retrieve all comments for proposal', async () => {
      const comments = await commentService.getCommentsByProposal(
        testProposalId,
        testUserId
      );

      expect(comments).toHaveLength(2);
    });

    it('should include author information', async () => {
      const comments = await commentService.getCommentsByProposal(
        testProposalId,
        testUserId
      );

      expect(comments[0]).toHaveProperty('author');
      expect(comments[0].author).toHaveProperty('firstName');
      expect(comments[0].author).toHaveProperty('lastName');
    });

    it('should not return comments if user not collaborator', async () => {
      const outsideUser = await authService.register(
        {
          email: 'outsideview@example.com',
          password: 'SecurePass123!',
          firstName: 'Outside',
          lastName: 'User'
        },
        '127.0.0.1',
        'test-user-agent'
      );

      await expect(
        commentService.getCommentsByProposal(
          testProposalId,
          outsideUser.user.id
        )
      ).rejects.toThrow();
    });

    it('should order comments by creation date', async () => {
      const comments = await commentService.getCommentsByProposal(
        testProposalId,
        testUserId
      );

      // First comment should be older than second
      expect(new Date(comments[0].createdAt).getTime())
        .toBeLessThanOrEqual(new Date(comments[1].createdAt).getTime());
    });
  });

  describe('Threaded Comments', () => {
    let parentCommentId: string;

    beforeEach(async () => {
      const parent = await commentService.createComment(
        {
          content: 'Parent comment',
          proposalId: testProposalId
        },
        testUserId,
        '127.0.0.1',
        'test-user-agent'
      );
      parentCommentId = parent.id;
    });

    it('should support multiple levels of threading', async () => {
      // Create first level reply
      const reply1 = await commentService.createComment(
        {
          content: 'First reply',
          proposalId: testProposalId,
          parentId: parentCommentId
        },
        secondUserId,
        '127.0.0.1',
        'test-user-agent'
      );

      // Create second level reply
      const reply2 = await commentService.createComment(
        {
          content: 'Second level reply',
          proposalId: testProposalId,
          parentId: reply1.id
        },
        testUserId,
        '127.0.0.1',
        'test-user-agent'
      );

      expect(reply1.parentId).toBe(parentCommentId);
      expect(reply2.parentId).toBe(reply1.id);
    });

    it('should retrieve replies with parent comments', async () => {
      // Create replies
      await commentService.createComment(
        {
          content: 'Reply 1',
          proposalId: testProposalId,
          parentId: parentCommentId
        },
        secondUserId,
        '127.0.0.1',
        'test-user-agent'
      );

      await commentService.createComment(
        {
          content: 'Reply 2',
          proposalId: testProposalId,
          parentId: parentCommentId
        },
        testUserId,
        '127.0.0.1',
        'test-user-agent'
      );

      const comments = await commentService.getCommentsByProposal(
        testProposalId,
        testUserId
      );

      const parentComment = comments.find(c => c.id === parentCommentId);
      expect(parentComment).toHaveProperty('replies');
      expect(parentComment!.replies).toHaveLength(2);
    });
  });

  describe('Anchored Comments', () => {
    it('should support line-specific comments', async () => {
      const comment = await commentService.createComment(
        {
          content: 'Comment on line 10',
          proposalId: testProposalId,
          anchor: 'line-10'
        },
        testUserId,
        '127.0.0.1',
        'test-user-agent'
      );

      expect(comment.anchor).toBe('line-10');
    });

    it('should support selection-based comments', async () => {
      const comment = await commentService.createComment(
        {
          content: 'Comment on selection',
          proposalId: testProposalId,
          anchor: 'selection-42-58'
        },
        testUserId,
        '127.0.0.1',
        'test-user-agent'
      );

      expect(comment.anchor).toBe('selection-42-58');
    });

    it('should filter comments by anchor', async () => {
      // Create comments with different anchors
      await commentService.createComment(
        {
          content: 'Line 5 comment',
          proposalId: testProposalId,
          anchor: 'line-5'
        },
        testUserId,
        '127.0.0.1',
        'test-user-agent'
      );

      await commentService.createComment(
        {
          content: 'Line 10 comment',
          proposalId: testProposalId,
          anchor: 'line-10'
        },
        testUserId,
        '127.0.0.1',
        'test-user-agent'
      );

      const allComments = await commentService.getCommentsByProposal(
        testProposalId,
        testUserId
      );

      const line5Comments = allComments.filter(c => c.anchor === 'line-5');
      expect(line5Comments).toHaveLength(1);
    });
  });
});
