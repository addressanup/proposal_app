import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';
import * as documentController from '../controllers/document.controller';

const router = Router();

// All document routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/proposals/:proposalId/documents
 * @desc    Upload a document to a proposal
 * @access  Private (Proposal owner or editor)
 */
router.post(
  '/proposals/:proposalId/documents',
  upload.single('file'),
  documentController.uploadDocument
);

/**
 * @route   GET /api/proposals/:proposalId/documents
 * @desc    Get all documents for a proposal
 * @access  Private (Proposal collaborators)
 */
router.get(
  '/proposals/:proposalId/documents',
  documentController.getProposalDocuments
);

/**
 * @route   GET /api/documents/:documentId
 * @desc    Get document by ID
 * @access  Private (Proposal collaborators)
 */
router.get(
  '/documents/:documentId',
  documentController.getDocument
);

/**
 * @route   GET /api/documents/:documentId/download
 * @desc    Get signed download URL for document
 * @access  Private (Proposal collaborators)
 */
router.get(
  '/documents/:documentId/download',
  documentController.getDocumentDownloadUrl
);

/**
 * @route   DELETE /api/documents/:documentId
 * @desc    Delete a document
 * @access  Private (Proposal owner or editor)
 */
router.delete(
  '/documents/:documentId',
  documentController.deleteDocument
);

export default router;
