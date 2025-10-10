// File: src/services/billingService.ts

import { httpRequest } from "./httpClient";
import type {
  InvoiceResponse,
  PaymentSessionResponse,
  CreateInvoicePayload,
  InitiatePaymentPayload,
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
   * Tạo một hóa đơn mới dựa trên planId.
   * @param payload - Dữ liệu chứa planId.
   * @returns Thông tin hóa đơn vừa được tạo.
   */
  createInvoice(payload: CreateInvoicePayload) {
    return httpRequest<InvoiceResponse>(invoicesBaseUrl, {
      method: "POST",
      body: payload as any,
    });
  },

  /**
   * Khởi tạo một phiên thanh toán cho một hóa đơn đã có.
   * @param payload - Dữ liệu chứa invoiceId, gateway, và các URL trả về.
   * @returns Thông tin phiên thanh toán, bao gồm checkoutUrl.
   */
  initiatePayment(payload: InitiatePaymentPayload) {
    return httpRequest<PaymentSessionResponse>(`${paymentsBaseUrl}/initiate`, {
      method: "POST",
      // SỬA LỖI: Tương tự, ép kiểu `body` thành `any`.
      body: payload as any,
    });
  },

  //Lấy lịch sử hóa đơn của người dùng.

  listUserInvoices() {
    return httpRequest<InvoiceResponse[]>(invoicesBaseUrl, { method: "GET" });
  },
};
