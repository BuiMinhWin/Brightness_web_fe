// File: src/services/billingService.ts

import { httpRequest } from "./httpClient";
import type {
  InvoiceResponse,
  PaymentSessionResponse,
  PaymentStatusResponse,
  CreateInvoicePayload,
  InitiatePaymentPayload,
} from "../models/billing";
import type { ApiResponse } from "../models/common";

// Định nghĩa các đường dẫn API cơ sở
const plansBaseUrl = "/billing/api/plans";
const invoicesBaseUrl = "/billing/api/billing/invoices";
const paymentsBaseUrl = "/billing/api/billing/payments";

export const billingService = {
  /**
   * Lấy danh sách tất cả các gói cước.
   */
  listPlans() {
    return httpRequest<any[]>(plansBaseUrl, { method: "GET" });
  },

  /**
   * Lấy chi tiết một gói cước theo ID
   * @param planId - ID của gói cước
   */
  async getPlanById(planId: string): Promise<any> {
    return httpRequest<any>(`${plansBaseUrl}/${planId}`, {
      method: "GET",
    });
  },

  /**
   * Tạo một hóa đơn mới.
   * @param payload - Dữ liệu để tạo hóa đơn, bao gồm ID người dùng, ID gói, ngày hết hạn, và ghi chú.
   * @returns Thông tin hóa đơn vừa được tạo.
   */
  async createInvoice(payload: CreateInvoicePayload): Promise<InvoiceResponse> {
    try {
      const response = await httpRequest<ApiResponse<InvoiceResponse>>(invoicesBaseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Kiểm tra response structure
      if (!response.flag) {
        throw new Error(response.message || "Failed to create invoice");
      }

      if (!response.data?.id) {
        throw new Error("Invalid response: Invoice data missing");
      }

      return response.data;
    } catch (error) {
      console.error("Error creating invoice:", error);
      throw error;
    }
  },

  /**
   * Khởi tạo một phiên thanh toán cho một hóa đơn đã có.
   * @param payload - Dữ liệu chứa invoiceId, gateway, và các URL trả về.
   * @returns Thông tin phiên thanh toán, bao gồm checkoutUrl hoặc paymentUrl.
   */
  async initiatePayment(payload: InitiatePaymentPayload): Promise<PaymentSessionResponse> {
    const response = await httpRequest<any>(`${paymentsBaseUrl}/initiate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // Xử lý nhiều định dạng response có thể có
    if (response && typeof response === "object") {
      // Trường hợp 1: Standard API response với flag và data
      if ("flag" in response) {
        if (!response.flag) {
          throw new Error(response.message || "Failed to initiate payment");
        }
        if (response.data) {
          // Chuyển đổi paymentUrl thành checkoutUrl nếu cần
          if (response.data.paymentUrl && !response.data.checkoutUrl) {
            response.data.checkoutUrl = response.data.paymentUrl;
          }
          return response.data;
        }
      }

      // Trường hợp 2: Object trực tiếp với các thông tin cần thiết
      if (response.paymentUrl || response.checkoutUrl) {
        const result = { ...response } as PaymentSessionResponse;
        // Đảm bảo có thuộc tính checkoutUrl
        if (response.paymentUrl && !response.checkoutUrl) {
          result.checkoutUrl = response.paymentUrl;
        }
        return result;
      }

      // Trường hợp 3: Data nằm trong response
      if ("data" in response && response.data) {
        const data = response.data;
        if (data.paymentUrl || data.checkoutUrl) {
          const result = { ...data } as PaymentSessionResponse;
          // Đảm bảo có thuộc tính checkoutUrl
          if (data.paymentUrl && !data.checkoutUrl) {
            result.checkoutUrl = data.paymentUrl;
          }
          return result;
        }
      }
    }

    throw new Error("Invalid response: Payment session data missing or in unknown format");
  },

  /**
   * 🆕 Check và update payment status từ PayOS
   * Backend sẽ gọi PayOS API để lấy trạng thái mới nhất và update database
   * @param paymentId - ID của payment session
   * @returns Thông tin trạng thái thanh toán đã được cập nhật
   */
  async checkAndUpdatePaymentStatus(paymentId: string): Promise<PaymentStatusResponse> {
    try {
      const response = await httpRequest<PaymentStatusResponse>(
        `${paymentsBaseUrl}/${paymentId}/check-status`,
        {
          method: "POST",
        }
      );

      return response;
    } catch (error) {
      console.error(`Error checking payment status ${paymentId}:`, error);
      throw error;
    }
  },

  /**
   * 🆕 Lấy payment status hiện tại (không query PayOS)
   * Chỉ lấy thông tin từ database
   * @param paymentId - ID của payment session
   * @returns Thông tin trạng thái thanh toán hiện tại
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentStatusResponse> {
    try {
      const response = await httpRequest<PaymentStatusResponse>(
        `${paymentsBaseUrl}/${paymentId}/status`,
        {
          method: "GET",
        }
      );

      return response;
    } catch (error) {
      console.error(`Error getting payment status ${paymentId}:`, error);
      throw error;
    }
  },

  /**
   * Lấy lịch sử hóa đơn của người dùng.
   */
  async listUserInvoices(): Promise<InvoiceResponse[]> {
    const response = await httpRequest<InvoiceResponse[]>(invoicesBaseUrl, { method: "GET" });
    return response;
  },

  /**
   * Lấy thông tin chi tiết của một hóa đơn theo ID
   * @param invoiceId - ID của hóa đơn cần xem
   * @returns Thông tin chi tiết hóa đơn
   */
  async getInvoiceById(invoiceId: string): Promise<InvoiceResponse> {
    try {
      const response = await httpRequest<any>(`${invoicesBaseUrl}/${invoiceId}`, {
        method: "GET",
      });

      // Xử lý nhiều định dạng response có thể có
      if (response && typeof response === "object") {
        // Trường hợp 1: Standard API response với flag và data
        if ("flag" in response && response.flag && response.data) {
          return response.data;
        }

        // Trường hợp 2: Object trực tiếp
        if (response.id) {
          return response as InvoiceResponse;
        }

        // Trường hợp 3: Data trong response
        if ("data" in response && response.data && response.data.id) {
          return response.data;
        }
      }

      throw new Error("Invalid response: Invoice data missing");
    } catch (error) {
      console.error(`Error getting invoice ${invoiceId}:`, error);
      throw error;
    }
  },

  /**
   * @deprecated Use checkAndUpdatePaymentStatus instead
   * Verify trạng thái thanh toán với cổng thanh toán
   */
  async verifyPayment(paymentId: string): Promise<any> {
    console.warn("verifyPayment is deprecated. Use checkAndUpdatePaymentStatus instead.");
    return this.checkAndUpdatePaymentStatus(paymentId);
  },

  /**
   * @deprecated Không còn sử dụng - Backend tự động update qua webhook hoặc check-status
   * Xử lý callback từ cổng thanh toán sau khi thanh toán thành công
   */
  async handlePaymentCallback(params: Record<string, string>): Promise<InvoiceResponse> {
    console.warn(
      "⚠️ handlePaymentCallback is DEPRECATED and should not be called. " +
        "Payment status is updated automatically via webhook. " +
        "Use checkAndUpdatePaymentStatus() and getInvoiceById() instead."
    );

    // Fallback: Nếu có invoiceId, lấy thông tin invoice
    if (params.invoiceId) {
      return this.getInvoiceById(params.invoiceId);
    }

    throw new Error("Invoice ID not found in callback parameters. This method is deprecated.");
  },
};
