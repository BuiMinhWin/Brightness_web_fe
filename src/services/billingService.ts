// File: src/services/billingService.ts

import { httpRequest } from "./httpClient";
import type {
  InvoiceResponse,
  PaymentSessionResponse,
  CreateInvoicePayload,
  InitiatePaymentPayload,
  ApiResponse,
} from "../models/billing";

// Định nghĩa các đường dẫn API cơ sở
const plansBaseUrl = "/billing/api/plans";
const invoicesBaseUrl = "/billing/api/billing/invoices";
const paymentsBaseUrl = "/billing/api/billing/payments";

export const billingService = {
  //Lấy danh sách tất cả các gói cước.
  listPlans() {
    return httpRequest<any[]>(plansBaseUrl, { method: "GET" });
  },

  /**
   * Tạo một hóa đơn mới.
   * @param payload - Dữ liệu để tạo hóa đơn, bao gồm ID người dùng, ID gói, ngày hết hạn, và ghi chú.
   * @returns Thông tin hóa đơn vừa được tạo.
   */
  async createInvoice(payload: CreateInvoicePayload): Promise<InvoiceResponse> {
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
  },

  /**
   * Khởi tạo một phiên thanh toán cho một hóa đơn đã có.
   * @param payload - Dữ liệu chứa invoiceId, gateway, và các URL trả về.
   * @returns Thông tin phiên thanh toán, bao gồm checkoutUrl.
   */
  async initiatePayment(payload: InitiatePaymentPayload): Promise<PaymentSessionResponse> {
    const response = await httpRequest<ApiResponse<PaymentSessionResponse>>(
      `${paymentsBaseUrl}/initiate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!response.flag) {
      throw new Error(response.message || "Failed to initiate payment");
    }

    if (!response.data) {
      throw new Error("Invalid response: Payment session data missing");
    }

    return response.data;
  },

  //Lấy lịch sử hóa đơn của người dùng.
  async listUserInvoices(): Promise<InvoiceResponse[]> {
    const response = await httpRequest<InvoiceResponse[]>(invoicesBaseUrl, { method: "GET" });

    // Giả sử listUserInvoices trả về array trực tiếp, không có wrapper
    // Nếu có wrapper thì cần handle tương tự như createInvoice
    return response;
  },
};
