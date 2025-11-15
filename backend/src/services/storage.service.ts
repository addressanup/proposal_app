import AWS from 'aws-sdk';
import { AppError } from '../middleware/errorHandler';
import crypto from 'crypto';
import path from 'path';

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'proposal-documents';

interface UploadResult {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileMimeType: string;
}

export const uploadFile = async (
  file: Express.Multer.File,
  organizationId: string,
  proposalId?: string
): Promise<UploadResult> => {
  try {
    // Generate unique filename
    const fileExt = path.extname(file.originalname);
    const uniqueId = crypto.randomBytes(16).toString('hex');
    const fileName = `${organizationId}/${proposalId || 'temp'}/${uniqueId}${fileExt}`;

    const params: AWS.S3.PutObjectRequest = {
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ServerSideEncryption: 'AES256', // Encryption at rest
      Metadata: {
        organizationId,
        ...(proposalId && { proposalId }),
        originalName: file.originalname
      }
    };

    const result = await s3.upload(params).promise();

    return {
      fileUrl: result.Location,
      fileName: file.originalname,
      fileSize: file.size,
      fileMimeType: file.mimetype
    };
  } catch (error) {
    console.error('File upload error:', error);
    throw new AppError('File upload failed', 500);
  }
};

export const getFile = async (fileKey: string): Promise<AWS.S3.GetObjectOutput> => {
  try {
    const params: AWS.S3.GetObjectRequest = {
      Bucket: BUCKET_NAME,
      Key: fileKey
    };

    const result = await s3.getObject(params).promise();
    return result;
  } catch (error) {
    console.error('File retrieval error:', error);
    throw new AppError('File not found', 404);
  }
};

export const deleteFile = async (fileKey: string): Promise<void> => {
  try {
    const params: AWS.S3.DeleteObjectRequest = {
      Bucket: BUCKET_NAME,
      Key: fileKey
    };

    await s3.deleteObject(params).promise();
  } catch (error) {
    console.error('File deletion error:', error);
    throw new AppError('File deletion failed', 500);
  }
};

export const getSignedUrl = async (
  fileKey: string,
  expiresIn: number = 3600
): Promise<string> => {
  try {
    const params: AWS.S3.GetObjectRequest = {
      Bucket: BUCKET_NAME,
      Key: fileKey
    };

    const url = await s3.getSignedUrlPromise('getObject', {
      ...params,
      Expires: expiresIn
    });

    return url;
  } catch (error) {
    console.error('Signed URL generation error:', error);
    throw new AppError('Failed to generate download link', 500);
  }
};

// Generate presigned URL for direct browser upload (for large files)
export const getUploadUrl = async (
  fileName: string,
  fileType: string,
  organizationId: string,
  proposalId?: string
): Promise<{ uploadUrl: string; fileKey: string }> => {
  try {
    const fileExt = path.extname(fileName);
    const uniqueId = crypto.randomBytes(16).toString('hex');
    const fileKey = `${organizationId}/${proposalId || 'temp'}/${uniqueId}${fileExt}`;

    const params: AWS.S3.PutObjectRequest = {
      Bucket: BUCKET_NAME,
      Key: fileKey,
      ContentType: fileType,
      ServerSideEncryption: 'AES256',
      Metadata: {
        organizationId,
        ...(proposalId && { proposalId }),
        originalName: fileName
      }
    };

    const uploadUrl = await s3.getSignedUrlPromise('putObject', {
      ...params,
      Expires: 300 // 5 minutes
    });

    return { uploadUrl, fileKey };
  } catch (error) {
    console.error('Upload URL generation error:', error);
    throw new AppError('Failed to generate upload link', 500);
  }
};
