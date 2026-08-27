import React from 'react';
import '../styles/PricingModal.css';

const PricingModal = ({ isOpen, onClose, currentCardCount, requiredTier, onUpgrade, userPlan }) => {
  if (!isOpen) return null;

  // Updated pricing: 4 free, 5-10 = ₹499, 11-18 = ₹999, unlimited = ₹1499
  // All packages valid for 1 year, renewal required after expiry
  const pricingTiers = [
    { max: 4, price: 0, name: 'Free', description: 'Get started' },
    { max: 10, price: 499, name: 'Silver', description: 'For small families' },
    { max: 18, price: 999, name: 'Gold', description: 'For growing families' },
    { max: Infinity, price: 1499, name: 'Diamond', description: 'Unlimited cards' }
  ];

  // Use actual userPlan to determine current tier
  // Handle 999999 as Infinity for comparison
  const currentMaxCards = userPlan?.maxCards >= 999999 ? Infinity : userPlan?.maxCards;
  const currentTier = userPlan || { max: 4, price: 0, name: 'Free' };
  const nextTier = pricingTiers.find(tier => tier.max > currentMaxCards && tier.price > currentTier.price);

  return (
    <div className="pricing-modal-overlay">
      <div className="pricing-modal">
        <button className="pricing-modal-close" onClick={onClose}>×</button>

        <div className="pricing-modal-header">
          <h2>Upgrade Required</h2>
          <p>You've reached the limit of {currentMaxCards === Infinity ? 'unlimited' : currentTier.maxCards} cards on the {currentTier.name} plan</p>
          {userPlan?.expiryDate && userPlan.price > 0 && (
            <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
              Current plan expires on: {new Date(userPlan.expiryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          )}
          <p style={{ fontSize: '12px', color: '#4a90e2', marginTop: '8px', fontWeight: '500' }}>
            ℹ️ Each plan lets you add more family members to your tree. One comprehensive tree per account.
          </p>
        </div>

        <div className="pricing-tiers">
          {pricingTiers.map((tier, index) => {
            const isCurrentTier = (tier.max === Infinity && currentMaxCards === Infinity) ||
                                 (tier.max === currentTier.maxCards && tier.name === currentTier.name);
            const isRecommended = tier.max > currentMaxCards && (!nextTier || tier.price === nextTier.price);

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
                      <span className="price-period">Valid for 1 year</span>
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
          <div className="pricing-warning">
            <span className="warning-icon">⚠️</span>
            <span className="warning-text">
              <strong>Important:</strong> All paid packages are valid for 1 year from the date of purchase.
              After 1 year, you will need to renew your subscription to continue accessing premium features.
            </span>
          </div>
          <p style={{ marginTop: '6px', fontSize: '10px', color: '#666' }}>
            All features included in your selected plan.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;
