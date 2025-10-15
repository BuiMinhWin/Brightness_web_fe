// File: src/models/billing.ts

// Import ApiResponse from common to avoid duplication
import type { ApiResponse } from "./common";

/**
 * Định nghĩa cấu trúc của một gói giá (pricing plan) được hiển thị trên giao diện.
 */
export interface PricingPlan {
  id: string;
  title: string;
  price: string;
  subtitle: string;
  features: string[];
  buttonText: string;
  isCurrentPlan: boolean;
  isBestValue?: boolean;
  isPremiumTrial?: boolean;
}

/**
 * Định nghĩa cấu trúc dữ liệu của một hóa đơn (Invoice) khi được trả về từ API.
 * Cấu trúc này nên khớp với DTO hoặc entity `Invoice` ở backend.
 */
export interface InvoiceResponse {
  id: string;
  userExternalId?: string;
  subscriptionPlanId: string;
  invoiceCode: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  dueDate: string;
  paidAt?: string | null;
  cancelledAt?: string | null;
  updatedAt?: string | null;
  notes?: string | null;
}

/**
 * Định nghĩa cấu trúc dữ liệu trả về khi khởi tạo một phiên thanh toán thành công.
 * Cấu trúc này khớp với lớp `PaymentSessionResponse` ở backend.
 */
export interface PaymentStatusResponse {
  paymentId: string;
  invoiceId: string;
  gateway: number; // PaymentGatewayType enum: 2 = PayOS
  paymentStatus: string; // "pending" | "completed" | "failed" | "cancelled"
  paidAt: string | null; // ISO date string
  transactionId: string | null;
}

// Update PaymentSessionResponse nếu chưa có
export interface PaymentSessionResponse {
  paymentId: string;
  invoiceId: string;
  gateway: number;
  checkoutUrl: string;
  expiredAt?: string | null;
  transactionId?: string | null;
  // Alias cho backward compatibility
  paymentUrl?: string;
}

/**
 * Định nghĩa cấu trúc payload (dữ liệu gửi đi) để tạo một hóa đơn.
 */
export interface CreateInvoicePayload {
  userExternalId: string;
  subscriptionPlanId: string;
  dueDate: string;
  notes?: string;
}

export interface InitiatePaymentPayload {
  invoiceId: string;
  gateway: number;
  returnUrl: string;
  cancelUrl: string;
}
