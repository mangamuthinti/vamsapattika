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

const initialFamilyData = {
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
      borderThickness: 4
    }
  }
};

export const FamilyTreeProvider = ({ children }) => {
  const { currentUser, loadFamilyTree, saveFamilyTree } = useAuth();
  const { showAlert } = useAlert();
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTreeId, setCurrentTreeId] = useState('null');
  const [currentTreeName, setCurrentTreeName] = useState('My Vamsapattika');
  const [currentTreeCreatedAt, setCurrentTreeCreatedAt] = useState(null);

  // Initialize with default data (will be replaced by Backend data)
  const [nextId, setNextId] = useState(2);
  const [familyData, setFamilyData] = useState(initialFamilyData);

  // Load data from Backend when user logs in or switches tree
  useEffect(() => {
    const loadUserData = async () => {
      if (currentUser && !dataLoaded) {
        setIsLoading(true);
        try {
          const backendData = await loadFamilyTree(currentTreeId);
          if (backendData && backendData.familyData) {
            console.log('Loaded data from Backend:', backendData);

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

            setFamilyData(cleanedData);
            setNextId(backendData.nextId || 2);
            setCurrentTreeName(backendData.name || 'My Vamsapattika');
            setCurrentTreeCreatedAt(backendData.createdAt || new Date().toISOString());

            // Note: userPlan is now loaded from backend subscription API (separate useEffect below), not from tree data
          } else {
            // No data in Backend, use initial data
            console.log('No data in Backend, using initial data');
            setFamilyData(initialFamilyData);
            setNextId(2);
          }
          setDataLoaded(true);
          setIsLoading(false);
        } catch (error) {
          console.error('Error loading data from Backend:', error);
          // On error, use initial data
          setFamilyData(initialFamilyData);
          setNextId(2);
          setDataLoaded(true);
          setIsLoading(false);
        }
      } else if (!currentUser) {
        // No user logged in, stop loading
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

  // Payment/Plan state - Default Free plan, but track if loaded from backend
  const [userPlan, setUserPlan] = useState({
    maxCards: 4,
    price: 0,
    name: 'Free',
    purchaseDate: null,
    expiryDate: null,
    loaded: false // Track if plan has been loaded from backend
  });
  const [planLoading, setPlanLoading] = useState(true);

  const [showPricingModal, setShowPricingModal] = useState(false);

  // Fetch subscription data from backend immediately when user logs in
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!currentUser) {
        setPlanLoading(false);
        return;
      }

      try {
        setPlanLoading(true);
        const { paymentsAPI } = await import('../api/payments');
        const subscriptionData = await paymentsAPI.getSubscription();
        console.log('📦 Fetched subscription from backend:', subscriptionData);

        if (subscriptionData && subscriptionData.plan_details) {
          const newPlan = {
            maxCards: subscriptionData.plan_details.max_cards === 999999 ? Infinity : subscriptionData.plan_details.max_cards,
            price: parseFloat(subscriptionData.plan_details.price),
            name: subscriptionData.plan_details.display_name,
            purchaseDate: subscriptionData.purchase_date,
            expiryDate: subscriptionData.expiry_date,
            loaded: true
          };
          console.log('✅ Setting user plan to:', newPlan);
          setUserPlan(newPlan);
        } else {
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
        console.error('Error fetching subscription:', error);
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
        setPlanLoading(false);
      }
    };

    fetchSubscription();
  }, [currentUser]);

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

    // Trigger pricing modal at specific thresholds
    if (!canAddCard()) {
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
        // Ensure children array exists before spreading
        const currentChildren = Array.isArray(parent.children) ? parent.children : [];
        updated[parentId] = { ...parent, children: [...currentChildren, newId] };
      }

      return updated;
    });

    setNextId(nextId + 1);
    return newId;
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
      console.error('Person not found:', personId);
      return;
    }

    // Don't allow removing root person
    if (person.level === 1 && !person.parent) {
      showAlert('Cannot remove the root ancestor of the Vamsapattika');
      return;
    }

    console.log('Removing person:', personId, person);

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
      }

      // Remove spouse connection
      if (person.spouse) {
        const spouse = updated[person.spouse];
        if (spouse) {
          updated[person.spouse] = { ...spouse, spouse: null };
        }
      }

      // Recursively remove children
      const removeDescendants = (id) => {
        const p = updated[id];
        if (p) {
          // Safely handle children array
          const children = Array.isArray(p.children) ? p.children : [];
          console.log(`Removing descendants of ${id}:`, children);
          children.forEach(childId => removeDescendants(childId));
          delete updated[id];
        }
      };

      removeDescendants(personId);

      // Verify root person still exists
      const rootExists = Object.values(updated).some(p => p && p.level === 1 && !p.parent);
      if (!rootExists) {
        console.error('Root person was accidentally deleted! Reverting...');
        return prev; // Don't update if root was deleted
      }

      console.log('Updated family data after removal:', Object.keys(updated));
      return updated;
    });
  };

  // Get children of a person (check both person and spouse)
  const getChildren = (personId) => {
    if (!familyData || !personId) return [];

    const person = familyData[personId];
    if (!person) return [];

    const spouse = person.spouse ? familyData[person.spouse] : null;

    // Collect children from both person and spouse
    const personChildren = (person.children && Array.isArray(person.children)) ? person.children : [];
    const spouseChildren = (spouse?.children && Array.isArray(spouse.children)) ? spouse.children : [];

    // Merge and deduplicate
    const allChildIds = [...new Set([...personChildren, ...spouseChildren])];

    return allChildIds.map(id => familyData[id]).filter(Boolean);
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
    setFamilyData(initialFamilyData);
    setNextId(2);
    // Will be saved to Backend automatically by the useEffect
  };

  // Import family data (from JSON file)
  const importData = (importedFamilyData) => {
    if (importedFamilyData && typeof importedFamilyData === 'object') {
      setFamilyData(importedFamilyData);
      // Find the highest ID to set nextId
      const ids = Object.keys(importedFamilyData).map(id => parseInt(id));
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
    showPricingModal,
    setShowPricingModal
  };

  return (
    <FamilyTreeContext.Provider value={value}>
      {children}
    </FamilyTreeContext.Provider>
  );
};
