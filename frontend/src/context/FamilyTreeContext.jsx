import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useAlert } from './AlertContext';

const FamilyTreeContext = createContext();

export const useFamilyTree = () => {
  const context = useContext(FamilyTreeContext);
  if (!context) {
    throw new Error('useFamilyTree must be used within FamilyTreeProvider');
  }
  return context;
};

// Empty initial data for new users - they'll click "Start your Vamsapattika" button
const initialFamilyData = {};

export const FamilyTreeProvider = ({ children }) => {
  const { currentUser, loadFamilyTree, saveFamilyTree } = useAuth();
  const { showAlert } = useAlert();
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTreeId, setCurrentTreeId] = useState('default');
  const [currentTreeName, setCurrentTreeName] = useState('My Vamsapattika');
  const [currentTreeCreatedAt, setCurrentTreeCreatedAt] = useState(null);

  // Reset dataLoaded when user changes (fixes stuck loading for new users)
  useEffect(() => {
    if (currentUser) {
      setDataLoaded(false); // Force reload for this user
    }
  }, [currentUser?.email]); // Only reset when actual user changes

  // Initialize with default data (will be replaced by Backend data)
  const [nextId, setNextId] = useState(1); // Start from 1 since no initial card
  const [familyData, setFamilyData] = useState(initialFamilyData);

  // Consolidate children to primary parent (one with lower ID)
  const consolidateChildrenToPrimary = React.useCallback((data) => {
    if (!data || Object.keys(data).length === 0) return data;

    const updated = { ...data };
    let consolidationCount = 0;

    Object.values(updated).forEach(person => {
      if (person && person.spouse && updated[person.spouse]) {
        const spouse = updated[person.spouse];

        // Find primary parent (lower ID)
        const primaryId = person.id < spouse.id ? person.id : spouse.id;
        const secondaryId = person.id < spouse.id ? spouse.id : person.id;

        const primaryParent = updated[primaryId];
        const secondaryParent = updated[secondaryId];

        // Collect all unique children from both parents
        const primaryChildren = Array.isArray(primaryParent.children) ? primaryParent.children : [];
        const secondaryChildren = Array.isArray(secondaryParent.children) ? secondaryParent.children : [];

        if (secondaryChildren.length > 0) {
          // Merge children, maintaining order (primary first, then secondary)
          const allChildren = [...new Set([...primaryChildren, ...secondaryChildren])];

          // Update primary parent with all children
          updated[primaryId] = {
            ...primaryParent,
            children: allChildren
          };

          // Clear secondary parent's children
          updated[secondaryId] = {
            ...secondaryParent,
            children: []
          };

          consolidationCount++;
          console.log(`✅ Consolidated ${secondaryChildren.length} children from person ${secondaryId} to primary parent ${primaryId}`);
        }
      }
    });

    if (consolidationCount > 0) {
      console.log(`✅ Consolidated children for ${consolidationCount} couples`);
    }

    return updated;
  }, []);

  // Clean orphaned cards - removes cards not reachable from root
  const cleanOrphanedCardsFunc = React.useCallback((data) => {
    if (!data || Object.keys(data).length === 0) return data;

    // Find root person (level 1, no parent)
    const root = Object.values(data).find(p => p && p.level === 1 && !p.parent);
    if (!root) {
      console.log('ℹ️ No root person found - tree is empty or has no valid root');
      return {}; // Return empty tree if no root
    }

    // Recursively collect all reachable IDs from root
    const reachableIds = new Set();
    const traverse = (personId) => {
      if (!personId || reachableIds.has(personId)) return;
      reachableIds.add(personId);

      const person = data[personId];
      if (!person) return;

      // Add spouse
      if (person.spouse) {
        traverse(person.spouse);
      }

      // Add all children
      if (Array.isArray(person.children)) {
        person.children.forEach(childId => traverse(childId));
      }
    };

    traverse(root.id);

    // Remove orphaned cards
    const cleaned = {};
    let orphanedCount = 0;
    Object.keys(data).forEach(id => {
      if (reachableIds.has(parseInt(id))) {
        cleaned[id] = data[id];
      } else {
        orphanedCount++;
        console.warn(`🗑️ Removing orphaned card: ${id} (${data[id]?.name})`);
      }
    });

    if (orphanedCount > 0) {
      console.log(`✅ Cleaned ${orphanedCount} orphaned cards. Before: ${Object.keys(data).length}, After: ${Object.keys(cleaned).length}`);
    }

    return cleaned;
  }, []);

  // Load data from Backend when user logs in or switches tree
  useEffect(() => {
    const loadUserData = async () => {
      if (currentUser && !dataLoaded) {
        console.log('🔄 Loading family tree data for user:', currentUser.email);
        setIsLoading(true);

        // Add timeout to prevent infinite loading
        const loadTimeout = setTimeout(() => {
          console.warn('⏱️ Family tree load timeout - using empty tree');
          setFamilyData(initialFamilyData); // Empty
          setNextId(1);
          setDataLoaded(true);
          setIsLoading(false);
        }, 10000); // 10 second timeout

        try {
          const backendData = await loadFamilyTree(currentTreeId);
          clearTimeout(loadTimeout); // Clear timeout on success

          if (backendData && backendData.familyData) {
            console.log('✅ Loaded data from Backend:', backendData);

            // Convert array to object if needed (bug fix)
            let cleanedData = backendData.familyData;
            if (Array.isArray(backendData.familyData)) {
              console.warn('⚠️ familyData is an array, converting to object...');
              cleanedData = {};
              backendData.familyData.forEach((person, index) => {
                if (person && person.id) {
                  cleanedData[person.id] = person;
                }
              });
              console.log('✅ Converted to object with', Object.keys(cleanedData).length, 'cards:', cleanedData);
            }

            // Consolidate children to primary parent first
            cleanedData = consolidateChildrenToPrimary(cleanedData);

            // Clean orphaned cards that are not reachable from root
            cleanedData = cleanOrphanedCardsFunc(cleanedData);

            setFamilyData(cleanedData);
            setNextId(backendData.nextId || 1);
            setCurrentTreeName(backendData.name || 'My Vamsapattika');
            setCurrentTreeCreatedAt(backendData.createdAt || new Date().toISOString());

            // Note: userPlan is now loaded from backend subscription API (separate useEffect below), not from tree data
          } else {
            // No data in Backend, use initial data (empty for new users)
            console.log('ℹ️ No data in Backend, starting with empty tree for new user');
            setFamilyData(initialFamilyData); // Empty object
            setNextId(1);
          }
          setDataLoaded(true);
          setIsLoading(false);
        } catch (error) {
          clearTimeout(loadTimeout);
          console.error('❌ Error loading data from Backend:', error);
          // On error, use initial data (empty)
          setFamilyData(initialFamilyData);
          setNextId(1);
          setDataLoaded(true);
          setIsLoading(false);
        }
      } else if (!currentUser) {
        // No user logged in, stop loading
        console.log('ℹ️ No user logged in');
        setIsLoading(false);
      } else if (dataLoaded) {
        // Data already loaded
        setIsLoading(false);
      }
    };

    loadUserData();
  // Only reload when currentUser or currentTreeId changes, NOT on every loadFamilyTree reference change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, dataLoaded, currentTreeId]);

  const [globalShowPhotos, setGlobalShowPhotos] = useState(true);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: 'add', // 'add', 'edit', 'spouse'
    parentId: null
  });

  // Text toolbar state - shared across all PersonCards
  const [textToolbarState, setTextToolbarState] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    personId: null,
    field: null
  });

  // Payment/Plan state - Start with default Free plan
  const [userPlan, setUserPlan] = useState({
    maxCards: 4,
    price: 0,
    name: 'Free',
    purchaseDate: null,
    expiryDate: null,
    loaded: false
  });
  const [planLoading, setPlanLoading] = useState(true);

  const [showPricingModal, setShowPricingModal] = useState(false);

  // Function to fetch subscription - can be called manually or automatically
  const fetchSubscription = React.useCallback(async (force = false) => {
    if (!currentUser) {
      console.log('⚠️ No user logged in - setting default Free plan');
      setUserPlan({
        maxCards: 4,
        price: 0,
        name: 'Free',
        purchaseDate: null,
        expiryDate: null,
        loaded: true
      });
      setPlanLoading(false);
      return;
    }

    console.log('🔄 Fetching subscription for user:', currentUser.email, '(force:', force, ')');

      // Set a 5-second timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.warn('⏱️ Subscription fetch timeout after 5 seconds - using Free plan');
        setUserPlan({
          maxCards: 4,
          price: 0,
          name: 'Free',
          purchaseDate: null,
          expiryDate: null,
          loaded: true
        });
        setPlanLoading(false);
      }, 5000);

      try {
        setPlanLoading(true);
        const { paymentsAPI } = await import('../api/payments');
        const subscriptionData = await paymentsAPI.getSubscription();
        clearTimeout(timeoutId); // Clear timeout on success

        console.log('📦 Fetched subscription from backend:', subscriptionData);

        if (subscriptionData && subscriptionData.plan_details) {
          const max_cards = subscriptionData.plan_details.max_cards;
          console.log('📊 Plan max_cards from backend:', max_cards, 'type:', typeof max_cards);

          const newPlan = {
            maxCards: max_cards === 999999 || max_cards >= 999999 ? Infinity : parseInt(max_cards),
            price: parseFloat(subscriptionData.plan_details.price),
            name: subscriptionData.plan_details.display_name,
            purchaseDate: subscriptionData.purchase_date,
            expiryDate: subscriptionData.expiry_date,
            loaded: true
          };
          console.log('✅ Setting user plan to:', newPlan);
          console.log('✅ maxCards is Infinity?', newPlan.maxCards === Infinity);
          setUserPlan(newPlan);
        } else {
          console.log('ℹ️ No subscription found - using Free plan');
          // No subscription found - set Free plan as default
          setUserPlan({
            maxCards: 4,
            price: 0,
            name: 'Free',
            purchaseDate: null,
            expiryDate: null,
            loaded: true
          });
        }
      } catch (error) {
        clearTimeout(timeoutId); // Clear timeout on error
        console.error('❌ Error fetching subscription:', error);
        console.error('Error details:', error.message);
        // Set Free plan as default on error
        setUserPlan({
          maxCards: 4,
          price: 0,
          name: 'Free',
          purchaseDate: null,
          expiryDate: null,
          loaded: true
        });
    } finally {
      console.log('✅ Subscription fetch complete - setting planLoading to FALSE');
      setPlanLoading(false);
    }
  }, [currentUser]);

  // Fetch subscription data from backend when user logs in
  useEffect(() => {
    if (currentUser) {
      console.log('🔄 User logged in, fetching subscription...');
      // Always fetch fresh subscription data
      fetchSubscription(true); // Force refresh
    } else {
      // No user, ensure loading is stopped
      setPlanLoading(false);
    }
  }, [currentUser, fetchSubscription]); // Refetch when user changes or logs in

  // Save familyData, nextId, and userPlan to API with debounce (prevents race conditions)
  useEffect(() => {
    try {
      // Ensure familyData is an object, not an array
      if (Array.isArray(familyData)) {
        console.error('familyData is an array! Converting to object before save...');
        const converted = {};
        familyData.forEach((person) => {
          if (person && person.id) {
            converted[person.id] = person;
          }
        });
        setFamilyData(converted);
        return; // Don't save until converted
      }

      // Debounce saves to prevent race conditions (wait 1 second after last change)
      if (currentUser && dataLoaded) {
        const saveTimer = setTimeout(() => {
          console.log('⏱️ Debounce complete - saving now with familyData:', Object.keys(familyData).map(id => `${id}: ${familyData[id].name}`));
          saveFamilyTree(familyData, nextId, currentTreeId, currentTreeName, currentTreeCreatedAt, userPlan).catch(error => {
            console.error('Error saving to API:', error);
          });
        }, 1000); // Increased to 1 second

        // Cleanup: cancel pending save if data changes again
        return () => {
          console.log('🚫 Save cancelled - data changed again');
          clearTimeout(saveTimer);
        };
      }
    } catch (error) {
      console.error('Error saving data:', error);
    }
    // CRITICAL: Only depend on the DATA, not the functions
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [familyData, nextId, currentUser, dataLoaded, currentTreeId, currentTreeName, currentTreeCreatedAt]);

  // Check if user can add more cards
  const canAddCard = () => {
    const currentCardCount = Object.keys(familyData).length;
    console.log('🔍 canAddCard check:', {
      currentCardCount,
      maxCards: userPlan.maxCards,
      canAdd: currentCardCount < userPlan.maxCards,
      allCardIds: Object.keys(familyData),
      cardNames: Object.keys(familyData).map(id => `${id}:${familyData[id]?.name}`)
    });
    // Unlimited plans (Infinity or 999999) always allow adding
    if (userPlan.maxCards === Infinity || userPlan.maxCards >= 999999) {
      return true;
    }
    return currentCardCount < userPlan.maxCards;
  };

  // Upgrade user plan
  const upgradePlan = async (maxCards, price) => {
    const tierName =
      maxCards === 4 ? 'Free' :
      maxCards === 10 ? 'Silver' :
      maxCards === 18 ? 'Gold' :
      'Diamond';

    const purchaseDate = new Date().toISOString();
    const expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(); // 1 year from now

    const newPlan = {
      maxCards,
      price,
      name: tierName,
      purchaseDate,
      expiryDate
    };
    console.log('🔄 Upgrading plan to:', newPlan);
    console.log('📋 Plan details - maxCards:', maxCards, 'isInfinity:', maxCards === Infinity);
    console.log('📅 Purchase Date:', purchaseDate);
    console.log('📅 Expiry Date:', expiryDate);
    setUserPlan(newPlan);

    // Explicitly save to Backend immediately
    if (currentUser) {
      console.log('💾 Saving plan update to Backend immediately...');
      try {
        await saveFamilyTree(familyData, nextId, currentTreeId, currentTreeName, currentTreeCreatedAt, newPlan);
        console.log('✅ Plan saved successfully to Backend');
      } catch (error) {
        console.error('❌ Error saving plan to Backend:', error);
        throw error;
      }
    }
  };

  // Add a new person
  const addPerson = (personData, parentId = null, isSpouse = false) => {
    // Check if user has reached the limit
    const currentCardCount = Object.keys(familyData).length;

    console.log('➕ Adding person:', {
      currentCardCount,
      maxCards: userPlan.maxCards,
      nextId,
      personData
    });

    // Trigger pricing modal at specific thresholds
    if (!canAddCard()) {
      console.log('❌ Card limit reached! Showing pricing modal');
      setShowPricingModal(true);
      return null;
    }

    const newId = nextId;
    const parent = parentId ? familyData[parentId] : null;
    const level = parent ? parent.level + 1 : 1;

    const newPerson = {
      id: newId,
      name: personData.name,
      gender: personData.gender,
      birthDate: personData.birthDate || '',
      deathDate: personData.deathDate || '',
      occupation: personData.occupation || '',
      level: level,
      photo: personData.photo || null,
      photoShape: personData.photoShape || 'circle',
      shape: personData.shape || 'rounded',
      customColors: {},
      textStyles: {},
      link: null,
      children: [],
      spouse: null,
      parent: parentId,
      marriageDate: null,
      coupleLabel: 'Couple',
      coupleBoxStyle: {
        borderColor: 'rgba(250, 112, 154, 0.4)',
        backgroundColor: 'rgba(250, 112, 154, 0.1)',
        borderThickness: 4
      }
    };

    setFamilyData(prev => {
      const updated = { ...prev, [newId]: newPerson };

      if (isSpouse && parent) {
        // Store marriage date on the primary person (not spouse)
        updated[parentId] = {
          ...parent,
          spouse: newId,
          marriageDate: personData.marriageDate || null
        };
        updated[newId] = { ...newPerson, spouse: parentId, level: parent.level };
      } else if (parent) {
        // For children: always add to the primary parent (person with lower ID in the couple)
        // This ensures all children are stored in one consistent place
        let primaryParent = parent;
        let primaryParentId = parentId;

        // If adding child from spouse, find the primary parent (lower ID)
        if (parent.spouse && familyData[parent.spouse]) {
          const spouseId = parent.spouse;
          const spouse = familyData[spouseId];
          // Use the parent with lower ID as primary
          if (spouseId < parentId) {
            primaryParent = spouse;
            primaryParentId = spouseId;
          }
        }

        // Ensure children array exists before spreading
        const currentChildren = Array.isArray(primaryParent.children) ? primaryParent.children : [];
        updated[primaryParentId] = { ...primaryParent, children: [...currentChildren, newId] };

        // Clear children from the other parent to avoid duplication
        if (primaryParentId !== parentId && parent.spouse) {
          updated[parentId] = { ...parent, children: [] };
        }
      }

      return updated;
    });

    setNextId(nextId + 1);
    return newId;
  };

  // Start tree - opens modal to fill details for first person
  const startTree = () => {
    console.log('🌳 Opening modal to start new Vamsapattika...');
    setModalState({
      isOpen: true,
      mode: 'add-root', // Special mode for first root person
      parentId: null
    });
  };

  // Add root person with details from modal
  const addRootPerson = (personData) => {
    console.log('🌳 Creating first root person with details:', personData);
    const rootPerson = {
      id: 1,
      name: personData.name,
      gender: personData.gender,
      birthDate: personData.birthDate || '',
      deathDate: personData.deathDate || '',
      occupation: personData.occupation || '',
      level: 1,
      photo: personData.photo || null,
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
        borderThickness: 4
      }
    };

    setFamilyData({ 1: rootPerson });
    setNextId(2);
    console.log('✅ Root person created successfully');
  };

  // Update person data
  const updatePerson = (personId, updates) => {
    setFamilyData(prev => {
      const updated = {
        ...prev,
        [personId]: {
          ...prev[personId],
          ...updates,
          // Deep merge customColors if provided
          ...(updates.customColors && {
            customColors: {
              ...prev[personId]?.customColors,
              ...updates.customColors
            }
          })
        }
      };
      return updated;
    });
  };

  // Remove person and descendants
  const removePerson = (personId) => {
    const person = familyData[personId];
    if (!person) {
      console.error('❌ Person not found:', personId);
      return;
    }

    console.log('🗑️ FamilyTreeContext: Removing person:', personId, person.name);

    setFamilyData(prev => {
      const updated = { ...prev };

      // Remove from parent's children array
      if (person.parent) {
        const parent = updated[person.parent];
        if (parent && Array.isArray(parent.children)) {
          updated[person.parent] = {
            ...parent,
            children: parent.children.filter(id => id !== personId)
          };
          console.log('Updated parent children:', updated[person.parent].children);
        }

        // Also check if parent has a spouse and remove from their children array
        if (parent && parent.spouse && updated[parent.spouse]) {
          const parentSpouse = updated[parent.spouse];
          if (parentSpouse && Array.isArray(parentSpouse.children)) {
            updated[parent.spouse] = {
              ...parentSpouse,
              children: parentSpouse.children.filter(id => id !== personId)
            };
          }
        }
      }

      // Get children from primary parent (person with lower ID in couple)
      const getAllChildrenIds = (id) => {
        const p = updated[id];
        if (!p) return [];

        const spouse = p.spouse ? updated[p.spouse] : null;
        // Find primary parent (lower ID)
        const primaryParent = spouse && spouse.id < p.id ? spouse : p;

        return Array.isArray(primaryParent.children) ? primaryParent.children : [];
      };

      // Get all children that need to be removed
      const childrenToRemove = getAllChildrenIds(personId);
      console.log(`Children to remove from person ${personId}:`, childrenToRemove);

      // Remove spouse connection
      if (person.spouse) {
        const spouse = updated[person.spouse];
        if (spouse) {
          updated[person.spouse] = {
            ...spouse,
            spouse: null,
            children: []
          };
        }
      }

      // Recursively remove children
      const removeDescendants = (id) => {
        const p = updated[id];
        if (p) {
          // Get children before deleting
          const children = getAllChildrenIds(id);
          console.log(`Removing descendants of ${id}:`, children);
          children.forEach(childId => removeDescendants(childId));
          delete updated[id];
        }
      };

      // Remove the person and all descendants
      removeDescendants(personId);

      // Allow empty tree - user can delete all cards
      const remainingCards = Object.keys(updated).length;
      console.log(`✅ Removal complete. Remaining cards: ${remainingCards}`);

      if (remainingCards === 0) {
        console.log('🌳 Tree is now empty - Start button will appear');
      }

      return updated;
    });
  };

  // Get children of a person (from primary parent to maintain order)
  const getChildren = (personId) => {
    if (!familyData || !personId) return [];

    const person = familyData[personId];
    if (!person) return [];

    const spouse = person.spouse ? familyData[person.spouse] : null;

    // Find the primary parent (one with lower ID) - this is where all children are stored
    let primaryParent = person;
    if (spouse) {
      // Use parent with lower ID as primary
      primaryParent = person.id < spouse.id ? person : spouse;
    }

    // Get children only from primary parent to maintain insertion order
    const childIds = (primaryParent.children && Array.isArray(primaryParent.children)) ? primaryParent.children : [];

    return childIds.map(id => familyData[id]).filter(Boolean);
  };

  // Get spouse
  const getSpouse = (personId) => {
    if (!familyData || !personId) return null;

    const person = familyData[personId];
    if (!person || !person.spouse) return null;
    return familyData[person.spouse];
  };

  // Get root person (level 1 with no parent)
  const getRootPerson = () => {
    if (!familyData || Object.keys(familyData).length === 0) {
      return null;
    }
    return Object.values(familyData).find(p => p && p.level === 1 && !p.parent);
  };

  // Switch to different tree
  const switchTree = async (treeId) => {
    setDataLoaded(false);
    setIsLoading(true);
    setCurrentTreeId(treeId);
    try {
      const backendData = await loadFamilyTree(treeId);
      if (backendData && backendData.familyData) {
        // Convert array to object if needed (bug fix)
        let cleanedData = backendData.familyData;
        if (Array.isArray(backendData.familyData)) {
          console.warn('familyData is an array, converting to object...');
          cleanedData = {};
          backendData.familyData.forEach((person, index) => {
            if (person && person.id) {
              cleanedData[person.id] = person;
            }
          });
        }

        // Consolidate children to primary parent
        cleanedData = consolidateChildrenToPrimary(cleanedData);

        setFamilyData(cleanedData);
        setNextId(backendData.nextId || 2);
        setCurrentTreeName(backendData.name || 'My Vamsapattika');
        setCurrentTreeCreatedAt(backendData.createdAt || new Date().toISOString());

        // Load user plan from Backend
        if (backendData.userPlan) {
          setUserPlan(backendData.userPlan);
        } else {
          // Infer plan from current card count for backward compatibility
          const cardCount = Object.keys(cleanedData).length;
          if (cardCount <= 4) {
            setUserPlan({ maxCards: 4, price: 0, name: 'Free' });
          } else if (cardCount <= 10) {
            setUserPlan({ maxCards: 10, price: 600, name: 'Silver' });
          } else if (cardCount <= 15) {
            setUserPlan({ maxCards: 15, price: 1500, name: 'Gold' });
          } else {
            setUserPlan({ maxCards: Infinity, price: 2600, name: 'Diamond' });
          }
        }
      }
      setDataLoaded(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Error switching tree:', error);
      setDataLoaded(true);
      setIsLoading(false);
    }
  };

  // Reset tree to initial state
  const resetTree = () => {
    setFamilyData(initialFamilyData); // Empty tree
    setNextId(1);
    // Will be saved to Backend automatically by the useEffect
  };

  // Import family data (from JSON file)
  const importData = (importedFamilyData) => {
    if (importedFamilyData && typeof importedFamilyData === 'object') {
      // Consolidate children to primary parent first
      const cleanedData = consolidateChildrenToPrimary(importedFamilyData);
      setFamilyData(cleanedData);
      // Find the highest ID to set nextId
      const ids = Object.keys(cleanedData).map(id => parseInt(id));
      const maxId = ids.length > 0 ? Math.max(...ids) : 1;
      setNextId(maxId + 1);
      // Will be saved to Backend automatically by the useEffect
    }
  };

  const value = {
    familyData,
    isLoading,
    globalShowPhotos,
    setGlobalShowPhotos,
    selectedPerson,
    setSelectedPerson,
    modalState,
    setModalState,
    textToolbarState,
    setTextToolbarState,
    startTree,
    addRootPerson,
    addPerson,
    updatePerson,
    removePerson,
    getChildren,
    getSpouse,
    getRootPerson,
    currentTreeId,
    currentTreeName,
    setCurrentTreeName,
    switchTree,
    resetTree,
    importData,
    userPlan,
    planLoading,
    upgradePlan,
    canAddCard,
    refreshSubscription: fetchSubscription, // Manual refresh function
    showPricingModal,
    setShowPricingModal,
    cleanOrphanedCards: () => {
      console.log('🧹 Manual cleanup triggered');
      // First consolidate children
      let cleaned = consolidateChildrenToPrimary(familyData);
      // Then clean orphaned cards
      cleaned = cleanOrphanedCardsFunc(cleaned);
      if (cleaned !== familyData) {
        setFamilyData(cleaned);
        console.log('✅ Manual cleanup complete');
      } else {
        console.log('✅ No orphaned cards found');
      }
    }
  };

  // Expose cleanup function to window for debugging
  React.useEffect(() => {
    window.cleanupFamilyTree = () => {
      console.log('🧹 Running manual cleanup...');
      // First consolidate children
      let cleaned = consolidateChildrenToPrimary(familyData);
      // Then clean orphaned cards
      cleaned = cleanOrphanedCardsFunc(cleaned);
      if (cleaned !== familyData) {
        setFamilyData(cleaned);
        console.log('✅ Cleanup complete! Children consolidated and orphaned cards removed.');
      } else {
        console.log('✅ No issues found. Tree is clean.');
      }
    };
    return () => {
      delete window.cleanupFamilyTree;
    };
  }, [familyData, cleanOrphanedCardsFunc, consolidateChildrenToPrimary]);

  return (
    <FamilyTreeContext.Provider value={value}>
      {children}
    </FamilyTreeContext.Provider>
  );
};