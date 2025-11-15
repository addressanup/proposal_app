import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as connectionController from '../controllers/connection.controller';

const router = Router();

// All connection routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/connections
 * @desc    Create a connection with another user
 * @access  Private
 */
router.post(
  '/',
  connectionController.createConnection
);

/**
 * @route   GET /api/connections
 * @desc    Get all connections for current user
 * @access  Private
 */
router.get(
  '/',
  connectionController.getUserConnections
);

/**
 * @route   GET /api/connections/stats
 * @desc    Get connection statistics for current user
 * @access  Private
 */
router.get(
  '/stats',
  connectionController.getConnectionStats
);

/**
 * @route   GET /api/connections/user/:userId
 * @desc    Get connection with a specific user
 * @access  Private
 */
router.get(
  '/user/:userId',
  connectionController.getConnectionWithUser
);

/**
 * @route   GET /api/connections/check/:userId
 * @desc    Check if connected with a specific user
 * @access  Private
 */
router.get(
  '/check/:userId',
  connectionController.checkConnection
);

/**
 * @route   PATCH /api/connections/:connectionId
 * @desc    Update connection status
 * @access  Private
 */
router.patch(
  '/:connectionId',
  connectionController.updateConnectionStatus
);

/**
 * @route   POST /api/connections/:connectionId/block
 * @desc    Block a connection
 * @access  Private
 */
router.post(
  '/:connectionId/block',
  connectionController.blockConnection
);

/**
 * @route   POST /api/connections/:connectionId/archive
 * @desc    Archive a connection
 * @access  Private
 */
router.post(
  '/:connectionId/archive',
  connectionController.archiveConnection
);

/**
 * @route   POST /api/connections/:connectionId/activate
 * @desc    Activate a connection
 * @access  Private
 */
router.post(
  '/:connectionId/activate',
  connectionController.activateConnection
);

export default router;
