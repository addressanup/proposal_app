import express from 'express';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';
import * as uploadController from '../controllers/upload.controller';

const router = express.Router();

// All upload routes require authentication
router.use(authenticate);

// Upload document
router.post('/document', upload.single('file'), uploadController.uploadDocument);

// Get presigned upload URL (for direct browser upload)
router.post('/upload-url', uploadController.getUploadUrl);

// Get download URL
router.get('/download/:fileKey', uploadController.getDownloadUrl);

export default router;
