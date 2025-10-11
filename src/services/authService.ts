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
};
