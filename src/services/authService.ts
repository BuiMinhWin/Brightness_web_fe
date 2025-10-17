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

// Có thể tái dùng alias nếu bạn thích, không bắt buộc:
type RegisterResponse = ApiResponse<string>;

export const authService = {
  /** Đăng nhập: backend trả { flag: boolean, message: string } */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return httpRequest<LoginResponse>("/auth/api/Authentication/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
  },

  /** Làm mới token */
  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    return httpRequest<LoginResponse>("/auth/api/Authentication/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      skipAuth: true, // Skip auth header for refresh token request
    });
  },

  /** Thu hồi refresh token đang dùng */
  async revokeToken(refreshToken: string): Promise<ApiResponse<string>> {
    return httpRequest<ApiResponse<string>>("/auth/api/Authentication/revoke", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
  },

  /** Đăng ký: backend trả { flag, message } */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return httpRequest<RegisterResponse>("/auth/api/Authentication/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },

  /** Lấy 1 user theo id */
  async getUser(id: string): Promise<UserModel> {
    return httpRequest<UserModel>(`/auth/api/Authentication/${id}`, {
      method: "GET",
      skipAutoLogout: true, // Don't auto-logout if this fails
    });
  },

  /** Lấy danh sách user */
  async getUsers(): Promise<UserModel[]> {
    return httpRequest<UserModel[]>("/auth/api/Authentication", {
      method: "GET",
    });
  },

  /** Cập nhật user: backend trả { flag, message } */
  async updateUser(id: string, payload: UpdateUserRequest): Promise<ApiResponse<string>> {
    return httpRequest<ApiResponse<string>>(`/auth/api/Authentication/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },

  /** Xoá user: backend trả { flag, message } */
  async deleteUser(id: string): Promise<ApiResponse<string>> {
    return httpRequest<ApiResponse<string>>(`/auth/api/Authentication/${id}`, {
      method: "DELETE",
    });
  },

  /**
   * 🆕 Refresh user info sau khi thanh toán thành công
   * Lấy thông tin user mới nhất (bao gồm subscriptionPlanId đã được update)
   * @param userId - ID của user cần refresh
   * @returns User model với subscription mới
   */
  async refreshUserInfo(userId?: string): Promise<UserModel> {
    // Nếu không truyền userId, lấy từ token hoặc state
    const actualUserId = userId || getUserIdFromStorage();

    if (!actualUserId) {
      throw new Error("User ID not found. Please login again.");
    }

    try {
      const userData = await httpRequest<UserModel>(`/auth/api/Authentication/${actualUserId}`, {
        method: "GET",
      });

      // Update user info trong Redux/Context sau khi lấy được
      // Ví dụ: dispatch(updateUser(userData));

      return userData;
    } catch (error) {
      console.error("Failed to refresh user info:", error);
      throw error;
    }
  },

  /**
   * 🆕 Lấy subscription plan hiện tại của user
   * @param userId - ID của user
   * @returns Subscription plan ID hoặc null
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
 * Helper function để lấy userId từ localStorage hoặc sessionStorage
 */
function getUserIdFromStorage(): string | null {
  // Lấy từ localStorage nếu có lưu userInfo
  const userInfoStr = localStorage.getItem("userInfo");
  if (userInfoStr) {
    try {
      const userInfo = JSON.parse(userInfoStr);
      return userInfo.id || null;
    } catch {
      // Ignore parse error
    }
  }

  // Hoặc decode từ JWT token
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      // JWT claim cho user ID
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
