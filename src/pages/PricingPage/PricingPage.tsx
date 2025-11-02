import React, { useState, useEffect } from "react";
import GameFooter from "../../components/layout/GameFooter";
import "./PricingPage.css";
import { useNavigate } from "react-router-dom";
import { billingService } from "@/services/billingService";
import { subscriptionPlanService } from "@/services";
import { creditService } from "@/services/creditService";
import { authService } from "@/services/authService";
import type { CreateInvoicePayload, InitiatePaymentPayload, PricingPlan } from "@/models/billing";
import type { SubscriptionPlan } from "@/models/subscriptionPlan";
import { useAppSelector } from "@/store/hooks";
import { selectUserId, selectIsAuthenticated } from "@/store/slices/authSlice";
import { ArrowLeft, Check, Sparkles, Zap, Crown } from "lucide-react";
import { useToast } from "@/hooks/useToast";

interface PricingPageProps {
  onNavigateBack: () => void;
}

const PricingPage: React.FC = () => {
  const { showToast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string>("free");
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [pendingPlan, setPendingPlan] = useState<PricingPlan | null>(null);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [currentCreditTier, setCurrentCreditTier] = useState<string>("free");
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
    isCurrentPlan: false, // Will be set dynamically
  };

    const handleBack = () => {
  if (window.history.length > 1) {
    navigate(-1); 
  } else {
    navigate("/"); // hoặc về trang chính của app
  }
};

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, navigate]);

  // Fetch user's current subscription and credit tier
  useEffect(() => {
    const fetchUserSubscription = async () => {
      if (!userId) return;

      try {
        // Get user data to find subscriptionPlanId
        const userData = await authService.getUser(userId);
        if (userData.subscriptionPlanId) {
          setCurrentPlanId(userData.subscriptionPlanId);
        }

        // Get credit balance to determine tier
        try {
          const creditBalance = await creditService.getCreditBalance(userId, 'chat');
          setCurrentCreditTier(creditBalance.subscriptionTier || 'free');
        } catch (error) {
          console.error("Failed to fetch credit balance:", error);
          // Default to free if credit service fails
          setCurrentCreditTier('free');
        }
      } catch (error) {
        console.error("Failed to fetch user subscription:", error);
      }
    };

    if (userId) {
      fetchUserSubscription();
    }
  }, [userId]);

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
          // Mark free plan as current if no plans found
          const freePlanWithCurrent = {
            ...freePlan,
            isCurrentPlan: !currentPlanId && currentCreditTier === 'free',
          };
          setPricingPlans([freePlanWithCurrent]);
          return;
        }

        // Map subscription plans to pricing plans format
        const apiPlans: PricingPlan[] = planItems.map((plan) => {
          // Check if this plan is current by:
          // 1. Matching subscriptionPlanId, OR
          // 2. If no subscriptionPlanId, match by creditTier
          const isCurrent = currentPlanId === plan.id || 
                           (!currentPlanId && plan.creditTier?.toLowerCase() === currentCreditTier);
          return {
            id: plan.id,
            title: plan.name || (plan.price ? plan.price.toLocaleString() : "Plan"),
            price: plan.price.toLocaleString(),
            subtitle: plan.durationDays === 30 ? "/month" : `/${plan.durationDays} days`,
            features: (plan.description || "")
              .split("\n")
              .filter((line: string) => line.trim() !== ""),
            buttonText: isCurrent ? "Your current plan" : "Choose plan",
            isCurrentPlan: isCurrent,
            // Mark highest price plan as best value
            isBestValue: plan === planItems[planItems.length - 1],
          };
        });

        // Determine if free plan should be marked as current
        // Only if user has free tier AND no paid plan is marked as current
        const hasCurrentPaidPlan = apiPlans.some(p => p.isCurrentPlan);
        const isFreeCurrent = !hasCurrentPaidPlan && currentCreditTier === 'free';
        
        const freePlanWithCurrent = {
          ...freePlan,
          isCurrentPlan: isFreeCurrent,
        };

        // Add free plan at the beginning
        const allPlans = [freePlanWithCurrent, ...apiPlans];
        setPricingPlans(allPlans);
      } catch (error) {
        // If API fails, show at least the free plan
        const freePlanWithCurrent = {
          ...freePlan,
          isCurrentPlan: !currentPlanId && currentCreditTier === 'free',
        };
        setPricingPlans([freePlanWithCurrent]);

        // Show error in UI
        showToast({ message: "Failed to load subscription plans. Please try again later.", severity: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [currentPlanId, currentCreditTier]);

  const handlePlanSelection = (planId: string) => {
    // Don't allow selection of current plan
    const plan = pricingPlans.find((p) => p.id === planId);
    if (plan?.isCurrentPlan) {
      showToast({ message: "This is your current plan", severity: "info" });
      return;
    }

    if (planId !== "free") {
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
      showToast({ message: "Please log in to purchase a subscription plan", severity: "warning" });
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
          userId: userId,
          subscriptionPlanId: pendingPlan.id,
          dueDate: dueDate,
          notes: `Invoice for plan ${subscriptionPlan.name || pendingPlan.id}`,
        };
        console.log("invoicePayload: ", invoicePayload);
        console.log("Creating invoice with payload:", invoicePayload.userId);

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
        showToast({ message: errorMessage, severity: "error" });

        // Đóng modal và reset state
        setShowConfirmModal(false);
        setPendingPlan(null);
      }
    } else {
      // Xử lý trường hợp không có pendingPlan hoặc userId
      showToast({ message: "Could not proceed with purchase. Plan or user information is missing.", severity: "error" });
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
    showToast({ message: "Premium trial feature coming soon!", severity: "info" });
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
    <div className="pricing-page-modern">
      <div className="pricing-container">
        {/* Header */}
        <button onClick={handleBack} className="back-button-modern">
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        {/* Hero Section */}
        <div className="pricing-hero-modern">
          <div className="hero-badge">
            <Sparkles size={16} />
            <span>Flexible Plans for Everyone</span>
          </div>
          <h1 className="hero-title">Choose Your Perfect Plan</h1>
          <p className="hero-subtitle">
            Unlock premium features and accelerate your fitness journey
          </p>
          
          {!loading && (
            <div className="trial-badge-modern" onClick={handlePremiumTrial}>
              <Zap size={16} />
              <span>Start 3-Day Premium Trial</span>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-container-modern">
            <div className="spinner-modern"></div>
            <p>Loading subscription plans...</p>
          </div>
        )}

        {/* Pricing Cards */}
        {!loading && (
          <div className="pricing-grid-modern">
            {pricingPlans.map((plan, index) => {
              const isPopular = plan.isBestValue;
              const isFree = plan.id === "free";
              
              return (
                <div
                  key={plan.id}
                  className={`pricing-card-modern ${isPopular ? "popular" : ""} ${isFree ? "free-card" : ""}`}
                >
                  {isPopular && (
                    <div className="popular-badge">
                      <Crown size={14} />
                      <span>Most Popular</span>
                    </div>
                  )}
                  
                  <div className="card-header-modern">
                    <div className="plan-title-section">
                      <h3 className="plan-name-modern">{plan.title}</h3>
                      {isFree && (
                        <span className="plan-badge-free">Current Plan</span>
                      )}
                    </div>
                    
                    <div className="price-section-modern">
                      {plan.price ? (
                        <div className="price-wrapper">
                          <span className="currency">₫</span>
                          <span className="price-amount">{plan.price}</span>
                          <span className="price-period">{plan.subtitle}</span>
                        </div>
                      ) : (
                        <div className="free-price">
                          <span className="free-price-text">Free</span>
                          <span className="free-price-subtitle">Forever</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="features-list-modern">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="feature-row-modern">
                        <div className="feature-icon-modern">
                          <Check size={18} />
                        </div>
                        <span className="feature-text-modern">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    className={`plan-button-modern ${plan.isCurrentPlan ? "current" : isPopular ? "popular-btn" : ""}`}
                    onClick={() => handlePlanSelection(plan.id)}
                    disabled={plan.isCurrentPlan}
                  >
                    {plan.isCurrentPlan ? (
                      <>
                        <Check size={18} />
                        <span>Current Plan</span>
                      </>
                    ) : (
                      <>
                        <span>Choose Plan</span>
                        <ArrowLeft size={18} style={{ transform: 'rotate(180deg)' }} />
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmModal && pendingPlan && (
          <div className="modal-overlay" onClick={handleCancelPurchase}>
            <div className="confirmation-modal" onClick={(e) => e.stopPropagation()}>
              <h2 className="modal-title">Confirm Purchase</h2>
              <div className="plan-summary">
                <div className="plan-icon">
                  <Crown size={32} />
                </div>
                <h3 className="plan-name">{pendingPlan.title} Plan</h3>
                <div className="plan-price">
                  <span className="price-large">{pendingPlan.price}</span>
                  <span className="price-period">{pendingPlan.subtitle}</span>
                </div>
              </div>

              <div className="confirmation-text">
                <p>Are you sure you want to upgrade to this subscription plan?</p>
                <div className="plan-features-modern">
                  <p className="features-title">This plan includes:</p>
                  <ul className="features-list-modal">
                    {pendingPlan.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="feature-item-modal">
                        <Check size={16} className="feature-check-modal" />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {pendingPlan.features.length > 3 && (
                      <li className="features-more">
                        ...and {pendingPlan.features.length - 3} more features
                      </li>
                    )}
                  </ul>
                </div>
                <p className="billing-note">
                  You will be charged {pendingPlan.price}/{pendingPlan.subtitle.replace("/", "")}{" "}
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
        )}
      </div>

      <GameFooter />
    </div>
  );
};

export default PricingPage;
