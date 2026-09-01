import React from 'react';
import ReactDOM from 'react-dom';

const CustomAlert = ({ isOpen, message, onClose }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999999,
        animation: 'fadeIn 0.2s ease-out',
        backdropFilter: 'blur(2px)'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: '16px 20px',
          maxWidth: '320px',
          width: '90%',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
          animation: 'slideIn 0.25s ease-out',
          textAlign: 'center'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            fontSize: '28px',
            marginBottom: '8px'
          }}
        >
          ℹ️
        </div>
        <div
          style={{
            fontSize: '13px',
            color: '#444',
            marginBottom: '14px',
            lineHeight: '1.5'
          }}
        >
          {message}
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'linear-gradient(135deg, #4a90e2 0%, #357abd 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 24px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            minWidth: '80px'
          }}
          onMouseOver={(e) => {
            e.target.style.background = 'linear-gradient(135deg, #357abd 0%, #2868a8 100%)';
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = '0 4px 12px rgba(74, 144, 226, 0.3)';
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'linear-gradient(135deg, #4a90e2 0%, #357abd 100%)';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          OK
        </button>
      </div>
    </div>,
    document.body
  );
};

export default CustomAlert;
