import express from 'express';
import * as auditController from '../controllers/audit.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get audit logs with filtering and pagination
router.get('/', auditController.getAuditLogs);

export default router;
