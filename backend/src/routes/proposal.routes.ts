import express from 'express';
import { authenticate } from '../middleware/auth';
import * as proposalController from '../controllers/proposal.controller';

const router = express.Router();

// All proposal routes require authentication
router.use(authenticate);

// Proposal CRUD
router.get('/', proposalController.getProposals);
router.post('/', proposalController.createProposal);
router.get('/:id', proposalController.getProposal);
router.patch('/:id', proposalController.updateProposal);
router.delete('/:id', proposalController.deleteProposal);

// Collaborators
router.post('/:id/collaborators', proposalController.addCollaborator);
router.delete('/:id/collaborators/:collaboratorId', proposalController.removeCollaborator);

// Comments
router.get('/:id/comments', proposalController.getComments);
router.post('/:id/comments', proposalController.createComment);
router.patch('/:id/comments/:commentId', proposalController.updateComment);
router.delete('/:id/comments/:commentId', proposalController.deleteComment);
router.post('/:id/comments/:commentId/resolve', proposalController.resolveComment);

export default router;
