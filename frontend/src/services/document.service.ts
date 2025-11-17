import api from '../lib/api';

export interface Document {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  uploadedAt: string;
  proposalId?: string;
  contractId?: string;
  uploadedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface UploadDocumentData {
  file: File;
  proposalId?: string;
  contractId?: string;
}

export const documentService = {
  /**
   * Upload a document
   */
  async upload(data: UploadDocumentData): Promise<Document> {
    const formData = new FormData();
    formData.append('file', data.file);

    if (data.proposalId) {
      formData.append('proposalId', data.proposalId);
    }
    if (data.contractId) {
      formData.append('contractId', data.contractId);
    }

    const response = await api.post<{ success: boolean; data: Document }>(
      '/documents/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },

  /**
   * Get documents for a proposal
   */
  async getProposalDocuments(proposalId: string): Promise<Document[]> {
    const response = await api.get<{ success: boolean; data: Document[] }>(
      `/documents/proposal/${proposalId}`
    );
    return response.data.data;
  },

  /**
   * Get documents for a contract
   */
  async getContractDocuments(contractId: string): Promise<Document[]> {
    const response = await api.get<{ success: boolean; data: Document[] }>(
      `/documents/contract/${contractId}`
    );
    return response.data.data;
  },

  /**
   * Get a single document
   */
  async getDocument(documentId: string): Promise<Document> {
    const response = await api.get<{ success: boolean; data: Document }>(
      `/documents/${documentId}`
    );
    return response.data.data;
  },

  /**
   * Delete a document
   */
  async delete(documentId: string): Promise<void> {
    await api.delete(`/documents/${documentId}`);
  },

  /**
   * Download a document
   */
  async download(documentId: string): Promise<Blob> {
    const response = await api.get(`/documents/${documentId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Get download URL for a document
   */
  getDownloadUrl(documentId: string): string {
    return `${api.defaults.baseURL}/documents/${documentId}/download`;
  },
};
