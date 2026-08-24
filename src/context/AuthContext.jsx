import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { ref, set, get, update } from 'firebase/database';
import { auth, database } from '../firebase/config';

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

  // Sign up new user
  const signup = async (email, password, displayName) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update profile with display name
    await updateProfile(user, { displayName });

    // Create user profile in database (users table)
    await set(ref(database, `users/${user.uid}`), {
      uid: user.uid,
      email: user.email,
      displayName: displayName,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    });

    // Initialize empty family tree (familyTrees table)
    await set(ref(database, `familyTrees/${user.uid}/default`), {
      id: 'default',
      name: 'My Vamsapattika',
      familyData: {
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
          shape: 'apple',
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
            borderThickness: 4
          }
        }
      },
      nextId: 2,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    });

    return user;
  };

  // Login user
  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update last login in users table
    await update(ref(database, `users/${user.uid}`), {
      lastLogin: new Date().toISOString()
    });

    return user;
  };

  // Google Sign-In
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    // Check if user exists in database
    const userSnapshot = await get(ref(database, `users/${user.uid}`));

    if (!userSnapshot.exists()) {
      // New user - create profile in database
      await set(ref(database, `users/${user.uid}`), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || 'Google User',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      });

      // Initialize empty family tree
      await set(ref(database, `familyTrees/${user.uid}/default`), {
        id: 'default',
        name: 'My Vamsapattika',
        familyData: {
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
            shape: 'apple',
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
              borderThickness: 4
            }
          }
        },
        nextId: 2,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      });
    } else {
      // Existing user - update last login
      await update(ref(database, `users/${user.uid}`), {
        lastLogin: new Date().toISOString()
      });
    }

    return user;
  };

  // Logout user
  const logout = () => {
    return signOut(auth);
  };

  // Save family tree data to database
  const saveFamilyTree = async (familyData, nextId, treeId = 'default', treeName = 'My Vamsapattika', createdAt = null, userPlan = null) => {
    if (!currentUser) return;

    // Fetch existing tree to preserve createdAt if not provided
    let finalCreatedAt = createdAt;
    if (!finalCreatedAt) {
      try {
        const existingSnapshot = await get(ref(database, `familyTrees/${currentUser.uid}/${treeId}`));
        if (existingSnapshot.exists() && existingSnapshot.val().createdAt) {
          finalCreatedAt = existingSnapshot.val().createdAt;
        } else {
          finalCreatedAt = new Date().toISOString();
        }
      } catch (error) {
        console.error('Error fetching existing tree:', error);
        finalCreatedAt = new Date().toISOString();
      }
    }

    const treeData = {
      id: treeId,
      name: treeName,
      familyData: familyData,
      nextId: nextId,
      userPlan: userPlan || { maxCards: 4, price: 0, name: 'Free' },
      createdAt: finalCreatedAt,
      lastUpdated: new Date().toISOString()
    };

    console.log('Saving tree to Firebase:', treeId, treeData);
    await set(ref(database, `familyTrees/${currentUser.uid}/${treeId}`), treeData);
    console.log('Tree saved successfully');
  };

  // Load family tree data from database
  const loadFamilyTree = async (treeId = 'default') => {
    if (!currentUser) return null;

    const snapshot = await get(ref(database, `familyTrees/${currentUser.uid}/${treeId}`));
    if (snapshot.exists()) {
      return snapshot.val();
    }

    // If specific tree not found and it's the default tree, try loading old format
    if (treeId === 'default') {
      const oldSnapshot = await get(ref(database, `familyTrees/${currentUser.uid}`));
      if (oldSnapshot.exists()) {
        const oldData = oldSnapshot.val();
        // Check if this is old format (has familyData directly)
        if (oldData.familyData && !oldData.id) {
          return {
            id: 'default',
            name: 'My Vamsapattika',
            familyData: oldData.familyData,
            nextId: oldData.nextId || 2,
            lastUpdated: oldData.lastUpdated || new Date().toISOString()
          };
        }
      }
    }

    return null;
  };

  // Get all trees for current user
  const getAllTrees = async () => {
    if (!currentUser) {
      console.log('getAllTrees: No current user');
      return [];
    }

    console.log('getAllTrees: Fetching trees for user:', currentUser.uid);
    const snapshot = await get(ref(database, `familyTrees/${currentUser.uid}`));

    if (snapshot.exists()) {
      const trees = snapshot.val();
      console.log('getAllTrees: Raw data from Firebase:', trees);
      console.log('getAllTrees: Tree keys:', Object.keys(trees));

      // Check if we have any tree_* keys (new format)
      const treeKeys = Object.keys(trees).filter(key => key.startsWith('tree_') || key === 'default');
      console.log('getAllTrees: Valid tree keys:', treeKeys);

      // If we have tree_* keys, use the new format (ignore old flat structure)
      if (treeKeys.length > 0) {
        console.log('getAllTrees: Using new format with', treeKeys.length, 'trees');

        const allTrees = treeKeys
          .map(key => trees[key])
          .filter(tree => tree && typeof tree === 'object' && tree.id) // Filter out invalid entries
          .map(tree => ({
            id: tree.id,
            name: tree.name || 'My Vamsapattika',
            lastUpdated: tree.lastUpdated || new Date().toISOString(),
            createdAt: tree.createdAt || new Date().toISOString()
          }));

        console.log('getAllTrees: Returning trees:', allTrees);
        return allTrees;
      }

      // Pure old format (no tree_* keys at all) - migrate
      if (trees.familyData && !trees.id) {
        console.log('getAllTrees: Detected pure old format, migrating...');
        // Old format - migrate to new format
        await set(ref(database, `familyTrees/${currentUser.uid}/default`), {
          id: 'default',
          name: 'My Vamsapattika',
          familyData: trees.familyData,
          nextId: trees.nextId || 2,
          createdAt: new Date().toISOString(),
          lastUpdated: trees.lastUpdated || new Date().toISOString()
        });

        // Return the migrated tree
        return [{
          id: 'default',
          name: 'My Vamsapattika',
          lastUpdated: trees.lastUpdated || new Date().toISOString(),
          createdAt: new Date().toISOString()
        }];
      }

      console.log('getAllTrees: Unknown format');
      return [];
    }

    console.log('getAllTrees: No data found in Firebase');
    return [];
  };

  // Create new tree
  const createNewTree = async (treeName) => {
    if (!currentUser) {
      console.error('Cannot create tree: No current user');
      return null;
    }

    const treeId = `tree_${Date.now()}`;
    console.log('Creating new tree with ID:', treeId, 'Name:', treeName);
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
        shape: 'apple',
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
          borderThickness: 4
        }
      }
    };

    try {
      await set(ref(database, `familyTrees/${currentUser.uid}/${treeId}`), {
        id: treeId,
        name: treeName,
        familyData: initialData,
        nextId: 2,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      });

      console.log('Tree created successfully in Firebase');
      return treeId;
    } catch (error) {
      console.error('Error creating tree in Firebase:', error);
      throw error;
    }
  };

  // Delete tree
  const deleteTree = async (treeId) => {
    if (!currentUser || treeId === 'default') return;

    await set(ref(database, `familyTrees/${currentUser.uid}/${treeId}`), null);
  };

  // Rename tree
  const renameTree = async (treeId, newName) => {
    if (!currentUser) {
      console.error('Cannot rename tree: No current user');
      return;
    }

    console.log('Renaming tree:', treeId, 'to:', newName);
    try {
      await update(ref(database, `familyTrees/${currentUser.uid}/${treeId}`), {
        name: newName,
        lastUpdated: new Date().toISOString()
      });
      console.log('Tree renamed successfully');
    } catch (error) {
      console.error('Error renaming tree:', error);
      throw error;
    }
  };

  // Get user profile
  const getUserProfile = async (uid) => {
    const snapshot = await get(ref(database, `users/${uid || currentUser.uid}`));
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  };

  // Update user profile
  const updateUserProfile = async (profileData) => {
    if (!currentUser) return;

    // Update Firebase Auth displayName if changed
    if (profileData.displayName && profileData.displayName !== currentUser.displayName) {
      await updateProfile(currentUser, { displayName: profileData.displayName });
    }

    // Update user profile in database
    await update(ref(database, `users/${currentUser.uid}`), {
      ...profileData,
      updatedAt: new Date().toISOString()
    });

    return true;
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    signInWithGoogle,
    logout,
    saveFamilyTree,
    loadFamilyTree,
    getAllTrees,
    createNewTree,
    deleteTree,
    renameTree,
    getUserProfile,
    updateUserProfile,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
