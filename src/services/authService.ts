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
    otpCode: string;
    inviteCode?: string;
  }) {
    const data = await apiClient.post('/auth/register', {
      username: params.username,
      password: params.password,
      phone: params.phone,
      otpCode: params.otpCode,
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

  async logout() {
    try {
      await apiClient.post('/auth/logout');
    } catch (err) {
      // Ignore network errors on logout
    }
    tokenStore.clear();
  },
};
