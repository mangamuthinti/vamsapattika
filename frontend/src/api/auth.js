import api from './axios';

export const authAPI = {
  // Register new user
  register: async (email, password, displayName, mobileNumber = '') => {
    const response = await api.post('/auth/register/', {
      email,
      password,
      password2: password,
      display_name: displayName,
      mobile_number: mobileNumber,
    });
    return response.data;
  },

  // Login
  login: async (email, password) => {
    const response = await api.post('/auth/login/', {
      email,
      password,
    });
    return response.data;
  },

  // Get current user profile
  getProfile: async () => {
    const response = await api.get('/auth/profile/');
    return response.data;
  },

  // Update profile
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile/update/', profileData);
    return response.data;
  },

  // Change password
  changePassword: async (oldPassword, newPassword) => {
    const response = await api.post('/auth/profile/change-password/', {
      old_password: oldPassword,
      new_password: newPassword,
      new_password2: newPassword,
    });
    return response.data;
  },

  // Refresh token
  refreshToken: async (refreshToken) => {
    const response = await api.post('/auth/token/refresh/', {
      refresh: refreshToken,
    });
    return response.data;
  },
};
