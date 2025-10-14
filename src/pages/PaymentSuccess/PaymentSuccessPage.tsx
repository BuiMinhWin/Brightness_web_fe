import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { billingService } from "@/services/billingService";
import type { InvoiceResponse } from "@/models/billing";
import "./PaymentSuccessPage.css";

const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<InvoiceResponse | null>(null);
  const [verifying, setVerifying] = useState(true);
  const [pollingCount, setPollingCount] = useState(0);
  const [autoRefreshing, setAutoRefreshing] = useState(false);
  const MAX_POLLING_ATTEMPTS = 10; // Tối đa 10 lần (30 giây)

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        setLoading(true);
        setVerifying(true);

        // Lấy các tham số từ URL
        const paymentId = searchParams.get("paymentId");
        const invoiceId = searchParams.get("invoiceId");
        const transactionId = searchParams.get("transactionId");
        const status = searchParams.get("status");

        // Nếu không có paymentId hoặc invoiceId, có thể thanh toán thất bại
        if (!paymentId && !invoiceId) {
          throw new Error("Payment information not found in URL");
        }

        // Tạo object params để gửi đến backend
        const params: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          params[key] = value;
        });

        // Gọi API để verify và cập nhật trạng thái thanh toán
        let updatedInvoice: InvoiceResponse;

        try {
          // Thử dùng callback API trước
          updatedInvoice = await billingService.handlePaymentCallback(params);
        } catch (callbackError) {
          // Nếu callback API không có, thử verify payment
          if (paymentId) {
            await billingService.verifyPayment(paymentId);
          }

          // Sau đó lấy thông tin invoice
          if (invoiceId) {
            updatedInvoice = await billingService.getInvoiceById(invoiceId);
          } else {
            throw new Error("Cannot retrieve invoice information");
          }
        }

        setInvoice(updatedInvoice);
        setVerifying(false);

        // Kiểm tra trạng thái thanh toán
        if (updatedInvoice.status === "paid" || updatedInvoice.status === "completed") {
          // Thanh toán thành công
          setError(null);
          setAutoRefreshing(false);
        } else if (updatedInvoice.status === "pending") {
          // Vẫn đang pending - có thể cần thời gian xử lý
          setError("Payment is being processed. We're checking the status automatically...");
          // Bật auto-refresh nếu chưa vượt quá số lần thử
          if (pollingCount < MAX_POLLING_ATTEMPTS) {
            setAutoRefreshing(true);
          }
        } else {
          // Các trạng thái khác
          setError(`Payment status: ${updatedInvoice.status}`);
          setAutoRefreshing(false);
        }
      } catch (err) {
        console.error("Error verifying payment:", err);
        setError(
          err instanceof Error ? err.message : "Failed to verify payment. Please contact support."
        );
        setVerifying(false);
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams, pollingCount]);

  // Auto-refresh effect khi status là pending
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (autoRefreshing && invoice && invoice.status === "pending") {
      // Refresh mỗi 3 giây
      intervalId = setTimeout(() => {
        setPollingCount((prev) => prev + 1);
      }, 3000);
    }

    return () => {
      if (intervalId) {
        clearTimeout(intervalId);
      }
    };
  }, [autoRefreshing, invoice]);

  const handleManualRefresh = async () => {
    const invoiceId = searchParams.get("invoiceId");
    if (!invoiceId) return;

    try {
      setVerifying(true);
      const updatedInvoice = await billingService.getInvoiceById(invoiceId);
      setInvoice(updatedInvoice);

      if (updatedInvoice.status === "paid" || updatedInvoice.status === "completed") {
        setError(null);
        setAutoRefreshing(false);
      } else if (updatedInvoice.status === "pending") {
        setError("Payment is still being processed. Please wait...");
      }
    } catch (err) {
      console.error("Error refreshing invoice:", err);
    } finally {
      setVerifying(false);
    }
  };

  const handleGoToDashboard = () => {
    navigate("/dashboard");
  };

  const handleGoToPricing = () => {
    navigate("/pricing");
  };

  const handleCheckInvoice = () => {
    if (invoice?.id) {
      // Navigate to invoice detail page (you may need to create this)
      navigate(`/invoices/${invoice.id}`);
    }
  };

  if (loading) {
    return (
      <div className="payment-success-page">
        <div className="payment-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <h2>Verifying your payment...</h2>
            <p>Please wait while we confirm your transaction.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-success-page">
        <div className="payment-container error-container">
          <div className="error-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" />
              <circle cx="12" cy="16" r="1" fill="currentColor" />
            </svg>
          </div>
          <h1>Payment Verification Issue</h1>
          <p className="error-message">{error}</p>

          {invoice && invoice.status === "pending" && (
            <>
              <div className="info-box">
                <p>
                  <strong>Invoice Code:</strong> {invoice.invoiceCode}
                </p>
                <p>
                  <strong>Amount:</strong> {invoice.amount.toLocaleString()} {invoice.currency}
                </p>
                <p className="note">
                  {autoRefreshing ? (
                    <>
                      ⏳ We're automatically checking the payment status every 3 seconds...
                      <br />
                      Attempt {pollingCount + 1} of {MAX_POLLING_ATTEMPTS}
                    </>
                  ) : (
                    <>
                      If you have completed the payment, it may take a few minutes to process.
                      Please check back later or contact support if the issue persists.
                    </>
                  )}
                </p>
              </div>

              {autoRefreshing && (
                <div className="polling-indicator">
                  <div className="spinner-small"></div>
                  <span>Checking payment status...</span>
                </div>
              )}
            </>
          )}

          <div className="action-buttons">
            <button className="btn btn-secondary" onClick={handleGoToPricing}>
              Back to Pricing
            </button>
            {invoice && invoice.status === "pending" && (
              <button
                className="btn btn-primary"
                onClick={handleManualRefresh}
                disabled={verifying}
              >
                {verifying ? "Refreshing..." : "Refresh Status"}
              </button>
            )}
            {invoice && invoice.status !== "pending" && (
              <button className="btn btn-primary" onClick={handleCheckInvoice}>
                Check Invoice Status
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-success-page">
      <div className="payment-container success-container">
        <div className="success-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <polyline points="8,12 11,15 16,9" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
        </div>

        <h1>Payment Successful!</h1>
        <p className="success-message">
          Thank you for your purchase. Your subscription has been activated.
        </p>

        {invoice && (
          <div className="invoice-details">
            <h3>Invoice Details</h3>
            <div className="detail-row">
              <span className="label">Invoice Code:</span>
              <span className="value">{invoice.invoiceCode}</span>
            </div>
            <div className="detail-row">
              <span className="label">Amount Paid:</span>
              <span className="value">
                {invoice.amount.toLocaleString()} {invoice.currency}
              </span>
            </div>
            <div className="detail-row">
              <span className="label">Status:</span>
              <span className="value status-badge">{invoice.status}</span>
            </div>
            {invoice.paidAt && (
              <div className="detail-row">
                <span className="label">Paid At:</span>
                <span className="value">{new Date(invoice.paidAt).toLocaleString()}</span>
              </div>
            )}
          </div>
        )}

        <div className="action-buttons">
          <button className="btn btn-primary" onClick={handleGoToDashboard}>
            Go to Dashboard
          </button>
          <button className="btn btn-secondary" onClick={handleGoToPricing}>
            View Plans
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
