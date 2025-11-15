import { PrismaClient, ProcessingStatus, ScanStatus } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { uploadFile, deleteFile, getSignedUrl } from './storage.service';
import * as crypto from 'crypto';
import * as path from 'path';

const prisma = new PrismaClient();

interface DocumentUploadOptions {
  file: Express.Multer.File;
  proposalId: string;
  userId: string;
  organizationId: string;
}

interface DocumentInfo {
  id: string;
  originalFileName: string;
  storedFileName: string;
  fileUrl: string;
  thumbnailUrl?: string;
  fileSize: number;
  mimeType: string;
  pageCount?: number;
  processingStatus: ProcessingStatus;
  virusScanStatus: ScanStatus;
  createdAt: Date;
}

/**
 * Upload and process a document for a proposal
 */
export const uploadDocument = async (
  options: DocumentUploadOptions
): Promise<DocumentInfo> => {
  const { file, proposalId, userId, organizationId } = options;

  try {
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'image/png',
      'image/jpeg',
      'image/jpg'
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      throw new AppError(
        'Invalid file type. Allowed: PDF, DOCX, DOC, PNG, JPEG',
        400
      );
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new AppError('File size exceeds 50MB limit', 400);
    }

    // Verify proposal exists and user has access
    const proposal = await prisma.proposal.findFirst({
      where: {
        id: proposalId,
        organizationId,
        OR: [
          { creatorId: userId },
          {
            collaborators: {
              some: {
                email: {
                  in: await getUserEmail(userId)
                },
                permission: {
                  in: ['OWNER', 'EDITOR']
                }
              }
            }
          }
        ]
      }
    });

    if (!proposal) {
      throw new AppError('Proposal not found or access denied', 404);
    }

    // Upload file to S3
    const uploadResult = await uploadFile(file, organizationId, proposalId);

    // Generate stored filename for tracking
    const storedFileName = crypto.randomBytes(16).toString('hex') + path.extname(file.originalname);

    // Create document record
    const document = await prisma.proposalDocument.create({
      data: {
        proposalId,
        originalFileName: file.originalname,
        storedFileName,
        fileUrl: uploadResult.fileUrl,
        fileSize: file.size,
        mimeType: file.mimetype,
        processingStatus: ProcessingStatus.PENDING,
        virusScanStatus: ScanStatus.PENDING,
        uploadedById: userId,
        encryptionKey: crypto.randomBytes(32).toString('hex') // For future client-side encryption
      }
    });

    // Trigger async processing (virus scan, thumbnail generation, OCR)
    // In production, this would be a background job
    processDocumentAsync(document.id).catch(error => {
      console.error('Document processing error:', error);
    });

    return {
      id: document.id,
      originalFileName: document.originalFileName,
      storedFileName: document.storedFileName,
      fileUrl: document.fileUrl,
      thumbnailUrl: document.thumbnailUrl || undefined,
      fileSize: document.fileSize,
      mimeType: document.mimeType,
      pageCount: document.pageCount || undefined,
      processingStatus: document.processingStatus,
      virusScanStatus: document.virusScanStatus,
      createdAt: document.createdAt
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error('Document upload error:', error);
    throw new AppError('Failed to upload document', 500);
  }
};

/**
 * Get user email from userId
 */
async function getUserEmail(userId: string): Promise<string[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true }
  });
  return user ? [user.email] : [];
}

/**
 * Async document processing (virus scan, thumbnail, OCR)
 * In production, this would be handled by a queue system (Bull/SQS)
 */
async function processDocumentAsync(documentId: string): Promise<void> {
  try {
    await prisma.proposalDocument.update({
      where: { id: documentId },
      data: { processingStatus: ProcessingStatus.PROCESSING }
    });

    // Simulate virus scanning (in production, use ClamAV or similar)
    const scanResult = await simulateVirusScan(documentId);

    // If file is infected, mark and stop processing
    if (scanResult === ScanStatus.INFECTED) {
      await prisma.proposalDocument.update({
        where: { id: documentId },
        data: {
          virusScanStatus: ScanStatus.INFECTED,
          processingStatus: ProcessingStatus.FAILED,
          virusScanResult: 'Malware detected'
        }
      });
      return;
    }

    // Simulate thumbnail generation for PDFs
    const thumbnailUrl = await generateThumbnail(documentId);

    // Simulate page count extraction
    const pageCount = await extractPageCount(documentId);

    // Simulate OCR text extraction (in production, use Tesseract)
    const ocrText = await extractOCRText(documentId);

    // Update document with processing results
    await prisma.proposalDocument.update({
      where: { id: documentId },
      data: {
        virusScanStatus: ScanStatus.CLEAN,
        processingStatus: ProcessingStatus.COMPLETED,
        thumbnailUrl,
        pageCount,
        ocrText
      }
    });

    console.log(`Document ${documentId} processed successfully`);
  } catch (error) {
    console.error(`Document processing failed for ${documentId}:`, error);
    await prisma.proposalDocument.update({
      where: { id: documentId },
      data: {
        processingStatus: ProcessingStatus.FAILED,
        virusScanStatus: ScanStatus.FAILED
      }
    });
  }
}

/**
 * Simulate virus scanning
 * In production, integrate with ClamAV or cloud-based scanning service
 */
