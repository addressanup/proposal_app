import express from 'express';
import { authenticate } from '../middleware/auth';
import * as contractController from '../controllers/contract.controller';

const router = express.Router();

// All contract routes require authentication
router.use(authenticate);

// Contract creation
router.post('/from-template', contractController.createContractFromTemplate);
router.post('/', contractController.createContract);

// Contract CRUD
router.get('/', contractController.listContracts);
router.get('/expiring', contractController.getExpiringContracts);
router.get('/statistics', contractController.getStatistics);
router.get('/:id', contractController.getContract);
router.patch('/:id', contractController.updateContract);
router.delete('/:id', contractController.deleteContract);

// Contract operations
router.post('/:id/archive', contractController.archiveContract);

// Counterparty management
router.post('/:id/counterparties', contractController.addCounterparty);
router.delete('/:id/counterparties/:counterpartyId', contractController.removeCounterparty);

// Obligation management
router.post('/:id/obligations', contractController.addObligation);
router.patch('/obligations/:obligationId/status', contractController.updateObligationStatus);

// Milestone management
router.post('/:id/milestones', contractController.addMilestone);
router.patch('/milestones/:milestoneId/status', contractController.updateMilestoneStatus);

export default router;
