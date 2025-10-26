/**
 * Local Storage Authentication Token Manager
 *
 * Provides a backup authentication mechanism when cookies fail
 * (e.g., when using Vercel proxy with HTTP backend)
 */

import type { AuthData } from "../models";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const ACCESS_TOKEN_EXPIRES_KEY = "access_token_expires";
const REFRESH_TOKEN_EXPIRES_KEY = "refresh_token_expires";

export const authStorage = {
  /**
   * Save authentication tokens to localStorage
   */
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
      console.log("✅ Tokens saved to localStorage");
    } catch (error) {
      console.error("❌ Failed to save tokens to localStorage:", error);
    }
  },

  /**
   * Load authentication tokens from localStorage
   */
  loadTokens(): AuthData | null {
    try {
      const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (!accessToken) {
        return null;
      }

      return {
        accessToken,
        refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY) || "",
        accessTokenExpiresAt: localStorage.getItem(ACCESS_TOKEN_EXPIRES_KEY) || "",
        refreshTokenExpiresAt: localStorage.getItem(REFRESH_TOKEN_EXPIRES_KEY) || "",
      };
    } catch (error) {
      console.error("❌ Failed to load tokens from localStorage:", error);
      return null;
    }
  },

  /**
   * Clear all authentication tokens from localStorage
   */
  clearTokens() {
    try {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(ACCESS_TOKEN_EXPIRES_KEY);
      localStorage.removeItem(REFRESH_TOKEN_EXPIRES_KEY);
      console.log("✅ Tokens cleared from localStorage");
    } catch (error) {
      console.error("❌ Failed to clear tokens from localStorage:", error);
    }
  },

  /**
   * Get only the access token (for quick checks)
   */
  getAccessToken(): string | null {
    try {
      return localStorage.getItem(ACCESS_TOKEN_KEY);
    } catch {
      return null;
    }
  },
};
