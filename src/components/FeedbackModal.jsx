import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import emailjs from '@emailjs/browser';
import { useAuth } from '../context/AuthContext';
import CustomAlert from './CustomAlert';
import '../styles/FeedbackModal.css';

const FeedbackModal = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertState, setAlertState] = useState({ isOpen: false, message: '' });

  // Auto-fill name and email from logged-in user
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.displayName || '');
      setEmail(currentUser.email || '');
    }
  }, [currentUser]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setFeedback('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rating) {
      setAlertState({ isOpen: true, message: 'Please select a rating' });
      return;
    }

    if (!feedback.trim()) {
      setAlertState({ isOpen: true, message: 'Please write your feedback' });
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Replace these with your EmailJS credentials
      // Get them from https://www.emailjs.com/
      const SERVICE_ID = 'service_m9f0av3';
      const TEMPLATE_ID = 'template_i6e0vwy';
      const PUBLIC_KEY = 'l0b9AbBdPsRpHvZXu';

      const templateParams = {
        user_name: name,
        user_email: email,
        rating: `${rating} stars`,
        feedback: feedback,
        to_email: 'support@vamsapattika.com'
      };

      console.log('Sending feedback:', templateParams);

      // Send email using EmailJS
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        templateParams,
        PUBLIC_KEY
      );

      setAlertState({ isOpen: true, message: 'Thank you for your feedback! We\'ve received your message.' });

      // Reset form (keep name and email from user account)
      setRating(0);
      setFeedback('');
      // Don't close immediately, let alert close do it
    } catch (error) {
      console.error('Error sending feedback:', error);
      setAlertState({ isOpen: true, message: 'Failed to send feedback. Please check EmailJS configuration or try again later.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (e) => {
    // Only close if clicking directly on the overlay, not on child elements
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modal = (
    <div className="feedback-modal-overlay" onClick={handleOverlayClick}>
      <div className="feedback-modal" onClick={(e) => e.stopPropagation()}>
        <div className="feedback-modal-header">
          <h3>Send Feedback</h3>
          <button className="feedback-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="feedback-info">
          <p>
            We'd love to hear from you! Share your thoughts, suggestions, or report issues.
            You can also reach us directly at{' '}
            <a href="mailto:support@vamsapattika.com" style={{ color: '#009444', fontWeight: '600' }}>
              support@vamsapattika.com
            </a>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="feedback-form">
          {/* Star Rating */}
          <div className="feedback-section">
            <label className="feedback-label">Rate your experience *</label>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star ${star <= (hoverRating || rating) ? 'filled' : ''}`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  ★
                </button>
              ))}
              <span className="rating-text">
                {rating > 0 && (
                  rating === 1 ? 'Poor' :
                  rating === 2 ? 'Fair' :
                  rating === 3 ? 'Good' :
                  rating === 4 ? 'Very Good' :
                  'Excellent'
                )}
              </span>
            </div>
          </div>

          {/* Feedback */}
          <div className="feedback-section">
            <label className="feedback-label" htmlFor="feedback">Your Feedback *</label>
            <textarea
              id="feedback"
              className="feedback-textarea"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us what you think..."
              rows={6}
              required
            />
          </div>

          {/* Actions */}
          <div className="feedback-actions">
            <button
              type="button"
              className="feedback-btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="feedback-btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <>
      <CustomAlert
        isOpen={alertState.isOpen}
        message={alertState.message}
        onClose={() => {
          setAlertState({ isOpen: false, message: '' });
          // Close feedback modal after success message
          if (alertState.message.includes('Thank you')) {
            onClose();
          }
        }}
      />
      {ReactDOM.createPortal(modal, document.body)}
    </>
  );
};

export default FeedbackModal;
