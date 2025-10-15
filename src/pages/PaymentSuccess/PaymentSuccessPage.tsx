import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { billingService } from "@/services/billingService";
import { authService } from "@/services/authService"; // Thêm để refresh user info
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
  const [userUpdated, setUserUpdated] = useState(false);
  const MAX_POLLING_ATTEMPTS = 10; // Tối đa 10 lần (30 giây)

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        setLoading(true);
        setVerifying(true);

        // Lấy thông tin từ URL hoặc sessionStorage
        const invoiceId = searchParams.get("invoiceId");
        const pendingPaymentStr = sessionStorage.getItem("pendingPayment");
        const pendingPayment = pendingPaymentStr ? JSON.parse(pendingPaymentStr) : null;

        const actualInvoiceId = invoiceId || pendingPayment?.invoiceId;
        const paymentId = searchParams.get("paymentId") || pendingPayment?.paymentId;

        if (!actualInvoiceId) {
          throw new Error("Payment information not found. Please contact support.");
        }

        // Bước 1: Nếu có paymentId, gọi API check-status để update từ PayOS
        if (paymentId) {
          try {
            console.log("Checking payment status with PayOS...");
            await billingService.checkAndUpdatePaymentStatus(paymentId);
          } catch (checkError) {
            console.warn("Could not check payment status:", checkError);
            // Không throw error ở đây, vẫn tiếp tục kiểm tra invoice
          }
        }

        // Bước 2: Lấy thông tin invoice để verify trạng thái
        const invoiceData = await billingService.getInvoiceById(actualInvoiceId);
        setInvoice(invoiceData);
        setVerifying(false);

        // Bước 3: Xử lý theo trạng thái invoice
        if (invoiceData.status === "paid") {
          // Thanh toán thành công
          console.log("✅ Payment successful! Invoice paid.");
          setError(null);
          setAutoRefreshing(false);

          // Bước 4: Refresh user info để lấy subscriptionPlanId mới
          if (!userUpdated) {
            try {
              await authService.refreshUserInfo();
              setUserUpdated(true);
              console.log("✅ User subscription updated!");
            } catch (refreshError) {
              console.warn("Could not refresh user info:", refreshError);
            }
          }

          // Clear pending payment từ sessionStorage
          sessionStorage.removeItem("pendingPayment");
        } else if (invoiceData.status === "pending") {
          // Vẫn đang pending - cần polling
          console.log("⏳ Payment pending, will auto-check...");
          setError("Payment is being processed. We're checking the status automatically...");

          if (pollingCount < MAX_POLLING_ATTEMPTS) {
            setAutoRefreshing(true);
          } else {
            setError(
              "Payment is taking longer than expected. Please check your invoice status later or contact support."
            );
            setAutoRefreshing(false);
          }
        } else if (invoiceData.status === "cancelled" || invoiceData.status === "failed") {
          // Thanh toán thất bại hoặc bị hủy
          setError(`Payment ${invoiceData.status}. Please try again.`);
          setAutoRefreshing(false);
          sessionStorage.removeItem("pendingPayment");
        } else {
          // Trạng thái khác
          setError(`Payment status: ${invoiceData.status}`);
          setAutoRefreshing(false);
        }
      } catch (err) {
        console.error("Error verifying payment:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to verify payment. Please contact support with your invoice ID."
        );
        setVerifying(false);
        setAutoRefreshing(false);
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams, pollingCount, userUpdated]);

  // Auto-refresh effect khi status là pending
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (autoRefreshing && invoice && invoice.status === "pending") {
      // Refresh mỗi 3 giây
      timeoutId = setTimeout(() => {
        console.log(`Polling attempt ${pollingCount + 1}/${MAX_POLLING_ATTEMPTS}`);
        setPollingCount((prev) => prev + 1);
      }, 3000);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [autoRefreshing, invoice, pollingCount, MAX_POLLING_ATTEMPTS]);

  const handleManualRefresh = async () => {
    const invoiceId = searchParams.get("invoiceId");
    const pendingPaymentStr = sessionStorage.getItem("pendingPayment");
    const pendingPayment = pendingPaymentStr ? JSON.parse(pendingPaymentStr) : null;
    const actualInvoiceId = invoiceId || pendingPayment?.invoiceId;
    const paymentId = pendingPayment?.paymentId;

    if (!actualInvoiceId) return;

    try {
      setVerifying(true);

      // Check payment status với PayOS trước
      if (paymentId) {
        await billingService.checkAndUpdatePaymentStatus(paymentId);
      }

      // Sau đó lấy invoice mới nhất
      const updatedInvoice = await billingService.getInvoiceById(actualInvoiceId);
      setInvoice(updatedInvoice);

      if (updatedInvoice.status === "paid") {
        setError(null);
        setAutoRefreshing(false);

        // Refresh user info
        if (!userUpdated) {
          await authService.refreshUserInfo();
          setUserUpdated(true);
        }

        sessionStorage.removeItem("pendingPayment");
      } else if (updatedInvoice.status === "pending") {
        setError("Payment is still being processed. Please wait...");
      } else {
        setError(`Payment status: ${updatedInvoice.status}`);
        setAutoRefreshing(false);
      }
    } catch (err) {
      console.error("Error refreshing invoice:", err);
      setError("Could not refresh payment status. Please try again.");
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

  const handleContactSupport = () => {
    // Navigate to support page or open contact modal
    navigate("/support", {
      state: {
        invoiceId: invoice?.id,
        invoiceCode: invoice?.invoiceCode,
      },
    });
  };

  if (loading) {
    return (
      <div className="payment-success-page">
        <div className="payment-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <h2>Verifying your payment...</h2>
            <p>Please wait while we confirm your transaction with PayOS.</p>
          </div>
        </div>
      </div>
    );
  }

  // Success State
  if (invoice?.status === "paid" && !error) {
    return (
      <div className="payment-success-page">
        <div className="payment-container success-container">
          <div className="success-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#10b981" strokeWidth="2" />
              <polyline points="8,12 11,15 16,9" stroke="#10b981" strokeWidth="2" fill="none" />
            </svg>
          </div>

          <h1>🎉 Payment Successful!</h1>
          <p className="success-message">
            Thank you for your purchase! Your subscription has been activated and your account has
            been updated.
          </p>

          <div className="invoice-details">
            <h3>📄 Invoice Details</h3>
            <div className="detail-row">
              <span className="label">Invoice Code:</span>
              <span className="value">{invoice.invoiceCode}</span>
            </div>
            <div className="detail-row">
              <span className="label">Amount Paid:</span>
              <span className="value amount">
                {invoice.amount.toLocaleString()} {invoice.currency}
              </span>
            </div>
            <div className="detail-row">
              <span className="label">Status:</span>
              <span className="value status-badge status-paid">{invoice.status}</span>
            </div>
            {invoice.paidAt && (
              <div className="detail-row">
                <span className="label">Paid At:</span>
                <span className="value">{new Date(invoice.paidAt).toLocaleString()}</span>
              </div>
            )}
            {invoice.notes && (
              <div className="detail-row">
                <span className="label">Notes:</span>
                <span className="value">{invoice.notes}</span>
              </div>
            )}
          </div>

          {userUpdated && (
            <div className="success-note">
              ✅ Your account subscription has been updated successfully!
            </div>
          )}

          <div className="action-buttons">
            <button className="btn btn-primary" onClick={handleGoToDashboard}>
              Go to Dashboard
            </button>
            <button className="btn btn-secondary" onClick={handleGoToPricing}>
              View Other Plans
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Pending State
  if (invoice?.status === "pending") {
    return (
      <div className="payment-success-page">
        <div className="payment-container pending-container">
          <div className="pending-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#f59e0b" strokeWidth="2" />
              <path d="M12 6v6l4 2" stroke="#f59e0b" strokeWidth="2" />
            </svg>
          </div>

          <h1>⏳ Payment Processing...</h1>
          <p className="pending-message">
            Your payment is being verified. This usually takes a few seconds.
          </p>

          <div className="invoice-details">
            <h3>📄 Transaction Details</h3>
            <div className="detail-row">
              <span className="label">Invoice Code:</span>
              <span className="value">{invoice.invoiceCode}</span>
            </div>
            <div className="detail-row">
              <span className="label">Amount:</span>
              <span className="value">
                {invoice.amount.toLocaleString()} {invoice.currency}
              </span>
            </div>
            <div className="detail-row">
              <span className="label">Status:</span>
              <span className="value status-badge status-pending">{invoice.status}</span>
            </div>
          </div>

          {autoRefreshing && (
            <div className="polling-indicator">
              <div className="spinner-small"></div>
              <span>
                Automatically checking payment status... (Attempt {pollingCount + 1} of{" "}
                {MAX_POLLING_ATTEMPTS})
              </span>
            </div>
          )}

          <div className="info-box">
            <p>
              💡 <strong>What's happening?</strong>
            </p>
            <p>
              We're verifying your payment with PayOS. If you've completed the payment, please wait
              a moment while we confirm the transaction.
            </p>
          </div>

          <div className="action-buttons">
            <button className="btn btn-primary" onClick={handleManualRefresh} disabled={verifying}>
              {verifying ? (
                <>
                  <span className="spinner-inline"></span> Checking...
                </>
              ) : (
                "🔄 Check Status Now"
              )}
            </button>
            <button className="btn btn-secondary" onClick={handleContactSupport}>
              Contact Support
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Error/Failed State
  return (
    <div className="payment-success-page">
      <div className="payment-container error-container">
        <div className="error-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2" />
            <line x1="15" y1="9" x2="9" y2="15" stroke="#ef4444" strokeWidth="2" />
            <line x1="9" y1="9" x2="15" y2="15" stroke="#ef4444" strokeWidth="2" />
          </svg>
        </div>

        <h1>❌ Payment Issue</h1>
        <p className="error-message">{error || "There was an issue with your payment."}</p>

        {invoice && (
          <div className="invoice-details">
            <h3>📄 Transaction Details</h3>
            <div className="detail-row">
              <span className="label">Invoice Code:</span>
              <span className="value">{invoice.invoiceCode}</span>
            </div>
            <div className="detail-row">
              <span className="label">Amount:</span>
              <span className="value">
                {invoice.amount.toLocaleString()} {invoice.currency}
              </span>
            </div>
            <div className="detail-row">
              <span className="label">Status:</span>
              <span className="value status-badge status-failed">{invoice.status}</span>
            </div>
          </div>
        )}

        <div className="info-box error-info">
          <p>
            <strong>Need help?</strong>
          </p>
          <p>
            If you believe this is an error or you've already completed the payment, please contact
            our support team with your invoice code.
          </p>
        </div>

        <div className="action-buttons">
          <button className="btn btn-primary" onClick={handleGoToPricing}>
            Try Again
          </button>
          <button className="btn btn-secondary" onClick={handleContactSupport}>
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
