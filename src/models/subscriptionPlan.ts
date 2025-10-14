// File: src/models/subscriptionPlan.ts

/**
 * Định nghĩa cấu trúc của một gói đăng ký (subscription plan)
 */
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  durationDays: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Payload dùng để tạo hoặc cập nhật gói đăng ký
 */
export interface SubscriptionPlanPayload {
  name: string;
  description: string;
  price: number;
  currency: string;
  durationDays: number;
  isActive: boolean;
}

/**
 * Cấu trúc response khi filter danh sách subscription plans
 */
export interface SubscriptionPlanListResponse {
  items: SubscriptionPlan[];
  totalCount?: number;
  pageSize?: number;
  pageNumber?: number;
  totalPages?: number;
  // Additional format support
  data?: {
    items: SubscriptionPlan[];
    totalCount?: number;
    pageSize?: number;
    pageNumber?: number;
    totalPages?: number;
  };
}

/**
 * Tham số filter cho danh sách subscription plans
 */
export interface SubscriptionPlanFilter {
  pageNumber?: number;
  pageSize?: number;
  isActive?: boolean;
  searchTerm?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}
