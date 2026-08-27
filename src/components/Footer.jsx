import React from 'react';

const Footer = () => {
  return (
    <div className="footer-disclaimer">
      <span className="disclaimer-icon">ℹ️</span>
      <span className="disclaimer-text">
        <strong>Important:</strong> Your Vamsapattika data is securely saved to your cloud account.
        Each account has one comprehensive family tree - upgrade your plan to add more family members.
        We recommend exporting your tree regularly as a backup.
        All paid packages are valid for 1 year and require renewal.
        {' '}|{' '}
        <strong>Need help?</strong> Contact us at{' '}
        <a
          href="mailto:support@vamsapattika.com"
          style={{
            color: 'white',
            textDecoration: 'underline',
            fontWeight: '600'
          }}
        >
          support@vamsapattika.com
        </a>
      </span>
    </div>
  );
};

export default Footer;
