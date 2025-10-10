// File: src/models/billing.ts

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
  invoiceCode: string;
  amount: number;
  currency: string;
  status: string;
  userExternalId: string;
  createdAt: string;
  // Bổ sung các trường khác nếu API của bạn trả về thêm thông tin.
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
  planId: string;
  // Backend sẽ tự lấy userId từ token, nên không cần gửi từ frontend.
}

export interface InitiatePaymentPayload {
  invoiceId: string;
  gateway: number;
  returnUrl: string;
  cancelUrl: string;
}