async function simulateVirusScan(documentId: string): Promise<ScanStatus> {
  // Simulate async scanning delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // In production, this would call actual virus scanning API
  // For now, always return CLEAN
  return ScanStatus.CLEAN;
}

/**
 * Generate thumbnail for document
 * In production, use ImageMagick, Sharp, or cloud service
 */
async function generateThumbnail(documentId: string): Promise<string | null> {
  // Simulate thumbnail generation
  await new Promise(resolve => setTimeout(resolve, 500));

  // In production, generate actual thumbnail and upload to S3
  // For now, return placeholder
  return null;
}

/**
 * Extract page count from PDF
 * In production, use pdf-parse or similar library
 */
async function extractPageCount(documentId: string): Promise<number | null> {
  // Simulate page count extraction
  await new Promise(resolve => setTimeout(resolve, 300));

  // In production, parse PDF and get actual page count
  return null;
}

/**
 * Extract text using OCR
 * In production, use Tesseract or cloud OCR service
 */
async function extractOCRText(documentId: string): Promise<string | null> {
  // Simulate OCR processing
  await new Promise(resolve => setTimeout(resolve, 1500));

  // In production, run actual OCR on document
  return null;
}

/**
 * Get document by ID with access control
 */
export const getDocument = async (
  documentId: string,
  userId: string
): Promise<DocumentInfo | null> => {
  try {
    const document = await prisma.proposalDocument.findFirst({
      where: {
        id: documentId,
        proposal: {
          OR: [
            { creatorId: userId },
            {
              collaborators: {
                some: {
                  email: {
                    in: await getUserEmail(userId)
                  }
                }
              }
            }
          ]
        }
      },
      include: {
        proposal: {
          select: {
            id: true,
            organizationId: true
          }
        }
      }
    });

    if (!document) {
      return null;
    }

    return {
      id: document.id,
      originalFileName: document.originalFileName,
      storedFileName: document.storedFileName,
      fileUrl: document.fileUrl,
      thumbnailUrl: document.thumbnailUrl || undefined,
      fileSize: document.fileSize,
      mimeType: document.mimeType,
      pageCount: document.pageCount || undefined,
      processingStatus: document.processingStatus,
      virusScanStatus: document.virusScanStatus,
      createdAt: document.createdAt
    };
  } catch (error) {
    console.error('Get document error:', error);
    throw new AppError('Failed to retrieve document', 500);
  }
};

/**
 * Get all documents for a proposal
 */
export const getProposalDocuments = async (
  proposalId: string,
  userId: string
): Promise<DocumentInfo[]> => {
  try {
    const documents = await prisma.proposalDocument.findMany({
      where: {
        proposalId,
        proposal: {
          OR: [
            { creatorId: userId },
            {
              collaborators: {
                some: {
                  email: {
                    in: await getUserEmail(userId)
                  }
                }
              }
            }
          ]
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return documents.map(doc => ({
      id: doc.id,
      originalFileName: doc.originalFileName,
      storedFileName: doc.storedFileName,
      fileUrl: doc.fileUrl,
      thumbnailUrl: doc.thumbnailUrl || undefined,
      fileSize: doc.fileSize,
      mimeType: doc.mimeType,
      pageCount: doc.pageCount || undefined,
      processingStatus: doc.processingStatus,
      virusScanStatus: doc.virusScanStatus,
      createdAt: doc.createdAt
    }));
  } catch (error) {
    console.error('Get proposal documents error:', error);
    throw new AppError('Failed to retrieve documents', 500);
  }
};

/**
 * Delete document
 */
export const deleteDocument = async (
  documentId: string,
  userId: string
): Promise<void> => {
  try {
    const document = await prisma.proposalDocument.findFirst({
      where: {
        id: documentId,
        proposal: {
          OR: [
            { creatorId: userId },
            {
              collaborators: {
                some: {
                  email: {
                    in: await getUserEmail(userId)
                  },
                  permission: {
                    in: ['OWNER', 'EDITOR']
                  }
                }
              }
            }
          ]
        }
      }
    });

    if (!document) {
      throw new AppError('Document not found or access denied', 404);
    }

    // Delete from S3
    try {
      const fileKey = extractFileKeyFromUrl(document.fileUrl);
      await deleteFile(fileKey);
    } catch (error) {
      console.error('S3 deletion error:', error);
      // Continue with database deletion even if S3 fails
    }

    // Delete from database
    await prisma.proposalDocument.delete({
      where: { id: documentId }
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error('Delete document error:', error);
    throw new AppError('Failed to delete document', 500);
  }
};

/**
 * Get signed download URL for document
 */
export const getDocumentDownloadUrl = async (
  documentId: string,
  userId: string,
  expiresIn: number = 3600
): Promise<string> => {
  try {
    const document = await getDocument(documentId, userId);

    if (!document) {
      throw new AppError('Document not found or access denied', 404);
    }

    if (document.virusScanStatus === ScanStatus.INFECTED) {
      throw new AppError('Document is infected and cannot be downloaded', 403);
    }

    const fileKey = extractFileKeyFromUrl(document.fileUrl);
    return await getSignedUrl(fileKey, expiresIn);
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error('Get download URL error:', error);
    throw new AppError('Failed to generate download URL', 500);
  }
};

/**
 * Extract S3 file key from full URL
 */
function extractFileKeyFromUrl(url: string): string {
  const urlObj = new URL(url);
  return urlObj.pathname.substring(1); // Remove leading slash
}
