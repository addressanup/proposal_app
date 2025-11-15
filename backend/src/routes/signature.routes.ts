import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate, sanitizeBody, rateLimit } from '../middleware/validation';
import {
  createSignatureRequestSchema,
  signDocumentSchema,
  declineSignatureSchema
} from '../utils/validators';
import * as signatureController from '../controllers/signature.controller';

const router = Router();

/**
 * Signature routes
 * Includes both authenticated and public routes with validation
 */

// Public routes (no authentication required)
// These are used by signers who may not have accounts
// Rate limited to prevent abuse
router.get(
  '/sign/verify/:token',
  rateLimit({ windowMs: 60000, max: 10 }), // 10 requests per minute
  signatureController.verifySignerToken
);

router.post(
  '/sign/:token',
  sanitizeBody,
  rateLimit({ windowMs: 60000, max: 5 }), // 5 signatures per minute
  validate(signDocumentSchema),
  signatureController.signDocument
);

router.post(
  '/sign/:token/decline',
  sanitizeBody,
  rateLimit({ windowMs: 60000, max: 5 }),
  validate(declineSignatureSchema),
  signatureController.declineSignature
);

// Authenticated routes
router.use(authenticate);
router.use(sanitizeBody);

// Create signature request
router.post(
  '/signature-requests',
  validate(createSignatureRequestSchema),
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
  rateLimit({ windowMs: 300000, max: 3 }), // 3 reminders per 5 minutes
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
