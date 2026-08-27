import React, { useState, useEffect } from 'react';
import { useFamilyTree } from '../context/FamilyTreeContext';
import { useAuth } from '../context/AuthContext';
import { exportAsImage, exportAsPDF, printTree } from '../utils/exportUtils';
import UserDropdown from './UserDropdown';
import CustomConfirm from './CustomConfirm';
import CustomAlert from './CustomAlert';

const Toolbar = () => {
  const { globalShowPhotos, setGlobalShowPhotos, familyData, userPlan, importData } = useFamilyTree();
  const { currentUser } = useAuth();
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);

  // Calculate remaining cards and style based on usage
  const currentCards = Object.keys(familyData).length;
  const maxCards = userPlan.maxCards;
  const isUnlimited = maxCards === Infinity || maxCards >= 999999;
  const remainingCards = isUnlimited ? Infinity : maxCards - currentCards;
  const usagePercentage = isUnlimited ? 0 : (currentCards / maxCards) * 100;

  const getCardCounterStyle = () => {
    if (isUnlimited) {
      return {
        background: 'rgba(76, 175, 80, 0.9)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        color: 'white'
      };
    } else if (usagePercentage >= 100) {
      return {
        background: 'rgba(244, 67, 54, 0.9)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        color: 'white'
      };
    } else if (usagePercentage >= 80) {
      return {
        background: 'rgba(255, 152, 0, 0.9)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        color: 'white'
      };
    } else {
      return {
        background: 'rgba(255, 255, 255, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        color: 'rgba(255, 255, 255, 0.95)'
      };
    }
  };

  // Calculate plan expiry
  const getPlanExpiryInfo = () => {
    if (!userPlan.expiryDate || userPlan.price === 0) return null;

    const expiryDate = new Date(userPlan.expiryDate);
    const now = new Date();
    const daysRemaining = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

    if (daysRemaining <= 0) return null; // Already handled by expiry check on load
    if (daysRemaining <= 30) {
      return { daysRemaining, isExpiringSoon: true };
    }
    return { daysRemaining, isExpiringSoon: false };
  };

  const expiryInfo = getPlanExpiryInfo();
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    message: '',
    onConfirm: null
  });
  const [alertState, setAlertState] = useState({
    isOpen: false,
    message: ''
  });

  // Background images array
  const bgImages = [
    '/images/family-watermark.jpeg',
    '/images/family-watermark2.jpeg',
    '/images/rainbow.jpg',
    '/images/tree.jpg'
  ];

  // Initialize Google Translate when component mounts
  useEffect(() => {
    const initGoogleTranslate = () => {
      const element = document.getElementById('google_translate_element');
      if (element && window.google && window.google.translate) {
        // Clear any existing content
        element.innerHTML = '';
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'en,hi',
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
          },
          'google_translate_element'
        );
      }
    };

    // Try to initialize immediately if google.translate is already loaded
    if (window.google && window.google.translate) {
      initGoogleTranslate();
    } else {
      // Otherwise wait for the script to load
      window.googleTranslateElementInit = initGoogleTranslate;
    }
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.btn-export-toolbar') && !event.target.closest('.export-dropdown')) {
        setExportMenuOpen(false);
      }
      if (!event.target.closest('.btn-share-toolbar') && !event.target.closest('.export-dropdown')) {
        setShareMenuOpen(false);
      }
    };

    if (exportMenuOpen || shareMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [exportMenuOpen, shareMenuOpen]);

  const toggleExportMenu = (e) => {
    e.stopPropagation();
    setExportMenuOpen(!exportMenuOpen);
    setShareMenuOpen(false);
  };

  const toggleShareMenu = (e) => {
    e.stopPropagation();
    setShareMenuOpen(!shareMenuOpen);
    setExportMenuOpen(false);
  };

  const handleExportImage = () => {
    exportAsImage();
    setExportMenuOpen(false);
  };

  const handleExportPDF = () => {
    exportAsPDF();
    setExportMenuOpen(false);
  };

  const handlePrint = () => {
    printTree();
    setExportMenuOpen(false);
  };

  const handleExportJSON = () => {
    const data = {
      familyData: familyData,
      exportDate: new Date().toISOString()
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vamsapattika-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setExportMenuOpen(false);
  };

  const handleImportJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target.result);
            if (data.familyData) {
              importData(data.familyData);
              setAlertState({
                isOpen: true,
                message: 'Data imported successfully!'
              });
            } else {
              setAlertState({
                isOpen: true,
                message: 'Invalid file format'
              });
            }
          } catch (error) {
            setAlertState({
              isOpen: true,
              message: 'Error importing file: ' + error.message
            });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
    setExportMenuOpen(false);
  };

  const shareToWhatsApp = () => {
    const text = 'Check out my Vamsapattika!';
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    setShareMenuOpen(false);
  };

  const shareToFacebook = () => {
    window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(window.location.href), '_blank');
    setShareMenuOpen(false);
  };

  const shareToInstagram = () => {
    // Instagram doesn't have direct web sharing, so we'll show a message
    setAlertState({
      isOpen: true,
      message: 'To share on Instagram:\n1. Export your Vamsapattika as an image\n2. Open Instagram app\n3. Create a new post with the downloaded image'
    });
    setShareMenuOpen(false);
  };

  const shareToTwitter = () => {
    const text = 'Check out my Vamsapattika!';
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
    setShareMenuOpen(false);
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setAlertState({
      isOpen: true,
      message: 'Link copied to clipboard!'
    });
    setShareMenuOpen(false);
  };

  const resetTranslate = () => {
    // Clear Google Translate cookies
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=" + window.location.hostname + "; path=/;";

    // Reload to reset Google Translate
    window.location.reload();
  };

  const changeBackground = () => {
    const nextIndex = (currentBgIndex + 1) % bgImages.length;
    setCurrentBgIndex(nextIndex);

    // Update the CSS directly for .App::before
    const style = document.createElement('style');
    style.textContent = `
      .App::before {
        background-image: url('${bgImages[nextIndex]}') !important;
      }
    `;

    // Remove old style if exists
    const oldStyle = document.getElementById('dynamic-bg-style');
    if (oldStyle) {
      oldStyle.remove();
    }

    style.id = 'dynamic-bg-style';
    document.head.appendChild(style);
  };

  return (
    <>
      <CustomConfirm
        isOpen={confirmState.isOpen}
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState({ isOpen: false, message: '', onConfirm: null })}
      />
      <CustomAlert
        isOpen={alertState.isOpen}
        message={alertState.message}
        onClose={() => setAlertState({ isOpen: false, message: '' })}
      />
      <div className="top-toolbar">
      <div className="toolbar-left">
        <img
          src="/images/logo.jpeg"
          alt="Family Tree Logo"
          style={{
            height: '50px',
            width: '100px',
            marginRight: '10px',
            objectFit: 'contain',
            borderRadius: '4px',
            backgroundColor: 'white',
            padding: '3px'
          }}
        />
        {currentUser && (
          <>
            {/* Tree name removed - One tree per user policy */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '12px' }}>
              <button
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'white',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
                onMouseEnter={() => setShowInfoTooltip(true)}
                onMouseLeave={() => setShowInfoTooltip(false)}
                onClick={() => setShowInfoTooltip(!showInfoTooltip)}
                title="About your family tree"
              >
                ℹ️
                {showInfoTooltip && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '35px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'white',
                      color: '#333',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                      fontSize: '12px',
                      width: '280px',
                      zIndex: 1001,
                      textAlign: 'left',
                      lineHeight: '1.5',
                      fontWeight: '400'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <strong style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>
                      One Tree Per Account
                    </strong>
                    You have one comprehensive family tree. Upgrade your plan to add more family members (cards) to your tree.
                  </div>
                )}
              </button>

              <span
                style={{
                  fontSize: '11px',
                  padding: '6px 12px',
                  borderRadius: '16px',
                  fontWeight: '600',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap',
                  ...getCardCounterStyle()
                }}
                title={isUnlimited ? `Unlimited plan - ${currentCards} cards created` : `You are using ${currentCards} out of ${maxCards} cards in your ${userPlan.name} plan`}
              >
              <span style={{ fontSize: '14px' }}>{isUnlimited ? '💎' : '📊'}</span>
              <span>
                {isUnlimited ? (
                  <>{currentCards} cards (Unlimited)</>
                ) : remainingCards === 0 ? (
                  <>Limit: {currentCards}/{maxCards} cards</>
                ) : remainingCards <= 2 ? (
                  <>{remainingCards} left ({currentCards}/{maxCards})</>
                ) : (
                  <>{currentCards}/{maxCards} cards</>
                )}
              </span>
              {!isUnlimited && usagePercentage >= 80 && (
                <span style={{ fontSize: '14px' }}>
                  {usagePercentage >= 100 ? '⚠️' : '⏰'}
                </span>
              )}
            </span>

            {/* Plan Expiry Warning */}
            {expiryInfo && expiryInfo.isExpiringSoon && (
              <span
                style={{
                  fontSize: '11px',
                  marginLeft: '10px',
                  padding: '6px 12px',
                  borderRadius: '16px',
                  fontWeight: '600',
                  background: 'rgba(255, 152, 0, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  color: 'white',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap'
                }}
                title={`Your ${userPlan.name} plan expires on ${new Date(userPlan.expiryDate).toLocaleDateString()}`}
              >
                <span style={{ fontSize: '14px' }}>⏰</span>
                <span>Renew in {expiryInfo.daysRemaining} days</span>
              </span>
            )}
            </div>
          </>
        )}
      </div>

      <div className="toolbar-right">
        {/* Photo Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '12px' }}>
          <span style={{ fontSize: '12px', color: 'white', fontWeight: '500' }}>Add Photo</span>
          <label className="toggle-switch" style={{ width: '42px', height: '20px' }}>
            <input
              type="checkbox"
              checked={globalShowPhotos}
              onChange={(e) => setGlobalShowPhotos(e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        {/* Background Change Button */}
        <button
          className="btn-export-toolbar"
          onClick={changeBackground}
          title="Change background image"
        >
          <span style={{ fontSize: '18px', marginRight: '8px' }}>🖼️</span>
          Change BG
        </button>


        {/* Export Button */}
        <button className="btn-export-toolbar" onClick={toggleExportMenu}>
          Get Your Tree
        </button>
        {exportMenuOpen && (
          <div className="export-dropdown" id="exportMenu">
            <button onClick={handleExportImage}>
              <span style={{ fontSize: '18px', marginRight: '10px' }}>🖼️</span>
              Download as PNG
            </button>
            <button onClick={handleExportPDF}>
              <span style={{ fontSize: '18px', marginRight: '10px' }}>📄</span>
              Download as PDF
            </button>
            <button onClick={handlePrint}>
              <span style={{ fontSize: '18px', marginRight: '10px' }}>🖨️</span>
              Print / Save as PDF
            </button>
          </div>
        )}

        {/* Share Button */}
        <button className="btn-share-toolbar" onClick={toggleShareMenu}>
          Share
        </button>

        {/* User Dropdown */}
        <UserDropdown />

        {/* Google Translate - Hidden */}
        <div id="google_translate_element" style={{ display: 'none' }}></div>

        {shareMenuOpen && (
          <div className="export-dropdown" id="shareMenu">
            <button onClick={shareToWhatsApp}>
              <span style={{ fontSize: '18px', marginRight: '10px' }}>📱</span>
              WhatsApp
            </button>
            <button onClick={shareToFacebook}>
              <span style={{ fontSize: '18px', marginRight: '10px' }}>👥</span>
              Facebook
            </button>
            <button onClick={shareToInstagram}>
              <span style={{ fontSize: '18px', marginRight: '10px' }}>📷</span>
              Instagram
            </button>
            <button onClick={shareToTwitter}>
              <span style={{ fontSize: '18px', marginRight: '10px' }}>🐦</span>
              Twitter
            </button>
            <button onClick={copyShareLink}>
              <span style={{ fontSize: '18px', marginRight: '10px' }}>🔗</span>
              Copy Link
            </button>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default Toolbar;
