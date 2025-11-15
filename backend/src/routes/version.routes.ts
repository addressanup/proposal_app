import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as versionController from '../controllers/version.controller';

const router = Router();

// All version routes require authentication
router.use(authenticate);

/**
 * Version management routes for proposals
 * These routes follow a RESTful pattern
 */

// Create a new version
router.post(
  '/proposals/:proposalId/versions',
  versionController.createVersion
);

// Get version history
router.get(
  '/proposals/:proposalId/versions',
  versionController.getVersionHistory
);

// Get version statistics
router.get(
  '/proposals/:proposalId/versions/statistics',
  versionController.getVersionStatistics
);

// Compare two versions
router.get(
  '/proposals/:proposalId/versions/compare',
  versionController.compareVersions
);

// Get specific version
router.get(
  '/proposals/:proposalId/versions/:versionNumber',
  versionController.getVersion
);

// Revert to a specific version
router.post(
  '/proposals/:proposalId/versions/:versionNumber/revert',
  versionController.revertToVersion
);

export default router;
