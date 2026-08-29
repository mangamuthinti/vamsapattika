import React from 'react';
import '../styles/WelcomeModal.css';

const WelcomeModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="welcome-modal-overlay" onClick={onClose}>
      <div className="welcome-modal" onClick={(e) => e.stopPropagation()}>
        <button className="welcome-close-btn" onClick={onClose}>×</button>

        <h2>Welcome to Vamsapattika!</h2>

        <p className="welcome-subtitle">
          Build your comprehensive family tree in one place
        </p>

        <div className="welcome-features">
          <div className="welcome-feature">
            <span className="feature-emoji">📊</span>
            <div>
              <h4>One Tree Per Account</h4>
              <p>Focus on building one detailed family tree with all your relatives</p>
            </div>
          </div>

          <div className="welcome-feature">
            <span className="feature-emoji">👥</span>
            <div>
              <h4>Add Family Members</h4>
              <p>Start with 4 free cards. Upgrade anytime to add more family members</p>
            </div>
          </div>

          <div className="welcome-feature">
            <span className="feature-emoji">🎨</span>
            <div>
              <h4>Customize & Share</h4>
              <p>Add photos, customize colors, and export your tree as PNG or PDF</p>
            </div>
          </div>

          <div className="welcome-feature">
            <span className="feature-emoji">☁️</span>
            <div>
              <h4>Cloud Saved</h4>
              <p>Your family tree is automatically saved and accessible from any device</p>
            </div>
          </div>
        </div>

        <button className="welcome-btn-start" onClick={onClose}>
          Get Started
        </button>

        <p className="welcome-footer">
          Need help? Contact us at <a href="mailto:support@vamsapattika.com">support@vamsapattika.com</a>
        </p>
      </div>
    </div>
  );
};

export default WelcomeModal;
