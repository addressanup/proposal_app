import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as signatureController from '../controllers/signature.controller';

const router = Router();

/**
 * Signature routes
 * Includes both authenticated and public routes
 */

// Public routes (no authentication required)
// These are used by signers who may not have accounts
router.get(
  '/sign/verify/:token',
  signatureController.verifySignerToken
);

router.post(
  '/sign/:token',
  signatureController.signDocument
);

router.post(
  '/sign/:token/decline',
  signatureController.declineSignature
);

// Authenticated routes
router.use(authenticate);

// Create signature request
router.post(
  '/signature-requests',
  signatureController.createSignatureRequest
);

// Get signature request details
router.get(
  '/signature-requests/:id',
  signatureController.getSignatureRequest
);

// Send reminder
router.post(
  '/signature-requests/:id/remind',
  signatureController.sendSignatureReminder
);

// Cancel signature request
router.post(
  '/signature-requests/:id/cancel',
  signatureController.cancelSignatureRequest
);

// Get all signature requests for a proposal
router.get(
  '/proposals/:proposalId/signature-requests',
  signatureController.getProposalSignatureRequests
);

export default router;
