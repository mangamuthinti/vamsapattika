import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFamilyTree } from '../context/FamilyTreeContext';
import { useProfileModal } from '../pages/FamilyTree/FamilyTreePage';
import { paymentsAPI } from '../api/payments';
import PricingModal from './PricingModal';
import CustomAlert from './CustomAlert';
import CustomConfirm from './CustomConfirm';
import FeedbackModal from './FeedbackModal';

const UserDropdown = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { familyData, upgradePlan, userPlan } = useFamilyTree();
  const { setShowProfileModal } = useProfileModal();
  const [isOpen, setIsOpen] = useState(false);
  const [showPricingPage, setShowPricingPage] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const dropdownRef = useRef(null);
  const [alertState, setAlertState] = useState({ isOpen: false, message: '' });
  const [confirmState, setConfirmState] = useState({ isOpen: false, message: '', onConfirm: null });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setConfirmState({
      isOpen: true,
      message: 'Are you sure you want to logout?',
      onConfirm: async () => {
        try {
          await logout();
          setConfirmState({ isOpen: false, message: '', onConfirm: null });
          navigate('/');
        } catch (error) {
          console.error('Logout error:', error);
          setConfirmState({ isOpen: false, message: '', onConfirm: null });
        }
      }
    });
  };

  const handleUpgrade = async (tier) => {
    console.log('🟢 UserDropdown handleUpgrade called with tier:', tier);

    if (tier.price === 0) {
      console.log('⏭️ Skipping free plan');
      return;
    }

    try {
      // Create payment order
      setAlertState({
        isOpen: true,
        message: `Preparing payment for ${tier.name} plan...`
      });

      const orderData = await paymentsAPI.createPaymentOrder(tier.id);
      console.log('Order created:', orderData);

      setAlertState({ isOpen: false, message: '' });

      // Initialize Razorpay checkout
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Vamsapattika',
        description: `${orderData.plan_name} Plan`,
        order_id: orderData.order_id,
        handler: async function (response) {
          console.log('Payment successful:', response);

          try {
            // Verify payment on backend
            const verifyData = await paymentsAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            console.log('Payment verified:', verifyData);

            // Fetch fresh subscription data from backend
            const subscriptionData = await paymentsAPI.getSubscription();
            console.log('Fresh subscription data:', subscriptionData);

            // Update local plan data with backend data
            if (subscriptionData && subscriptionData.plan_details) {
              await upgradePlan(
                subscriptionData.plan_details.max_cards === 999999 ? Infinity : subscriptionData.plan_details.max_cards,
                parseFloat(subscriptionData.plan_details.price)
              );
            }

            setAlertState({
              isOpen: true,
              message: `✅ Payment successful! You are now on the ${tier.name} plan with ${tier.max === Infinity ? 'unlimited' : tier.max} cards.`
            });

            // Force reload page to reflect new plan
            setTimeout(() => {
              window.location.href = window.location.href;
            }, 1500);
          } catch (error) {
            console.error('Payment verification failed:', error);
            setAlertState({
              isOpen: true,
              message: 'Payment verification failed. Please contact support.'
            });
          }
        },
        prefill: {
          name: currentUser?.displayName || currentUser?.display_name || '',
          email: currentUser?.email || '',
        },
        theme: {
          color: '#3399cc'
        },
        modal: {
          ondismiss: function() {
            console.log('Payment cancelled by user');
            setAlertState({
              isOpen: true,
              message: 'Payment cancelled'
            });
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('❌ Error creating payment order:', error);
      setAlertState({
        isOpen: true,
        message: 'Failed to initiate payment. Please try again.'
      });
    }
  };

  const getUserInitials = () => {
    if (currentUser?.displayName) {
      return currentUser.displayName.charAt(0).toUpperCase();
    }
    if (currentUser?.email) {
      return currentUser.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <>
      <CustomAlert
        isOpen={alertState.isOpen}
        message={alertState.message}
        onClose={() => {
          setAlertState({ isOpen: false, message: '' });
          setShowPricingPage(false);
        }}
      />
      <CustomConfirm
        isOpen={confirmState.isOpen}
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState({ isOpen: false, message: '', onConfirm: null })}
      />
      <div className="user-dropdown" ref={dropdownRef}>
      <button className="user-avatar-btn" onClick={() => setIsOpen(!isOpen)}>
        <div className="user-avatar">{getUserInitials()}</div>
      </button>

      {isOpen && (
        <div className="user-dropdown-menu">
          <div className="user-dropdown-header">
            <div className="user-avatar-large">{getUserInitials()}</div>
            <div className="user-info">
              <div className="user-name">{currentUser?.displayName || 'User'}</div>
              <div className="user-email">{currentUser?.email}</div>
            </div>
          </div>

          <div className="dropdown-divider"></div>

          {/* Trees menu removed - One tree per user policy */}

          <button className="dropdown-item" onClick={() => { setShowPricingPage(true); setIsOpen(false); }}>
            <span className="dropdown-icon">💳</span>
            Pricing
          </button>

          <button className="dropdown-item" onClick={() => { setShowProfileModal(true); setIsOpen(false); }}>
            <span className="dropdown-icon">👤</span>
            Profile
          </button>

          <button className="dropdown-item" onClick={() => { setShowFeedbackModal(true); setIsOpen(false); }}>
            <span className="dropdown-icon">💬</span>
            Feedback
          </button>

          <a
            href="mailto:support@vamsapattika.com"
            className="dropdown-item"
            onClick={() => setIsOpen(false)}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <span className="dropdown-icon">📧</span>
            Help & Support
          </a>

          <div className="dropdown-divider"></div>

          <button className="dropdown-item logout" onClick={handleLogout}>
            <span className="dropdown-icon">🚪</span>
            Logout
          </button>
        </div>
      )}

      <PricingModal
        isOpen={showPricingPage}
        onClose={() => setShowPricingPage(false)}
        currentCardCount={Object.keys(familyData).length}
        userPlan={userPlan}
        onUpgrade={handleUpgrade}
      />

      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />
    </div>
    </>
  );
};

export default UserDropdown;
