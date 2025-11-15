import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as sharingController from '../controllers/sharing.controller';

const router = Router();

/**
 * Public routes (no authentication required)
 */

/**
 * @route   GET /api/sharing/preview/:token
 * @desc    Get proposal info via share link (public)
 * @access  Public
 */
router.get(
  '/preview/:token',
  sharingController.getSharedProposalInfo
);

/**
 * @route   POST /api/sharing/access/:token
 * @desc    Access a proposal via share link
 * @access  Public (may require email/password depending on link type)
 */
router.post(
  '/access/:token',
  sharingController.accessProposalViaLink
);

/**
 * @route   POST /api/sharing/log-action/:token
 * @desc    Log an action on a share link (download, comment, sign)
 * @access  Public
 */
router.post(
  '/log-action/:token',
  sharingController.logLinkAction
);

/**
 * Authenticated routes
 */

/**
 * @route   POST /api/sharing/links
 * @desc    Create a shareable link for a proposal
 * @access  Private (Proposal owner or editor)
 */
router.post(
  '/links',
  authenticate,
  sharingController.createShareLink
);

/**
 * @route   GET /api/proposals/:proposalId/share-links
 * @desc    Get all share links for a proposal
 * @access  Private (Proposal collaborators)
 */
router.get(
  '/proposals/:proposalId/share-links',
  authenticate,
  sharingController.getProposalShareLinks
);

/**
 * @route   DELETE /api/sharing/links/:shareLinkId
 * @desc    Revoke a share link
 * @access  Private (Link creator or proposal owner)
 */
router.delete(
  '/links/:shareLinkId',
  authenticate,
  sharingController.revokeShareLink
);

export default router;
