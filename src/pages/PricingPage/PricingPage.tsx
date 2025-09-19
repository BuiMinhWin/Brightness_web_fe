import React, { useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import GameFooter from '../../components/layout/GameFooter';
import './PricingPage.css';
import { useNavigate } from 'react-router-dom';

interface PricingPageProps {
  onNavigateBack: () => void;
}

interface PricingPlan {
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

const PricingPage: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<string>('free');
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [pendingPlan, setPendingPlan] = useState<PricingPlan | null>(null);
  const navigate = useNavigate();

  const pricingPlans: PricingPlan[] = [
    {
      id: 'free',
      title: 'Free',
      price: '',
      subtitle: '',
      features: [
        'First aid for gym accident, emergency info',
        'Gamification',
        'Community blog access',
        'Chatbox AI (Limited)'
      ],
      buttonText: 'Your current plan',
      isCurrentPlan: true
    },
    {
      id: 'premium-monthly',
      title: '79.000',
      price: '79.000',
      subtitle: '/month',
      features: [
        'AI workout personalization (73.8% demand)',
        'Full tracking & exclusive programs',
        'Enhanced chatbot, no ads',
        'Expert content access',
        'Included all feature from free tier',
        'Long-term savings'
      ],
      buttonText: 'Choose plan',
      isCurrentPlan: false
    },
    {
      id: 'premium-annual',
      title: '599.000',
      price: '599.000',
      subtitle: '/month',
      features: [
        'AI workout personalization (73.8% demand)',
        'Full tracking & exclusive programs',
        'Enhanced chatbot, no ads',
        'Expert content access',
        'Included all feature from free tier',
        'Long-term savings'
      ],
      buttonText: 'Choose plan',
      isCurrentPlan: false,
      isBestValue: true
    }
  ];

  const handlePlanSelection = (planId: string) => {
    if (planId !== 'free') {
      const plan = pricingPlans.find(p => p.id === planId);
      if (plan) {
        setSelectedPlan(planId);
        setPendingPlan(plan);
        setShowConfirmModal(true);
      }
    }
  };

  const handleConfirmPurchase = () => {
    if (pendingPlan) {
      console.log('Confirmed purchase of plan:', pendingPlan.id);
      // Here you would integrate with payment system
      setShowConfirmModal(false);
      setPendingPlan(null);
      // You could show a success message or redirect to payment
    }
  };

  const handleCancelPurchase = () => {
    setShowConfirmModal(false);
    setPendingPlan(null);
    setSelectedPlan('free'); // Reset to current plan
  };

  const handlePremiumTrial = () => {
    console.log('Starting 3-Day Premium Trial');
    // Implement trial logic here
  };

  return (
    <div className="pricing-page">
      <Navbar currentPage="gamification" />
      
      <div className="pricing-content">
        {/* Header */}
        <div className="pricing-header">
          <button className="back-button" onClick={() => navigate('/gamification')}>
          {/* <button className="back-button" onClick={() => navigate('/gamification')}>
        ← Back to Gamification
          </button> */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <polyline points="15,18 9,12 15,6" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
          
          <div className="header-content">
            <h1 className="pricing-title">Plans & Pricing</h1>
            <p className="pricing-subtitle">
              Whether your time-saving automation needs are large or small, we're here to help you scale.
            </p>
          </div>
        </div>

        {/* Premium Trial Button */}
        <div className="trial-section">
          <button className="trial-button" onClick={handlePremiumTrial}>
            3-Day Premium Trial
          </button>
        </div>

        {/* Pricing Cards */}
        <div className="pricing-cards">
          {pricingPlans.map((plan) => (
            <div 
              key={plan.id} 
              className={`pricing-card ${plan.id === 'free' ? 'free-plan' : ''} ${plan.isBestValue ? 'best-value' : ''} ${selectedPlan === plan.id ? 'selected' : ''}`}
              onMouseEnter={() => {
                if (selectedPlan === plan.id && plan.id !== 'free') {
                  // Add special hover effect for selected plans
                  const card = document.querySelector(`[data-plan-id="${plan.id}"]`);
                  if (card) {
                    card.classList.add('selected-hover');
                  }
                }
              }}
              onMouseLeave={() => {
                const card = document.querySelector(`[data-plan-id="${plan.id}"]`);
                if (card) {
                  card.classList.remove('selected-hover');
                }
              }}
              data-plan-id={plan.id}
            >
              {plan.isBestValue && (
                <div className="best-value-badge">
                  BEST VALUE
                </div>
              )}
              
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
                        <polyline points="20,6 9,17 4,12" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </div>
                    <span className="feature-text">{feature}</span>
                  </div>
                ))}
              </div>

              <button 
                className={`plan-button ${plan.isCurrentPlan ? 'current-plan' : 'choose-plan'}`}
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
                    <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
                    <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </button>
              </div>
              
              <div className="modal-content">
                <div className="plan-summary">
                  <div className="plan-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                      <path d="M12 1L15.09 8.26L22 9L17 14.74L18.18 22L12 18.27L5.82 22L7 14.74L2 9L8.91 8.26L12 1Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <h3 className="plan-name">Premium Plan</h3>
                  <div className="plan-price">
                    <span className="price-large">{pendingPlan.price}</span>
                    <span className="price-period">{pendingPlan.subtitle}</span>
                  </div>
                </div>
                
                <div className="confirmation-text">
                  <p>Are you sure you want to upgrade to the Premium plan?</p>
                  <p className="billing-note">You will be charged {pendingPlan.price} {pendingPlan.subtitle.replace('/', '')} and your subscription will auto-renew.</p>
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