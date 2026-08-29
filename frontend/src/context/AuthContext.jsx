import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/auth';
import { treesAPI } from '../api/trees';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      const user = localStorage.getItem('user');

      if (token && user) {
        try {
          // Verify token is still valid by fetching profile
          const profile = await authAPI.getProfile();
          setCurrentUser(profile);
        } catch (error) {
          // Token invalid - clear storage
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          setCurrentUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Sign up new user
  const signup = async (email, password, displayName, mobileNumber = '') => {
    try {
      const data = await authAPI.register(email, password, displayName, mobileNumber);

      // Store tokens
      localStorage.setItem('access_token', data.tokens.access);
      localStorage.setItem('refresh_token', data.tokens.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));

      setCurrentUser(data.user);
      return data.user;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      const data = await authAPI.login(email, password);

      // Store tokens
      localStorage.setItem('access_token', data.tokens.access);
      localStorage.setItem('refresh_token', data.tokens.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));

      setCurrentUser(data.user);
      return data.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    // Clear welcome modal flag so it shows again on next login
    sessionStorage.removeItem('welcomeModalShown');
    setCurrentUser(null);
  };

  // Save family tree data to API
  // Save family tree data to Django backend: (familyData, nextId, treeId, treeName, createdAt, userPlan)
  const saveFamilyTree = useCallback(async (familyData, nextId, treeId, treeName = 'My Vamsapattika', createdAt = null, userPlan = null) => {
    if (!currentUser) return;

    try {
      const treeData = {
        tree_id: treeId || 'default',
        name: treeName,
        family_data: familyData,
        next_id: nextId,
      };

      console.log('💾 Saving tree:', treeId, 'with', Object.keys(familyData).length, 'cards');

      // Try to update first (avoids extra GET request)
      const effectiveTreeId = treeId || 'default';
      try {
        await treesAPI.updateTree(effectiveTreeId, treeData);
        console.log('✅ Tree updated successfully');
      } catch (error) {
        if (error.response?.status === 404) {
          // Tree doesn't exist, create new
          await treesAPI.createTree(treeData);
          console.log('✅ Tree created successfully');
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('❌ Error saving tree:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    }
  }, [currentUser]);

  // Load family tree data from API
  const loadFamilyTree = useCallback(async (treeId = 'default') => {
    if (!currentUser) return null;

    try {
      console.log('📥 Loading tree:', treeId);
      const tree = await treesAPI.getTree(treeId);
      console.log('✅ Tree loaded:', tree);

      return {
        id: tree.tree_id,
        name: tree.name,
        familyData: tree.family_data || {},
        nextId: tree.next_id || 2,
        lastUpdated: tree.last_updated,
        createdAt: tree.created_at,
      };
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('⚠️ Tree not found, will create new');
        return null; // Tree not found
      }
      console.error('❌ Error loading tree:', error);
      throw error;
    }
  }, [currentUser]);

  // Get all trees for current user
  const getAllTrees = async () => {
    if (!currentUser) {
      console.log('getAllTrees: No current user');
      return [];
    }

    try {
      const response = await treesAPI.getAllTrees();
      const trees = response.results || response;

      return trees.map((tree) => ({
        id: tree.tree_id,
        name: tree.name,
        lastUpdated: tree.last_updated,
        createdAt: tree.created_at,
        cardCount: tree.card_count,
      }));
    } catch (error) {
      console.error('Error fetching trees:', error);
      return [];
    }
  };

  // Create new tree
  const createNewTree = async (treeName) => {
    if (!currentUser) {
      console.error('Cannot create tree: No current user');
      return null;
    }

    try {
      const treeId = `tree_${Date.now()}`;
      const initialData = {
        1: {
          id: 1,
          name: 'Enter Name',
          gender: 'male',
          birthDate: '',
          deathDate: '',
          occupation: 'Enter Occupation',
          level: 1,
          photo: null,
          photoShape: 'circle',
          shape: 'rounded',
          customColors: {},
          textStyles: {},
          link: null,
          children: [],
          spouse: null,
          parent: null,
          marriageDate: null,
          coupleLabel: 'Couple',
          coupleBoxStyle: {
            borderColor: 'rgba(250, 112, 154, 0.4)',
            backgroundColor: 'rgba(250, 112, 154, 0.1)',
            borderThickness: 4,
          },
        },
      };

      const tree = await treesAPI.createTree({
        tree_id: treeId,
        name: treeName,
        family_data: initialData,
        next_id: 2,
      });

      console.log('Tree created successfully:', tree);
      return tree.tree_id;
    } catch (error) {
      console.error('Error creating tree:', error);
      throw error;
    }
  };

  // Delete tree
  const deleteTree = async (treeId) => {
    if (!currentUser || treeId === 'default') return;

    try {
      await treesAPI.deleteTree(treeId);
      console.log('Tree deleted successfully');
    } catch (error) {
      console.error('Error deleting tree:', error);
      throw error;
    }
  };

  // Rename tree
  const renameTree = async (treeId, newName) => {
    if (!currentUser) {
      console.error('Cannot rename tree: No current user');
      return;
    }

    try {
      const tree = await treesAPI.getTree(treeId);
      await treesAPI.updateTree(treeId, {
        tree_id: tree.tree_id,
        name: newName,
        family_data: tree.family_data,
        next_id: tree.next_id,
      });
      console.log('Tree renamed successfully');
    } catch (error) {
      console.error('Error renaming tree:', error);
      throw error;
    }
  };

  // Get user profile
  const getUserProfile = async () => {
    try {
      const profile = await authAPI.getProfile();
      // Convert snake_case from API to camelCase for frontend
      return {
        displayName: profile.display_name,
        firstName: profile.first_name,
        lastName: profile.last_name,
        mobileNumber: profile.mobile_number,
        email: profile.email,
        dateOfBirth: profile.date_of_birth,
        address: profile.address,
        city: profile.city,
        state: profile.state,
        country: profile.country,
        pincode: profile.pincode,
      };
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  // Update user profile
  const updateUserProfile = async (profileData) => {
    if (!currentUser) return;

    try {
      // Convert camelCase to snake_case for Django API
      const snakeCaseData = {
        display_name: profileData.displayName,
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        mobile_number: profileData.mobileNumber,
        // Convert empty string to null for date fields (Django requirement)
        date_of_birth: profileData.dateOfBirth || null,
        address: profileData.address,
        city: profileData.city,
        state: profileData.state,
        country: profileData.country,
        pincode: profileData.pincode,
      };

      const updatedProfile = await authAPI.updateProfile(snakeCaseData);
      setCurrentUser(updatedProfile);
      localStorage.setItem('user', JSON.stringify(updatedProfile));
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  // Reset password (placeholder - needs email implementation)
  const resetPassword = async (email) => {
    throw new Error('Password reset not yet implemented with Django backend');
  };

  const value = {
    currentUser,
    signup,
    login,
    logout,
    resetPassword,
    saveFamilyTree,
    loadFamilyTree,
    getAllTrees,
    createNewTree,
    deleteTree,
    renameTree,
    getUserProfile,
    updateUserProfile,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
