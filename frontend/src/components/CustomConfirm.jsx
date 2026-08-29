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
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999999,
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '10px',
          padding: '20px',
          maxWidth: '380px',
          width: '90%',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
          animation: 'slideIn 0.3s ease-out',
          textAlign: 'center'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            fontSize: '36px',
            marginBottom: '12px'
          }}
        >
          ⚠️
        </div>
        <div
          style={{
            fontSize: '14px',
            color: '#333',
            marginBottom: '20px',
            lineHeight: '1.5',
            whiteSpace: 'pre-line'
          }}
        >
          {message}
        </div>
        <div
          style={{
            display: 'flex',
            gap: '10px',
            justifyContent: 'center'
          }}
        >
          <button
            onClick={onCancel}
            style={{
              background: '#f5f5f5',
              color: '#666',
              border: '1px solid #e0e0e0',
              borderRadius: '6px',
              padding: '10px 24px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              minWidth: '90px'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#e0e0e0';
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
              background: 'linear-gradient(135deg, #064468 0%, #005580 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 24px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              minWidth: '90px'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#009444';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 12px rgba(0, 148, 68, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #064468 0%, #005580 100%)';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            OK
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CustomConfirm;
