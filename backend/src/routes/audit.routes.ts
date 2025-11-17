import express from 'express';
import * as auditController from '../controllers/audit.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get audit logs with filtering and pagination
router.get('/', auditController.getAuditLogs);

export default router;
