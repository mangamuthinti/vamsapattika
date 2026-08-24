import React from 'react';
import '../styles/PricingModal.css';

const PricingModal = ({ isOpen, onClose, currentCardCount, requiredTier, onUpgrade, userPlan }) => {
  if (!isOpen) return null;

  // Updated pricing: 4 free, 5-10 = ₹600, 11-15 = ₹1500, unlimited = ₹2600
  const pricingTiers = [
    { max: 4, price: 0, name: 'Free', description: 'Get started' },
    { max: 10, price: 600, name: 'Silver', description: 'For small families' },
    { max: 15, price: 1500, name: 'Gold', description: 'For growing families' },
    { max: Infinity, price: 2600, name: 'Diamond', description: 'Unlimited cards' }
  ];

  // Use actual userPlan to determine current tier
  const currentTier = userPlan || { max: 4, price: 0, name: 'Free' };
  const nextTier = pricingTiers.find(tier => tier.max > currentTier.maxCards && tier.price > currentTier.price);

  return (
    <div className="pricing-modal-overlay">
      <div className="pricing-modal">
        <button className="pricing-modal-close" onClick={onClose}>×</button>

        <div className="pricing-modal-header">
          <h2>Upgrade Required</h2>
          <p>You've reached the limit of {currentTier.maxCards} cards on the {currentTier.name} plan</p>
        </div>

        <div className="pricing-tiers">
          {pricingTiers.map((tier, index) => {
            const isCurrentTier = tier.max === currentTier.maxCards && tier.name === currentTier.name;
            const isRecommended = tier.max > currentTier.maxCards && (!nextTier || tier.price === nextTier.price);

            return (
              <div
                key={index}
                className={`pricing-card ${isCurrentTier ? 'current' : ''} ${isRecommended ? 'recommended' : ''}`}
              >
                {isRecommended && <div className="recommended-badge">Recommended</div>}

                <div className="pricing-card-icon">
                  {tier.max === 4 ? '👥' : tier.max === 10 ? '🌱' : tier.max === 15 ? '🌳' : '💎'}
                </div>

                <h3 className="pricing-card-name">{tier.name}</h3>
                <p className="pricing-card-description">{tier.description}</p>

                <div className="pricing-card-price">
                  {tier.price === 0 ? (
                    <>
                      <span className="price-amount">₹0</span>
                      <span className="price-period">Free for everyone</span>
                    </>
                  ) : (
                    <>
                      <span className="price-amount">₹{tier.price}</span>
                      <span className="price-period">One-time payment</span>
                    </>
                  )}
                </div>

                <div className="pricing-card-features">
                  <div className="feature">
                    <span className="feature-icon">✓</span>
                    <span>{tier.max === Infinity ? 'Unlimited family cards' : `Up to ${tier.max} family cards`}</span>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">✓</span>
                    <span>Add photos & customize</span>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">✓</span>
                    <span>Export as PNG/PDF</span>
                  </div>
                  {tier.price > 0 && (
                    <div className="feature">
                      <span className="feature-icon">✓</span>
                      <span>Priority support</span>
                    </div>
                  )}
                </div>

                {isRecommended && tier.price > 0 && (
                  <button
                    className="pricing-card-button primary"
                    onClick={() => onUpgrade(tier)}
                  >
                    Upgrade Now
                  </button>
                )}
                {isCurrentTier && (
                  <button className="pricing-card-button current-plan" disabled>
                    Current Plan
                  </button>
                )}
                {!isCurrentTier && !isRecommended && (
                  <button
                    className="pricing-card-button secondary"
                    onClick={() => tier.price > 0 && onUpgrade(tier)}
                    disabled={tier.price === 0}
                  >
                    {tier.price === 0 ? 'Free Plan' : 'Select Plan'}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="pricing-modal-footer">
          <p>All features included. One-time payment. No recurring charges.</p>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;
