// File: src/models/billing.ts

/**
 * Định nghĩa cấu trúc response wrapper từ backend
 */
export interface ApiResponse<T> {
  flag: boolean;
  message: string;
  data: T | null;
}

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
export interface PaymentSessionResponse {
  paymentId: string;
  invoiceId: string;
  gateway: number; // Enum: 0 cho PayOs
  checkoutUrl: string;
  expiredAt?: string; // Có thể là null
  transactionId?: string; // Có thể là null
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
