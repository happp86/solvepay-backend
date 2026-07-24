import { apiClient } from './apiClient';
import { tokenStore } from './tokenStore';

export const authService = {
  async sendOtp(phone: string) {
    return apiClient.post('/auth/send-otp', { phone });
  },

  async verifyOtp(phone: string, code: string) {
    return apiClient.post('/auth/verify-otp', { phone, code });
  },

  async register(params: {
    username: string;
    password: string;
    phone: string;
    securityPin: string;
    inviteCode?: string;
  }) {
    const data = await apiClient.post('/auth/register', {
      username: params.username,
      password: params.password,
      phone: params.phone,
      securityPin: params.securityPin,
      inviteCode: params.inviteCode || undefined,
    });
    if (data.tokens) {
      tokenStore.setTokens(data.tokens.accessToken, data.tokens.refreshToken);
      tokenStore.setUser(data.user);
    }
    return data;
  },

  async login(phone: string, password: string) {
    const data = await apiClient.post('/auth/login', { phone, password });
    if (data.tokens) {
      tokenStore.setTokens(data.tokens.accessToken, data.tokens.refreshToken);
      tokenStore.setUser(data.user);
    }
    return data;
  },

  async resetPassword(phone: string, newPassword: string, securityPin: string) {
    return apiClient.post('/auth/reset-password', { phone, newPassword, securityPin });
  },

  // Fetch fresh user data from server and update local store
  async refreshUser(): Promise<boolean> {
    try {
      const freshUser = await apiClient.get('/users/me');
      if (freshUser && freshUser.id) {
        await tokenStore.setUser(freshUser);
        return true;
      }
      return false;
    } catch (err: any) {
      // 401 = user deleted by admin → force logout
      if (err?.status === 401) {
        await tokenStore.clear();
        return false;
      }
      return false;
    }
  },

  async logout() {
    try {
      await apiClient.post('/auth/logout');
    } catch (err) {
      // Ignore network errors on logout
    }
    tokenStore.clear();
  },
};

