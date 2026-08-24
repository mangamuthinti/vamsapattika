import React from 'react';

const Footer = () => {
  return (
    <div className="footer-disclaimer">
      <span className="disclaimer-icon">ℹ️</span>
      <span className="disclaimer-text">
        <strong>Important:</strong> Your Vamsapattika data is saved locally in your browser only.
        Please export your tree regularly to avoid losing your work. Data may be lost if you clear
        browser cache or switch devices.
      </span>
    </div>
  );
};

export default Footer;
