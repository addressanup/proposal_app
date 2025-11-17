import api from '../lib/api';
import {
  SignatureRequest,
  Signature,
  CreateSignatureRequestData,
  SignDocumentData,
  DeclineSignatureData,
} from '../types/signature.types';

export const signatureService = {
  // Signature Requests
  async createRequest(data: CreateSignatureRequestData) {
    const response = await api.post<{ success: boolean; data: SignatureRequest }>(
      '/signatures/request',
      data
    );
    return response.data.data;
  },

  async getRequest(requestId: string) {
    const response = await api.get<{ success: boolean; data: SignatureRequest }>(
      `/signatures/request/${requestId}`
    );
    return response.data.data;
  },

  async getProposalRequests(proposalId: string) {
    const response = await api.get<{ success: boolean; data: SignatureRequest[] }>(
      `/signatures/proposal/${proposalId}/requests`
    );
    return response.data.data;
  },

  async cancelRequest(requestId: string) {
    const response = await api.post<{ success: boolean; message: string }>(
      `/signatures/request/${requestId}/cancel`
    );
    return response.data;
  },

  async sendReminder(requestId: string, signerEmail: string) {
    const response = await api.post<{ success: boolean; message: string }>(
      `/signatures/request/${requestId}/remind`,
      { signerEmail }
    );
    return response.data;
  },

  // Signing
  async signDocument(data: SignDocumentData) {
    const response = await api.post<{ success: boolean; data: Signature }>(
      '/signatures/sign',
      data
    );
    return response.data.data;
  },

  async declineSignature(data: DeclineSignatureData) {
    const response = await api.post<{ success: boolean; message: string }>(
      '/signatures/decline',
      data
    );
    return response.data;
  },

  // Signatures
  async getProposalSignatures(proposalId: string) {
    const response = await api.get<{ success: boolean; data: Signature[] }>(
      `/signatures/proposal/${proposalId}`
    );
    return response.data.data;
  },

  async downloadCertificate(signatureId: string) {
    const response = await api.get(`/signatures/${signatureId}/certificate`, {
      responseType: 'blob',
    });
    return response.data;
  },

  async verifySignature(signatureId: string) {
    const response = await api.get<{ success: boolean; data: any }>(
      `/signatures/${signatureId}/verify`
    );
    return response.data.data;
  },
};
