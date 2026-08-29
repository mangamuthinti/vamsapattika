import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const { signup, login, resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!displayName) {
          setError('Please enter your name');
          setLoading(false);
          return;
        }
        if (!mobileNumber || mobileNumber.length !== 10) {
          setError('Please enter a valid 10-digit mobile number');
          setLoading(false);
          return;
        }
        await signup(email, password, displayName, mobileNumber);
      }
    } catch (error) {
      // Handle Django API validation errors
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'object') {
          // Extract first error message from any field
          const firstError = Object.values(errorData)[0];
          setError(Array.isArray(firstError) ? firstError[0] : firstError);
        } else {
          setError(errorData);
        }
      } else {
        setError(error.message || 'An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await resetPassword(resetEmail);
      setResetSuccess(true);
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetSuccess(false);
        setResetEmail('');
      }, 3000);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        {/* Left Side - App Description */}
        <div className="auth-left">
          <div className="auth-description">
            <div className="app-hero-text">
              <h1 className="hero-title">Every family has a story.</h1>
              <h1 className="hero-title">Every story deserves to be remembered.</h1>
            </div>

            <div className="app-mission">
              <p>Discover your roots.</p>
              <p>Preserve your memories.</p>
              <p>Pass your legacy from one generation to the next.</p>
            </div>

            <div className="app-features">
              <div className="feature-item">
                <div className="feature-icon">🌳</div>
                <div className="feature-content">
                  <h3>Build Your Family Tree</h3>
                  <p>Create a beautiful visual representation of your family history with unlimited members</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">📸</div>
                <div className="feature-content">
                  <h3>Add Photos & Memories</h3>
                  <p>Preserve precious moments by adding photos and stories to each family member</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">🎨</div>
                <div className="feature-content">
                  <h3>Customize Everything</h3>
                  <p>Personalize your family tree with colors, shapes, and styles that reflect your heritage</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">💾</div>
                <div className="feature-content">
                  <h3>Export & Share</h3>
                  <p>Download your family tree as PNG or PDF, and share it with loved ones</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
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

            <div className="auth-tabs">
              <button
                className={isLogin ? 'active' : ''}
                onClick={() => {
                  setIsLogin(true);
                  setError('');
                }}
              >
                Login
              </button>
              <button
                className={!isLogin ? 'active' : ''}
                onClick={() => {
                  setIsLogin(false);
                  setError('');
                }}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {!isLogin && (
                <>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your name"
                      required={!isLogin}
                    />
                  </div>

                  <div className="form-group">
                    <label>Mobile Number</label>
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="Enter your mobile number"
                      pattern="[0-9]{10}"
                      title="Please enter a valid 10-digit mobile number"
                      required={!isLogin}
                    />
                  </div>
                </>
              )}

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
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
                {isLogin && (
                  <button
                    type="button"
                    className="forgot-password-link"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    Forgot Password?
                  </button>
                )}
              </div>

              {error && <div className="error-message">{error}</div>}

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Sign Up')}
              </button>
            </form>

            <div className="auth-footer">
              <p className="provegaa-credit">
                Powered by <strong>Provegaa Tech Hub</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="modal-overlay" onClick={() => setShowForgotPassword(false)}>
          <div className="forgot-password-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setShowForgotPassword(false)}
            >
              ×
            </button>

            <h2>Reset Password</h2>
            <p>Enter your email address and we'll send you a link to reset your password.</p>

            {resetSuccess ? (
              <div className="success-message">
                ✓ Password reset email sent! Please check your inbox.
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="forgot-password-form">
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="modal-buttons">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setShowForgotPassword(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-submit"
                    disabled={loading}
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Auth;
