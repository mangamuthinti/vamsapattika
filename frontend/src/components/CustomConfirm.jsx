import React from 'react';
import ReactDOM from 'react-dom';

const CustomConfirm = ({ isOpen, message, onConfirm, onCancel }) => {
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
      onClick={onCancel}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: '16px 20px',
          maxWidth: '340px',
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
          ⚠️
        </div>
        <div
          style={{
            fontSize: '13px',
            color: '#444',
            marginBottom: '16px',
            lineHeight: '1.5',
            whiteSpace: 'pre-line'
          }}
        >
          {message}
        </div>
        <div
          style={{
            display: 'flex',
            gap: '8px',
            justifyContent: 'center'
          }}
        >
          <button
            onClick={onCancel}
            style={{
              background: '#f5f5f5',
              color: '#666',
              border: '1px solid #ddd',
              borderRadius: '6px',
              padding: '7px 20px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              minWidth: '75px'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#e8e8e8';
              e.target.style.color = '#333';
            }}
            onMouseOut={(e) => {
              e.target.style.background = '#f5f5f5';
              e.target.style.color = '#666';
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '7px 20px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              minWidth: '75px'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #c0392b 0%, #a93226 100%)';
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 12px rgba(231, 76, 60, 0.3)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CustomConfirm;
