import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/Profile.css';
import CustomAlert from './CustomAlert';

const Profile = ({ isOpen, onClose }) => {
  const { currentUser, getUserProfile, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [alertState, setAlertState] = useState({ isOpen: false, message: '', isSuccess: false });

  // Form states
  const [formData, setFormData] = useState({
    displayName: '',
    firstName: '',
    lastName: '',
    mobileNumber: '',
    email: '',
    dateOfBirth: '',
    address: '',
    city: '',
    state: '',
    country: '',
    pincode: ''
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (currentUser) {
        setLoadingProfile(true);
        try {
          const profile = await getUserProfile();

          if (profile) {
            setFormData({
              displayName: profile.displayName || currentUser.displayName || '',
              firstName: profile.firstName || '',
              lastName: profile.lastName || '',
              mobileNumber: profile.mobileNumber || currentUser.phoneNumber || '',
              email: profile.email || currentUser.email || '',
              dateOfBirth: profile.dateOfBirth || '',
              address: profile.address || '',
              city: profile.city || '',
              state: profile.state || '',
              country: profile.country || '',
              pincode: profile.pincode || ''
            });
          } else {
            // If no profile exists yet, initialize with current user data
            const nameParts = currentUser.displayName?.split(' ') || [''];
            setFormData({
              displayName: currentUser.displayName || '',
              firstName: nameParts[0] || '',
              lastName: nameParts.slice(1).join(' ') || '',
              mobileNumber: currentUser.phoneNumber || '',
              email: currentUser.email || '',
              dateOfBirth: '',
              address: '',
              city: '',
              state: '',
              country: '',
              pincode: ''
            });
          }
        } catch (error) {
          console.error('Error loading profile:', error);
        } finally {
          setLoadingProfile(false);
        }
      }
    };

    loadProfile();
  }, [currentUser, getUserProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update user profile in Firebase
      await updateUserProfile(formData);

      setAlertState({
        isOpen: true,
        message: 'Profile updated successfully!',
        isSuccess: true
      });
    } catch (error) {
      setAlertState({
        isOpen: true,
        message: 'Error updating profile: ' + error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onClose(); // Close the profile modal
  };

  if (!isOpen) return null;

  return (
    <>
      <CustomAlert
        isOpen={alertState.isOpen}
        message={alertState.message}
        onClose={() => {
          setAlertState({ isOpen: false, message: '', isSuccess: false });
          if (alertState.isSuccess) {
            onClose(); // Close the profile modal as well
          }
        }}
      />

      <div className="profile-modal-overlay">
        <div className="profile-container">
        <div className="profile-card">
          <button className="profile-modal-close" onClick={onClose}>×</button>

          {loadingProfile ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <p>Loading profile...</p>
            </div>
          ) : (
            <>

          <div className="profile-header">
            <div className="profile-header-info">
              <h1>{formData.displayName || 'User Profile'}</h1>
              <p>{formData.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="profile-section">
              <h2>Personal Information</h2>

              <div className="form-row">
                <div className="form-group">
                  <label>Username / Display Name</label>
                  <input
                    type="text"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={true}
                    title="Email cannot be changed"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Mobile Number</label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    pattern="[0-9]{10}"
                  />
                </div>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="profile-section">
              <h2>Address Information</h2>

              <div className="form-row">
                <div className="form-group full-width">
                  <label>Street Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Country</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    pattern="[0-9]{6}"
                  />
                </div>
              </div>
            </div>

            <div className="profile-actions">
              <button type="submit" className="btn-save" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" className="btn-cancel" onClick={handleCancel} disabled={loading}>
                Cancel
              </button>
            </div>
          </form>
          </>
          )}
        </div>
      </div>
      </div>
    </>
  );
};

export default Profile;
