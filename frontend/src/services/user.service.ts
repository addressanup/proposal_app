import api from '../lib/api';

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface MFASetupResponse {
  qrCodeUrl: string;
  secret: string;
  backupCodes: string[];
}

export const userService = {
  async getProfile() {
    const response = await api.get<{ success: boolean; data: any }>('/auth/profile');
    return response.data.data;
  },

  async updateProfile(data: UpdateProfileData) {
    const response = await api.patch<{ success: boolean; data: any }>(
      '/auth/profile',
      data
    );
    return response.data.data;
  },

  async changePassword(data: ChangePasswordData) {
    const response = await api.post<{ success: boolean; message: string }>(
      '/auth/change-password',
      data
    );
    return response.data;
  },

  async setupMFA() {
    const response = await api.post<{ success: boolean; data: MFASetupResponse }>(
      '/auth/mfa/setup'
    );
    return response.data.data;
  },

  async verifyMFA(token: string) {
    const response = await api.post<{ success: boolean; data: any }>(
      '/auth/mfa/verify',
      { token }
    );
    return response.data.data;
  },

  async disableMFA(token: string) {
    const response = await api.post<{ success: boolean; message: string }>(
      '/auth/mfa/disable',
      { token }
    );
    return response.data;
  },
};
