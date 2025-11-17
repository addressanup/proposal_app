export enum SignatureType {
  SIMPLE = 'SIMPLE',
  ADVANCED = 'ADVANCED',
  QUALIFIED = 'QUALIFIED',
}

export enum SigningOrder {
  SEQUENTIAL = 'SEQUENTIAL',
  PARALLEL = 'PARALLEL',
}

export enum SignerStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  VIEWED = 'VIEWED',
  SIGNED = 'SIGNED',
  DECLINED = 'DECLINED',
}

export enum SignatureRequestStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  DECLINED = 'DECLINED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export enum AuthenticationMethod {
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
  TWO_FACTOR_AUTH = 'TWO_FACTOR_AUTH',
  SMS_OTP = 'SMS_OTP',
  BIOMETRIC = 'BIOMETRIC',
}

export interface SignatureRequirement {
  id: string;
  signatureRequestId: string;
  signerEmail: string;
  signerName: string;
  signerOrder: number;
  status: SignerStatus;
  signedAt?: string;
  declineReason?: string;
  ipAddress?: string;
  userAgent?: string;
  authenticationMethod?: AuthenticationMethod;
}

export interface SignatureRequest {
  id: string;
  proposalId: string;
  signatureType: SignatureType;
  signingOrder: SigningOrder;
  status: SignatureRequestStatus;
  expiresAt?: string;
  message?: string;
  requirements: SignatureRequirement[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface Signature {
  id: string;
  proposalId: string;
  signatureRequestId: string;
  userId: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  signatureData: string;
  signatureType: SignatureType;
  ipAddress: string;
  userAgent: string;
  blockchainHash?: string;
  certificateUrl?: string;
  signedAt: string;
}

export interface CreateSignatureRequestData {
  proposalId: string;
  signatureType: SignatureType;
  signingOrder: SigningOrder;
  expiresInDays?: number;
  message?: string;
  signers: {
    email: string;
    name: string;
    order: number;
    authenticationMethod?: AuthenticationMethod;
  }[];
}

export interface SignDocumentData {
  signatureRequestId: string;
  signatureData: string;
  authenticationToken?: string;
}

export interface DeclineSignatureData {
  signatureRequestId: string;
  reason: string;
}
