import AsyncStorage from '@react-native-async-storage/async-storage';

let accessToken: string | null = null;
let refreshToken: string | null = null;
let userProfile: any = null;

const STORAGE_KEYS = {
  ACCESS_TOKEN: '@solvepay_access_token',
  REFRESH_TOKEN: '@solvepay_refresh_token',
  USER_PROFILE: '@solvepay_user_profile',
};

export const tokenStore = {
  async init() {
    try {
      accessToken = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      const userStr = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (userStr) {
        userProfile = JSON.parse(userStr);
      }
    } catch (e) {
      console.error('Error loading auth tokens from storage', e);
    }
  },

  async setTokens(access: string, refresh: string) {
    accessToken = access;
    refreshToken = refresh;
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access);
      await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh);
    } catch (e) {
      console.error('Error saving tokens', e);
    }
  },

  getAccessToken() {
    return accessToken;
  },

  getRefreshToken() {
    return refreshToken;
  },

  async setUser(user: any) {
    userProfile = user;
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(user));
    } catch (e) {
      console.error('Error saving user profile', e);
    }
  },

  getUser() {
    return userProfile;
  },

  async clear() {
    accessToken = null;
    refreshToken = null;
    userProfile = null;
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_PROFILE,
      ]);
    } catch (e) {
      console.error('Error clearing tokens', e);
    }
  },
};

export type UserProfile = typeof userProfile;
