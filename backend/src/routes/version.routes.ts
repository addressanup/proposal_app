import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate, validateQuery, sanitizeBody } from '../middleware/validation';
import { createVersionSchema, compareVersionsSchema } from '../utils/validators';
import * as versionController from '../controllers/version.controller';

const router = Router();

// All version routes require authentication
router.use(authenticate);

// Apply input sanitization to all POST routes
router.use(sanitizeBody);

/**
 * Version management routes for proposals
 * These routes follow a RESTful pattern with validation
 */

// Create a new version
router.post(
  '/proposals/:proposalId/versions',
  validate(createVersionSchema),
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

// Compare two versions (with query parameter validation)
router.get(
  '/proposals/:proposalId/versions/compare',
  validateQuery(compareVersionsSchema),
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
