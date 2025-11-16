import express from 'express';
import { authenticate } from '../middleware/auth';
import * as templateController from '../controllers/template.controller';

const router = express.Router();

// All template routes require authentication
router.use(authenticate);

// Template CRUD
router.get('/', templateController.listTemplates);
router.post('/', templateController.createTemplate);
router.get('/:id', templateController.getTemplate);
router.patch('/:id', templateController.updateTemplate);
router.delete('/:id', templateController.deleteTemplate);

// Template operations
router.post('/:id/clone', templateController.cloneTemplate);
router.post('/:id/version', templateController.createTemplateVersion);
router.post('/:id/preview', templateController.previewTemplate);
router.get('/:id/stats', templateController.getTemplateUsageStats);

export default router;
