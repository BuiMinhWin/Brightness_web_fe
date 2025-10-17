// authService.ts
import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UpdateUserRequest,
  UserModel,
} from "../models";
import { httpRequest } from "./httpClientRedux";

type RegisterResponse = ApiResponse<string>;

export const authService = {
  /** Login: backend returns { flag: boolean, message: string } */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return httpRequest<LoginResponse>("/auth/api/Authentication/login", {
      method: "POST",
      body: JSON.stringify(credentials),
      skipAuth: true, // Don't send auth token for login
    });
  },

  /** Refresh token - refresh token now in httpOnly cookie */
  async refreshToken(): Promise<LoginResponse> {
    return httpRequest<LoginResponse>("/auth/api/Authentication/refresh", {
      method: "POST",
      skipAuth: true, // Skip auth header for refresh token request
      // No body needed - refresh token is in httpOnly cookie
    });
  },

  /** Revoke refresh token - refresh token now in httpOnly cookie */
  async revokeToken(): Promise<ApiResponse<string>> {
    return httpRequest<ApiResponse<string>>("/auth/api/Authentication/revoke", {
      method: "POST",
      // No body needed - refresh token is in httpOnly cookie
    });
  },

  /** Register: backend returns { flag, message } */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return httpRequest<RegisterResponse>("/auth/api/Authentication/register", {
      method: "POST",
      body: JSON.stringify(data),
      skipAuth: true, // Don't send auth token for registration
    });
  },

  /** Get user by id */
  async getUser(id: string): Promise<UserModel> {
    return httpRequest<UserModel>(`/auth/api/Authentication/${id}`, {
      method: "GET",
      skipAutoLogout: true, // Don't auto-logout if this fails
    });
  },

  /** Get all users */
  async getUsers(): Promise<UserModel[]> {
    return httpRequest<UserModel[]>("/auth/api/Authentication", {
      method: "GET",
    });
  },

  /** Update user: backend returns { flag, message } */
  async updateUser(id: string, payload: UpdateUserRequest): Promise<ApiResponse<string>> {
    return httpRequest<ApiResponse<string>>(`/auth/api/Authentication/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  /** Delete user: backend returns { flag, message } */
  async deleteUser(id: string): Promise<ApiResponse<string>> {
    return httpRequest<ApiResponse<string>>(`/auth/api/Authentication/${id}`, {
      method: "DELETE",
    });
  },

  /**
   * Refresh user info after successful payment
   * Get latest user info (including updated subscriptionPlanId)
   * @param userId - ID of user to refresh
   * @returns User model with new subscription
   */
  async refreshUserInfo(userId?: string): Promise<UserModel> {
    // If no userId provided, get from token or state
    const actualUserId = userId || getUserIdFromStorage();

    if (!actualUserId) {
      throw new Error("User ID not found. Please login again.");
    }

    try {
      const userData = await httpRequest<UserModel>(`/auth/api/Authentication/${actualUserId}`, {
        method: "GET",
      });

      return userData;
    } catch (error) {
      console.error("Failed to refresh user info:", error);
      throw error;
    }
  },

  /**
   * Get current subscription plan of user
   * @param userId - ID of user
   * @returns Subscription plan ID or null
   */
  async getCurrentSubscription(userId?: string): Promise<string | null> {
    try {
      const userData = await this.refreshUserInfo(userId);
      return userData.subscriptionPlanId || null;
    } catch (error) {
      console.error("Failed to get current subscription:", error);
      return null;
    }
  },
};

/**
 * Helper function to get userId from localStorage or sessionStorage
 */
function getUserIdFromStorage(): string | null {
  // Get from localStorage if userInfo is saved
  const userInfoStr = localStorage.getItem("userInfo");
  if (userInfoStr) {
    try {
      const userInfo = JSON.parse(userInfoStr);
      return userInfo.id || null;
    } catch {
      // Ignore parse error
    }
  }

  // Or decode from JWT token
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      // JWT claim for user ID
      return (
        payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
        payload.sub ||
        payload.userId ||
        null
      );
    } catch {
      // Ignore decode error
    }
  }

  return null;
}
