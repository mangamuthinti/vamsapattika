import React, { useState, createContext, useContext, useEffect } from 'react';
import { FamilyTreeProvider, useFamilyTree } from '../../context/FamilyTreeContext';
import Toolbar from '../../components/Toolbar';
import FamilyTree from '../../components/FamilyTree';
import PersonModal from '../../components/PersonModal';
import PropertiesPanel from '../../components/PropertiesPanel';
import Footer from '../../components/Footer';
import PricingModal from '../../components/PricingModal';
import Profile from '../../components/Profile';
import CustomConfirm from '../../components/CustomConfirm';
import CustomAlert from '../../components/CustomAlert';
import WelcomeModal from '../../components/WelcomeModal';
import { useAuth } from '../../context/AuthContext';
import { paymentsAPI } from '../../api/payments';

// Profile Modal Context
const ProfileModalContext = createContext();
export const useProfileModal = () => useContext(ProfileModalContext);

function FamilyTreePageContent() {
  const { showPricingModal, setShowPricingModal, familyData, upgradePlan, userPlan } = useFamilyTree();
  const { currentUser } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [confirmState, setConfirmState] = useState({ isOpen: false, message: '', onConfirm: null, tier: null });
  const [alertState, setAlertState] = useState({ isOpen: false, message: '' });

  // Show welcome modal only on fresh login (not on refresh)
  useEffect(() => {
    if (currentUser) {
      // Check if welcome modal was already shown in this session
      const welcomeShown = sessionStorage.getItem('welcomeModalShown');

      if (!welcomeShown) {
        // Small delay to let the page load first
        setTimeout(() => {
          setShowWelcomeModal(true);
          // Mark as shown for this session
          sessionStorage.setItem('welcomeModalShown', 'true');
        }, 500);
      }
    }
  }, [currentUser]);

  const handleWelcomeClose = () => {
    setShowWelcomeModal(false);
  };

  const handleUpgrade = async (tier) => {
    console.log('🟢 handleUpgrade called with tier:', tier);

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
      let paymentStatusPoll;
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Vamsapattika',
        description: `${orderData.plan_name} Plan`,
        order_id: orderData.order_id,
        handler: async function (response) {
          clearInterval(paymentStatusPoll);
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
            clearInterval(paymentStatusPoll);
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
      let pollAttempts = 0;
      paymentStatusPoll = setInterval(async () => {
        pollAttempts += 1;
        try {
          const paymentStatus = await paymentsAPI.getPaymentStatus(orderData.order_id);
          if (paymentStatus.status === 'SUCCESS') {
            clearInterval(paymentStatusPoll);
            setAlertState({
              isOpen: true,
              message: `Payment successful! You are now on the ${tier.name} plan.`
            });
            setTimeout(() => {
              window.location.href = window.location.href;
            }, 1500);
          }
        } catch (error) {
          console.error('Payment status check failed:', error);
        }
        if (pollAttempts >= 150) {
          clearInterval(paymentStatusPoll);
        }
      }, 2000);
    } catch (error) {
      console.error('❌ Error creating payment order:', error);
      setAlertState({
        isOpen: true,
        message: 'Failed to initiate payment. Please try again.'
      });
    }
  };

  return (
    <ProfileModalContext.Provider value={{ showProfileModal, setShowProfileModal }}>
      <div className="App">
        {/* SVG Definitions for Custom Shapes */}
        <svg width="0" height="0" style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
          <defs>
            <clipPath id="shape-apple-clip" clipPathUnits="objectBoundingBox">
              <path d="M 0.5 0.12 C 0.7 0.02, 1.0 0.1, 0.98 0.45 C 0.95 0.8, 0.7 1.0, 0.5 0.92 C 0.3 1.0, 0.05 0.8, 0.02 0.45 C 0.0 0.1, 0.3 0.02, 0.5 0.12 Z"></path>
            </clipPath>
            <clipPath id="shape-sunflower-clip" clipPathUnits="objectBoundingBox">
              <path d="M 0.41 0.16 Q 0.5 0.0, 0.59 0.16 Q 0.75 0.07, 0.75 0.25 Q 0.93 0.25, 0.84 0.41 Q 1.0 0.5, 0.84 0.59 Q 0.93 0.75, 0.75 0.75 Q 0.75 0.93, 0.59 0.84 Q 0.5 1.0, 0.41 0.84 Q 0.25 0.93, 0.25 0.75 Q 0.07 0.75, 0.16 0.59 Q 0.0 0.5, 0.16 0.41 Q 0.07 0.25, 0.25 0.25 Q 0.25 0.07, 0.41 0.16 Z"></path>
            </clipPath>
            <clipPath id="shape-rose-clip" clipPathUnits="objectBoundingBox">
              <path d="M 0.1 0.15 C 0.2 0.25, 0.3 0.25, 0.4 0.08 C 0.45 0.18, 0.55 0.18, 0.6 0.08 C 0.7 0.25, 0.8 0.25, 0.9 0.15 C 1.0 0.45, 0.9 0.8, 0.5 1.0 C 0.1 0.8, 0.0 0.45, 0.1 0.15 Z"></path>
            </clipPath>
          </defs>
        </svg>

        <Toolbar />
        <FamilyTree />
        <PersonModal />
        <PropertiesPanel />
        <Footer />

        <PricingModal
          isOpen={showPricingModal}
          onClose={() => setShowPricingModal(false)}
          currentCardCount={Object.keys(familyData).length}
          userPlan={userPlan}
          onUpgrade={handleUpgrade}
        />

        <Profile
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
        />

        <CustomConfirm
          isOpen={confirmState.isOpen}
          message={confirmState.message}
          onConfirm={confirmState.onConfirm}
          onCancel={() => setConfirmState({ isOpen: false, message: '', onConfirm: null, tier: null })}
        />

        <CustomAlert
          isOpen={alertState.isOpen}
          message={alertState.message}
          onClose={() => {
            setAlertState({ isOpen: false, message: '' });
            setShowPricingModal(false);
          }}
        />

        <WelcomeModal
          isOpen={showWelcomeModal}
          onClose={handleWelcomeClose}
        />
      </div>
    </ProfileModalContext.Provider>
  );
}

function FamilyTreePage() {
  return (
    <FamilyTreeProvider>
      <FamilyTreePageContent />
    </FamilyTreeProvider>
  );
}

export default FamilyTreePage;
