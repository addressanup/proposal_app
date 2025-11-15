import express from 'express';
import { authenticate } from '../middleware/auth';
import * as organizationController from '../controllers/organization.controller';

const router = express.Router();

// All organization routes require authentication
router.use(authenticate);

// Organization routes
router.get('/', organizationController.getUserOrganizations);
router.post('/', organizationController.createOrganization);
router.get('/:id', organizationController.getOrganization);

// Member management
router.post('/:id/members', organizationController.inviteMember);
router.delete('/:id/members/:memberId', organizationController.removeMember);
router.patch('/:id/members/:memberId/role', organizationController.updateMemberRole);

export default router;
