import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UpdateUserRequest,
  UserModel,
} from "../models";
import { httpRequest } from "./httpClient";

type TokenResponse = LoginResponse;
type RegisterResponse = ApiResponse<string>;

export const authService = {
  async login(credentials: LoginRequest): Promise<TokenResponse> {
    return httpRequest<TokenResponse>("/authentication/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return httpRequest<RegisterResponse>("/authentication/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getUser(id: string): Promise<UserModel> {
    return httpRequest<UserModel>(`/authentication/${id}`, {
      method: "GET",
    });
  },

  async getUsers(): Promise<UserModel[]> {
    return httpRequest<UserModel[]>("/authentication", {
      method: "GET",
    });
  },

  async updateUser(id: string, payload: UpdateUserRequest): Promise<ApiResponse<string>> {
    return httpRequest<ApiResponse<string>>(`/authentication/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async deleteUser(id: string): Promise<ApiResponse<string>> {
    return httpRequest<ApiResponse<string>>(`/authentication/${id}`, {
      method: "DELETE",
    });
  },
};
