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

  // Show welcome modal on every login
  useEffect(() => {
    if (currentUser) {
      // Small delay to let the page load first
      setTimeout(() => {
        setShowWelcomeModal(true);
      }, 500);
    }
  }, [currentUser]);

  const handleWelcomeClose = () => {
    setShowWelcomeModal(false);
  };

  const handleUpgrade = (tier) => {
    console.log('🟢 handleUpgrade called with tier:', tier);

    if (tier.price === 0) {
      console.log('⏭️ Skipping free plan');
      return;
    }

    setConfirmState({
      isOpen: true,
      message: `Upgrade to ${tier.name} plan for ₹${tier.price}?\n\nThis will allow you to add up to ${tier.max === Infinity ? 'unlimited' : tier.max} family cards.`,
      tier: tier,
      onConfirm: async () => {
        console.log('✅ Calling upgradePlan:', tier.max, tier.price);
        setConfirmState({ isOpen: false, message: '', onConfirm: null, tier: null });

        // Show saving message
        setAlertState({
          isOpen: true,
          message: `Upgrading to ${tier.name} plan... Please wait.`
        });

        try {
          await upgradePlan(tier.max, tier.price);

          // Wait a moment to ensure Firebase write completes
          await new Promise(resolve => setTimeout(resolve, 1000));

          setAlertState({
            isOpen: true,
            message: `✅ Payment successful! You are now on the ${tier.name} plan with ${tier.max === Infinity ? 'unlimited' : tier.max} cards. Your plan has been saved to the cloud.`
          });
        } catch (error) {
          console.error('❌ Error upgrading plan:', error);
          setAlertState({
            isOpen: true,
            message: `Error upgrading plan. Please try again.`
          });
        }
      }
    });
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
