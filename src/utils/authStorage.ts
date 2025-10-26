// src/utils/authStorage.ts
import type { AuthData } from '../models';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const ACCESS_TOKEN_EXPIRES_KEY = 'access_token_expires';
const REFRESH_TOKEN_EXPIRES_KEY = 'refresh_token_expires';

export const authStorage = {
  // Save tokens to localStorage
  saveTokens(authData: AuthData) {
    try {
      localStorage.setItem(ACCESS_TOKEN_KEY, authData.accessToken);
      if (authData.refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, authData.refreshToken);
      }
      if (authData.accessTokenExpiresAt) {
        localStorage.setItem(ACCESS_TOKEN_EXPIRES_KEY, authData.accessTokenExpiresAt);
      }
      if (authData.refreshTokenExpiresAt) {
        localStorage.setItem(REFRESH_TOKEN_EXPIRES_KEY, authData.refreshTokenExpiresAt);
      }
      console.log('✅ Tokens saved to localStorage');
    } catch (error) {
      console.error('❌ Failed to save tokens to localStorage:', error);
    }
  },

  // Load tokens from localStorage
  loadTokens(): AuthData | null {
    try {
      const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (!accessToken) {
        return null;
      }

      return {
        accessToken,
        refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY) || '',
        accessTokenExpiresAt: localStorage.getItem(ACCESS_TOKEN_EXPIRES_KEY) || '',
        refreshTokenExpiresAt: localStorage.getItem(REFRESH_TOKEN_EXPIRES_KEY) || '',
      };
    } catch (error) {
      console.error('❌ Failed to load tokens from localStorage:', error);
      return null;
    }
  },

  // Clear all tokens
  clearTokens() {
    try {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(ACCESS_TOKEN_EXPIRES_KEY);
      localStorage.removeItem(REFRESH_TOKEN_EXPIRES_KEY);
      console.log('✅ Tokens cleared from localStorage');
    } catch (error) {
      console.error('❌ Failed to clear tokens from localStorage:', error);
    }
  },

  // Get just the access token (for quick checks)
  getAccessToken(): string | null {
    try {
      return localStorage.getItem(ACCESS_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  // Get just the refresh token
  getRefreshToken(): string | null {
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  }
};

