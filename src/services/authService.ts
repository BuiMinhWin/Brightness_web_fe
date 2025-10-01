// authService.ts
import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UpdateUserRequest,
  UserModel,
} from "../models";
import { httpRequest } from "./httpClient";

// Có thể tái dùng alias nếu bạn thích, không bắt buộc:
type RegisterResponse = ApiResponse<string>;

export const authService = {
  /** Đăng nhập: backend trả { flag: boolean, message: string } */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return httpRequest<LoginResponse>("/Authentication/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      
      body: JSON.stringify(credentials),
    });
  },

  /** Đăng ký: backend trả { flag, message } */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return httpRequest<RegisterResponse>("/Authentication/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },

  /** Lấy 1 user theo id */
  async getUser(id: string): Promise<UserModel> {
    return httpRequest<UserModel>(`/Authentication/${id}`, {
      method: "GET",
    });
  },

  /** Lấy danh sách user */
  async getUsers(): Promise<UserModel[]> {
    return httpRequest<UserModel[]>("/Authentication", {
      method: "GET",
    });
  },

  /** Cập nhật user: backend trả { flag, message } */
  async updateUser(id: string, payload: UpdateUserRequest): Promise<ApiResponse<string>> {
    return httpRequest<ApiResponse<string>>(`/Authentication/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },

  /** Xoá user: backend trả { flag, message } */
  async deleteUser(id: string): Promise<ApiResponse<string>> {
    return httpRequest<ApiResponse<string>>(`/Authentication/${id}`, {
      method: "DELETE",
    });
  },
};
