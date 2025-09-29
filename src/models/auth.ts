export interface ApiResponse<T = string> {
  flag: boolean;
  message: T;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export type LoginResponse = ApiResponse<string>;

export interface RegisterRequest {
  id?: string;
  email: string;
  userName: string;
  password: string;
  fullName?: string;
  phoneNumber?: string;
  gender?: string;
  profilePicture?: string;
  dateOfBirth?: string; // ISO date string
  role: string;
  status: string;
  subscriptionPlanId?: string;
  paymentCustomerRef?: string;
}

export interface UpdateUserRequest {
  email?: string;
  userName?: string;
  fullName?: string;
  phoneNumber?: string;
  gender?: string;
  profilePicture?: string;
  dateOfBirth?: string; // ISO date string
  role?: string;
  status?: string;
  subscriptionPlanId?: string;
  paymentCustomerRef?: string;
  password?: string;
}

export interface UserModel {
  id: string;
  email: string;
  userName: string;
  fullName?: string;
  phoneNumber?: string;
  gender?: string;
  profilePicture?: string;
  dateOfBirth?: string; // ISO date string
  role: string;
  status: string;
  createdAt: string; // ISO date string
  subscriptionPlanId?: string;
  paymentCustomerRef?: string;
}
