import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Auth.css';

const PasswordResetPage = () => {
  const navigate = useNavigate();
  const { uid, token } = useParams();
  const { confirmPasswordReset } = useAuth();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      await confirmPasswordReset(uid, token, newPassword);
      setSuccess(true);
      setTimeout(() => {
        navigate('/auth');
      }, 3000);
    } catch (error) {
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Failed to reset password. The link may be invalid or expired.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-left">
          <div className="auth-description">
            <div className="app-hero-text">
              <h1 className="hero-title">Reset Your Password</h1>
            </div>
            <div className="app-mission">
              <p>Create a new password for your Vamsapattika account.</p>
              <p>Make sure it's strong and secure.</p>
            </div>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-box">
            <div className="auth-header">
              <img
                src="/images/logo.jpeg"
                alt="Vamsapattika Logo"
                className="auth-logo-right"
                onClick={() => navigate('/')}
                style={{ cursor: 'pointer' }}
                title="Go to Homepage"
              />
            </div>

            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Set New Password</h2>

            {success ? (
              <div className="success-message" style={{ marginBottom: '20px' }}>
                ✓ Password reset successful! Redirecting to login...
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label>New Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                      minLength="6"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    minLength="6"
                  />
                </div>

                {error && <div className="error-message">{error}</div>}

                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>

                <div style={{ textAlign: 'center', marginTop: '15px' }}>
                  <button
                    type="button"
                    onClick={() => navigate('/auth')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#3498db',
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            )}

            <div className="auth-footer">
              <p className="provegaa-credit">
                Powered by <strong>Provegaa Tech Hub</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetPage;
