import { Request, Response } from 'express';
import * as signatureService from '../services/signature.service';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';
import { SignatureType, SigningOrder, AuthMethod } from '@prisma/client';

// Validation schemas
const createSignatureRequestSchema = z.object({
  proposalId: z.string().cuid(),
  signatureType: z.nativeEnum(SignatureType),
  signingOrder: z.nativeEnum(SigningOrder),
  signers: z.array(z.object({
    signerEmail: z.string().email(),
    signerName: z.string().min(1).max(100),
    signingOrder: z.number().int().positive().optional(),
    authMethod: z.nativeEnum(AuthMethod).optional()
  })).min(1).max(20),
  reminderDays: z.array(z.number().int().positive()).optional(),
  expirationDays: z.number().int().positive().optional()
});

const signDocumentSchema = z.object({
  signatureImage: z.string().optional(), // Base64 encoded
  geoLocation: z.string().optional()
});

const declineSignatureSchema = z.object({
  reason: z.string().min(1).max(500)
});

/**
 * Create a signature request
 * POST /api/signature-requests
 */
export const createSignatureRequest = async (req: Request, res: Response) => {
  try {
    const validatedData = createSignatureRequestSchema.parse(req.body);
    const ipAddress = req.ip || req.connection.remoteAddress || '';
    const userAgent = req.get('user-agent') || '';

    const signatureRequest = await signatureService.createSignatureRequest(
      validatedData,
      req.user!.id,
      ipAddress,
      userAgent
    );

    res.status(201).json({
      status: 'success',
      data: { signatureRequest },
      message: 'Signature request created and emails sent to signers'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError(error.errors[0].message, 400);
    }
    throw error;
  }
};

/**
 * Verify signer token (public endpoint)
 * GET /api/sign/verify/:token
 */
export const verifySignerToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const result = await signatureService.verifySignerToken(token);

    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Sign the document (public endpoint)
 * POST /api/sign/:token
 */
export const signDocument = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const validatedData = signDocumentSchema.parse(req.body);

    const ipAddress = req.ip || req.connection.remoteAddress || '';
    const userAgent = req.get('user-agent') || '';

    const result = await signatureService.signDocument(token, {
      signatureImage: validatedData.signatureImage,
      ipAddress,
      userAgent,
      geoLocation: validatedData.geoLocation
    });

    res.json({
      status: 'success',
      data: result,
      message: result.allSignaturesCompleted
        ? 'Document signed successfully. All signatures completed!'
        : 'Document signed successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError(error.errors[0].message, 400);
    }
    throw error;
  }
};

/**
 * Decline to sign (public endpoint)
 * POST /api/sign/:token/decline
 */
export const declineSignature = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const validatedData = declineSignatureSchema.parse(req.body);

    const ipAddress = req.ip || req.connection.remoteAddress || '';
    const userAgent = req.get('user-agent') || '';

    const result = await signatureService.declineSignature(
      token,
      validatedData.reason,
      ipAddress,
      userAgent
    );

    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError(error.errors[0].message, 400);
    }
    throw error;
  }
};

/**
 * Get signature request details
 * GET /api/signature-requests/:id
 */
export const getSignatureRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const signatureRequest = await signatureService.getSignatureRequest(
      id,
      req.user!.id
    );

    res.json({
      status: 'success',
      data: { signatureRequest }
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Get all signature requests for a proposal
 * GET /api/proposals/:proposalId/signature-requests
 */
export const getProposalSignatureRequests = async (req: Request, res: Response) => {
  try {
    const { proposalId } = req.params;

    const signatureRequests = await signatureService.getProposalSignatureRequests(
      proposalId,
      req.user!.id
    );

    res.json({
      status: 'success',
      data: { signatureRequests }
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Send reminder to pending signers
 * POST /api/signature-requests/:id/remind
 */
export const sendSignatureReminder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await signatureService.sendSignatureReminder(
      id,
      req.user!.id
    );

    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Cancel signature request
 * POST /api/signature-requests/:id/cancel
 */
export const cancelSignatureRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ipAddress = req.ip || req.connection.remoteAddress || '';
    const userAgent = req.get('user-agent') || '';

    const result = await signatureService.cancelSignatureRequest(
      id,
      req.user!.id,
      ipAddress,
      userAgent
    );

    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    throw error;
  }
};
