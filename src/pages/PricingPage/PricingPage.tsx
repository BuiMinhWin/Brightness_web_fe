import React, { useState, useEffect } from "react";
import GameFooter from "../../components/layout/GameFooter";
import "./PricingPage.css";
import { useNavigate } from "react-router-dom";
import { billingService } from "@/services/billingService";
import { subscriptionPlanService } from "@/services";
import type { CreateInvoicePayload, InitiatePaymentPayload, PricingPlan } from "@/models/billing";
import type { SubscriptionPlan } from "@/models/subscriptionPlan";
import { useAppSelector } from "@/store/hooks";
import { selectUserId, selectIsAuthenticated } from "@/store/slices/authSlice";

interface PricingPageProps {
  onNavigateBack: () => void;
}

const PricingPage: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<string>("free");
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [pendingPlan, setPendingPlan] = useState<PricingPlan | null>(null);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Get user ID from Redux instead of localStorage
  const userId = useAppSelector(selectUserId);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // Fixed free plan that should always be displayed
  const freePlan: PricingPlan = {
    id: "free",
    title: "Free",
    price: "",
    subtitle: "",
    features: [
      "First aid for gym accident, emergency info",
      "Gamification",
      "Community blog access",
      "Chatbox AI (Limited)",
    ],
    buttonText: "Your current plan",
    isCurrentPlan: true,
  };

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, navigate]);

  // Fetch subscription plans from API
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        // Get only active plans
        const response = await subscriptionPlanService.getPlans({
          isActive: true,
          sortBy: "price",
          sortDirection: "asc",
        });

        // Use items from the response - the service handles all possible formats
        const planItems = response?.items || [];

        if (planItems.length === 0) {
          setPricingPlans([freePlan]);
          return;
        }

        // Map subscription plans to pricing plans format
        const apiPlans: PricingPlan[] = planItems.map((plan) => {
          return {
            id: plan.id,
            title: plan.name || (plan.price ? plan.price.toLocaleString() : "Plan"),
            price: plan.price.toLocaleString(),
            subtitle: plan.durationDays === 30 ? "/month" : `/${plan.durationDays} days`,
            features: (plan.description || "")
              .split("\n")
              .filter((line: string) => line.trim() !== ""),
            buttonText: "Choose plan",
            isCurrentPlan: false,
            // Mark highest price plan as best value
            isBestValue: plan === planItems[planItems.length - 1],
          };
        });

        // Add free plan at the beginning
        const allPlans = [freePlan, ...apiPlans];
        setPricingPlans(allPlans);
      } catch (error) {
        // If API fails, show at least the free plan
        setPricingPlans([freePlan]);

        // Show error in UI
        alert("Failed to load subscription plans. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handlePlanSelection = (planId: string) => {
    if (planId !== "free") {
      const plan = pricingPlans.find((p) => p.id === planId);
      if (plan) {
        setSelectedPlan(planId);
        setPendingPlan(plan);
        setShowConfirmModal(true);
      }
    }
  };

  const handleConfirmPurchase = async () => {
    // Check authentication and userId
    if (!isAuthenticated || !userId) {
      alert("Please log in to purchase a subscription plan");
      navigate("/auth");
      return;
    }

    if (pendingPlan && userId) {
      try {
        // Get actual subscription plan details from API to ensure we have the latest data
        let subscriptionPlan;
        try {
          subscriptionPlan = await subscriptionPlanService.getPlanById(pendingPlan.id);

          // Verify the plan is active
          if (!subscriptionPlan.isActive) {
            throw new Error("This subscription plan is no longer available.");
          }
        } catch (planError) {
          throw new Error("Could not retrieve subscription plan details. Please try again.");
        }

        // Bước 1: Tạo hóa đơn với payload mới.
        const today = new Date();
        const dueDate = today.toISOString().split("T")[0]; // Format: YYYY-MM-DD

        const invoicePayload: CreateInvoicePayload = {
          userExternalId: userId,
          subscriptionPlanId: pendingPlan.id,
          dueDate: dueDate,
          notes: `Invoice for plan ${subscriptionPlan.name || pendingPlan.id}`,
        };

        // Bây giờ invoice sẽ có đúng structure với id
        const invoice = await billingService.createInvoice(invoicePayload);

        // Kiểm tra invoice.id - bây giờ sẽ work
        if (!invoice?.id) {
          throw new Error("Failed to create an invoice.");
        }

        // Bước 2: Khởi tạo thanh toán với invoiceId vừa nhận được.
        const paymentSession = await billingService.initiatePayment({
          invoiceId: invoice.id,
          gateway: 2, // 2 = PayOS
          returnUrl: `https://brightnessweb.vercel.app/payment-success?invoiceId=${invoice.id}`,
          cancelUrl: `https://brightnessweb.vercel.app/pricing`,
        });

        // Bước 3: Kiểm tra và chuyển hướng người dùng.
        // Sử dụng checkoutUrl hoặc paymentUrl tùy theo response API
        const redirectUrl = paymentSession?.checkoutUrl || paymentSession?.paymentUrl;
        if (redirectUrl) {
          // Lưu thông tin payment session vào sessionStorage để sử dụng sau
          sessionStorage.setItem(
            "pendingPayment",
            JSON.stringify({
              paymentId: paymentSession.paymentId,
              invoiceId: invoice.id,
              transactionId: paymentSession.transactionId,
            })
          );

          window.location.href = redirectUrl;
        } else {
          throw new Error("Payment URL not found. Cannot proceed with payment.");
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An error occurred. Please try again.";
        alert(errorMessage);

        // Đóng modal và reset state
        setShowConfirmModal(false);
        setPendingPlan(null);
      }
    } else {
      // Xử lý trường hợp không có pendingPlan hoặc userId
      alert("Could not proceed with purchase. Plan or user information is missing.");
      setShowConfirmModal(false);
      setPendingPlan(null);
    }
  };

  const handleCancelPurchase = () => {
    setShowConfirmModal(false);
    setPendingPlan(null);
    setSelectedPlan("free"); // Reset to current plan
  };

  const handlePremiumTrial = () => {
    // Implement trial logic here
    alert("Premium trial feature coming soon!");
  };

  // User authentication management functions are handled by the hooks and navigation

  // If not authenticated and the effect hasn't redirected yet, show loading or empty state
  if (!isAuthenticated) {
    return (
      <div className="pricing-page">
        <div className="pricing-content" style={{ textAlign: "center", padding: "50px" }}>
          <p>Please log in to view pricing plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pricing-page">
      <div className="pricing-content">
        {/* Header */}
        <div className="pricing-header">
          <div className="flex justify-between items-center w-full">
            <button className="back-button" onClick={() => navigate("/your-missions")}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <polyline points="15,18 9,12 15,6" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
          </div>

          <div className="header-content">
            <h1 className="pricing-title flex justify-between items-center w-full">
              Plans & Pricing
            </h1>
            <p className="pricing-subtitle">
              Whether your time-saving automation needs are large or small, we're here to help you
              scale.
            </p>
          </div>
        </div>

        {/* Premium Trial Button */}
        <div className="trial-section">
          <button className="trial-button" onClick={handlePremiumTrial}>
            3-Day Premium Trial
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center p-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="ml-4 text-lg">Loading subscription plans...</p>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="pricing-cards">
          {pricingPlans.map((plan) => (
            <div
              key={plan.id}
              className={`pricing-card ${plan.id === "free" ? "free-plan" : ""} ${plan.isBestValue ? "best-value" : ""} ${selectedPlan === plan.id ? "selected" : ""}`}
              onMouseEnter={() => {
                if (selectedPlan === plan.id && plan.id !== "free") {
                  // Add special hover effect for selected plans
                  const card = document.querySelector(`[data-plan-id="${plan.id}"]`);
                  if (card) {
                    card.classList.add("selected-hover");
                  }
                }
              }}
              onMouseLeave={() => {
                const card = document.querySelector(`[data-plan-id="${plan.id}"]`);
                if (card) {
                  card.classList.remove("selected-hover");
                }
              }}
              data-plan-id={plan.id}
            >
              {plan.isBestValue && <div className="best-value-badge">BEST VALUE</div>}

              <div className="card-header">
                <div className="price-section">
                  {plan.price ? (
                    <>
                      <span className="price">{plan.price}</span>
                      <span className="price-subtitle">{plan.subtitle}</span>
                    </>
                  ) : (
                    <span className="free-title">{plan.title}</span>
                  )}
                </div>
              </div>

              <div className="features-section">
                {plan.features.map((feature, index) => (
                  <div key={index} className="feature-item">
                    <div className="feature-check">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <polyline points="20,6 9,17 4,12" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    </div>
                    <span className="feature-text">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                className={`plan-button ${plan.isCurrentPlan ? "current-plan" : "choose-plan"}`}
                onClick={() => handlePlanSelection(plan.id)}
                disabled={plan.isCurrentPlan}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* Confirmation Modal */}
        {showConfirmModal && pendingPlan && (
          <div className="modal-overlay" onClick={handleCancelPurchase}>
            <div className="confirmation-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Confirm Purchase</h2>
                <button className="close-button" onClick={handleCancelPurchase}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" />
                    <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </button>
              </div>

              <div className="modal-content">
                <div className="plan-summary">
                  <div className="plan-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 1L15.09 8.26L22 9L17 14.74L18.18 22L12 18.27L5.82 22L7 14.74L2 9L8.91 8.26L12 1Z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                  <h3 className="plan-name">{pendingPlan.title} Plan</h3>
                  <div className="plan-price">
                    <span className="price-large">{pendingPlan.price}</span>
                    <span className="price-period">{pendingPlan.subtitle}</span>
                  </div>
                </div>

                <div className="confirmation-text">
                  <p>Are you sure you want to upgrade to this subscription plan?</p>
                  <div className="plan-features mt-3">
                    <p className="text-sm font-semibold mb-2">This plan includes:</p>
                    <ul className="text-sm">
                      {pendingPlan.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="flex items-center mb-1">
                          <svg
                            className="w-4 h-4 mr-2 text-green-500"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {feature}
                        </li>
                      ))}
                      {pendingPlan.features.length > 3 && (
                        <li className="text-sm text-gray-500 mt-1">
                          ...and {pendingPlan.features.length - 3} more features
                        </li>
                      )}
                    </ul>
                  </div>
                  <p className="billing-note text-sm mt-3">
                    You will be charged {pendingPlan.price} {pendingPlan.subtitle.replace("/", "")}{" "}
                    for this subscription.
                  </p>
                </div>

                <div className="modal-actions">
                  <button className="cancel-button" onClick={handleCancelPurchase}>
                    Cancel
                  </button>
                  <button className="confirm-button" onClick={handleConfirmPurchase}>
                    Confirm Purchase
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <GameFooter />
    </div>
  );
};

export default PricingPage;
