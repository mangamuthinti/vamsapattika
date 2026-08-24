import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFamilyTree } from '../context/FamilyTreeContext';
import { useProfileModal } from '../pages/FamilyTree/FamilyTreePage';
import PricingModal from './PricingModal';
import CustomAlert from './CustomAlert';
import CustomConfirm from './CustomConfirm';
import FeedbackModal from './FeedbackModal';

const UserDropdown = () => {
  const { currentUser, logout, getAllTrees, createNewTree, deleteTree, renameTree } = useAuth();
  const { currentTreeId, currentTreeName, switchTree, setCurrentTreeName, familyData, upgradePlan, userPlan } = useFamilyTree();
  const { setShowProfileModal } = useProfileModal();
  const [isOpen, setIsOpen] = useState(false);
  const [showTreesMenu, setShowTreesMenu] = useState(false);
  const [trees, setTrees] = useState([]);
  const [showNewTreeModal, setShowNewTreeModal] = useState(false);
  const [newTreeName, setNewTreeName] = useState('');
  const [editingTreeId, setEditingTreeId] = useState(null);
  const [editingTreeName, setEditingTreeName] = useState('');
  const [showPricingPage, setShowPricingPage] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const dropdownRef = useRef(null);
  const [alertState, setAlertState] = useState({ isOpen: false, message: '' });
  const [confirmState, setConfirmState] = useState({ isOpen: false, message: '', onConfirm: null });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowTreesMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadTrees = async () => {
    try {
      console.log('Loading trees from Firebase...');
      const userTrees = await getAllTrees();
      console.log('Loaded trees:', userTrees);

      // Sort trees by last updated (most recent first)
      const sortedTrees = userTrees.sort((a, b) => {
        const dateA = new Date(a.lastUpdated || 0);
        const dateB = new Date(b.lastUpdated || 0);
        return dateB - dateA;
      });

      console.log('Setting trees state with:', sortedTrees);
      setTrees(sortedTrees);
      console.log('Trees state updated');
    } catch (error) {
      console.error('Error loading trees:', error);
      setTrees([]);
    }
  };

  const handleTreesClick = async () => {
    setShowTreesMenu(!showTreesMenu);
    if (!showTreesMenu) {
      await loadTrees();
    }
  };

  const handleCreateTree = async () => {
    console.log('handleCreateTree called with:', newTreeName);

    if (!newTreeName.trim()) {
      setAlertState({
        isOpen: true,
        message: 'Please enter a tree name'
      });
      return;
    }

    try {
      console.log('Creating new tree...');
      const treeId = await createNewTree(newTreeName.trim());
      console.log('Tree created with ID:', treeId);

      setShowNewTreeModal(false);
      setNewTreeName('');

      console.log('Switching to new tree...');
      await switchTree(treeId);

      console.log('Reloading trees list...');
      await loadTrees();

      console.log('Tree creation complete');

      // Keep dropdown open to show the new tree in the list
      // User can close it manually if they want
    } catch (error) {
      console.error('Error creating tree:', error);
      setAlertState({
        isOpen: true,
        message: 'Failed to create tree: ' + error.message
      });
    }
  };

  const handleSwitchTree = async (treeId) => {
    try {
      await switchTree(treeId);
      setIsOpen(false);
      setShowTreesMenu(false);
    } catch (error) {
      console.error('Error switching tree:', error);
      setAlertState({
        isOpen: true,
        message: 'Failed to switch tree'
      });
    }
  };

  const handleDeleteTree = async (treeId, treeName, e) => {
    e.stopPropagation();
    if (treeId === 'default') {
      setAlertState({
        isOpen: true,
        message: 'Cannot delete the default tree'
      });
      return;
    }

    setConfirmState({
      isOpen: true,
      message: `Are you sure you want to delete "${treeName}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await deleteTree(treeId);
          await loadTrees();
          if (currentTreeId === treeId) {
            await switchTree('default');
          }
          setConfirmState({ isOpen: false, message: '', onConfirm: null });
        } catch (error) {
          console.error('Error deleting tree:', error);
          setAlertState({
            isOpen: true,
            message: 'Failed to delete tree'
          });
          setConfirmState({ isOpen: false, message: '', onConfirm: null });
        }
      }
    });
  };

  const handleRenameTree = async (treeId) => {
    console.log('handleRenameTree called with:', treeId, editingTreeName);

    if (!editingTreeName.trim()) {
      setAlertState({
        isOpen: true,
        message: 'Please enter a tree name'
      });
      return;
    }

    try {
      console.log('Renaming tree...');
      const newName = editingTreeName.trim();
      await renameTree(treeId, newName);

      // Update the current tree name if we're renaming the active tree
      if (currentTreeId === treeId) {
        console.log('Updating current tree name to:', newName);
        setCurrentTreeName(newName);
      }

      // Clear editing state
      setEditingTreeId(null);
      setEditingTreeName('');

      // Reload the trees list to show the updated name
      console.log('Reloading trees list...');
      await loadTrees();

      console.log('Rename complete - UI should update now');
    } catch (error) {
      console.error('Error renaming tree:', error);
      setAlertState({
        isOpen: true,
        message: 'Failed to rename tree: ' + error.message
      });
    }
  };

  const handleLogout = async () => {
    setConfirmState({
      isOpen: true,
      message: 'Are you sure you want to logout?',
      onConfirm: async () => {
        try {
          await logout();
          setConfirmState({ isOpen: false, message: '', onConfirm: null });
        } catch (error) {
          console.error('Logout error:', error);
          setConfirmState({ isOpen: false, message: '', onConfirm: null });
        }
      }
    });
  };

  const getUserInitials = () => {
    if (currentUser?.displayName) {
      return currentUser.displayName.charAt(0).toUpperCase();
    }
    if (currentUser?.email) {
      return currentUser.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <>
      <CustomAlert
        isOpen={alertState.isOpen}
        message={alertState.message}
        onClose={() => {
          setAlertState({ isOpen: false, message: '' });
          setShowPricingPage(false);
        }}
      />
      <CustomConfirm
        isOpen={confirmState.isOpen}
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState({ isOpen: false, message: '', onConfirm: null })}
      />
      <div className="user-dropdown" ref={dropdownRef}>
      <button className="user-avatar-btn" onClick={() => setIsOpen(!isOpen)}>
        <div className="user-avatar">{getUserInitials()}</div>
      </button>

      {isOpen && (
        <div className="user-dropdown-menu">
          <div className="user-dropdown-header">
            <div className="user-avatar-large">{getUserInitials()}</div>
            <div className="user-info">
              <div className="user-name">{currentUser?.displayName || 'User'}</div>
              <div className="user-email">{currentUser?.email}</div>
            </div>
          </div>

          <div className="dropdown-divider"></div>

          <button className="dropdown-item" onClick={handleTreesClick}>
            <span className="dropdown-icon">🌳</span>
            Trees
            <span className="dropdown-arrow">{showTreesMenu ? '▼' : '▶'}</span>
          </button>

          {showTreesMenu && (
            <div className="trees-submenu">
              <div className="trees-list">
                {trees.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#666', fontSize: '14px' }}>
                    No trees found. Create your first tree below!
                  </div>
                ) : (
                  trees.map((tree) => (
                  <div
                    key={tree.id}
                    className={`tree-item ${tree.id === currentTreeId ? 'active' : ''}`}
                  >
                    {editingTreeId === tree.id ? (
                      <div className="tree-edit-form">
                        <input
                          type="text"
                          value={editingTreeName}
                          onChange={(e) => setEditingTreeName(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleRenameTree(tree.id);
                            }
                          }}
                          autoFocus
                        />
                        <button type="button" onClick={() => handleRenameTree(tree.id)}>✓</button>
                        <button type="button" onClick={() => { setEditingTreeId(null); setEditingTreeName(''); }}>✕</button>
                      </div>
                    ) : (
                      <>
                        <div className="tree-info" onClick={() => handleSwitchTree(tree.id)}>
                          <div className="tree-name">{tree.name}</div>
                          <div className="tree-date">
                            Updated: {tree.lastUpdated ? new Date(tree.lastUpdated).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                        <div className="tree-actions">
                          <button
                            className="tree-action-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingTreeId(tree.id);
                              setEditingTreeName(tree.name);
                            }}
                            title="Rename"
                          >
                            ✏️
                          </button>
                          {tree.id !== 'default' && (
                            <button
                              className="tree-action-btn delete"
                              onClick={(e) => handleDeleteTree(tree.id, tree.name, e)}
                              title="Delete"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  ))
                )}
              </div>
              <button className="dropdown-item create-tree-btn" onClick={() => setShowNewTreeModal(true)}
                ref={el => el && el.style.setProperty('display', 'none', 'important')}>
                <span className="dropdown-icon">➕</span>
                Create New Tree
              </button>
            </div>
          )}

          <button className="dropdown-item" onClick={() => { setShowPricingPage(true); setIsOpen(false); }}>
            <span className="dropdown-icon">💳</span>
            Pricing
          </button>

          <button className="dropdown-item" onClick={() => { setShowProfileModal(true); setIsOpen(false); }}>
            <span className="dropdown-icon">👤</span>
            Profile
          </button>

          <button className="dropdown-item" onClick={() => setAlertState({ isOpen: true, message: 'Settings feature coming soon!' })}>
            <span className="dropdown-icon">⚙️</span>
            Settings
          </button>

          <button className="dropdown-item" onClick={() => { setShowFeedbackModal(true); setIsOpen(false); }}>
            <span className="dropdown-icon">💬</span>
            Feedback
          </button>

          <div className="dropdown-divider"></div>

          <button className="dropdown-item logout" onClick={handleLogout}>
            <span className="dropdown-icon">🚪</span>
            Logout
          </button>
        </div>
      )}

      {showNewTreeModal && (
        <div className="modal-overlay" onClick={() => setShowNewTreeModal(false)}>
          <div className="new-tree-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Create New Tree</h3>
            <input
              type="text"
              placeholder="Enter tree name"
              value={newTreeName}
              onChange={(e) => setNewTreeName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleCreateTree();
                }
              }}
              autoFocus
            />
            <div className="modal-buttons">
              <button type="button" className="btn-submit" onClick={handleCreateTree}>
                Create
              </button>
              <button type="button" className="btn-cancel" onClick={() => {
                setShowNewTreeModal(false);
                setNewTreeName('');
              }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <PricingModal
        isOpen={showPricingPage}
        onClose={() => setShowPricingPage(false)}
        currentCardCount={Object.keys(familyData).length}
        userPlan={userPlan}
        onUpgrade={(tier) => {
          setConfirmState({
            isOpen: true,
            message: `Upgrade to ${tier.name} plan for ₹${tier.price}?\n\nThis will allow you to add up to ${tier.max === Infinity ? 'unlimited' : tier.max} family cards.`,
            onConfirm: () => {
              upgradePlan(tier.max, tier.price);
              setConfirmState({ isOpen: false, message: '', onConfirm: null });
              setAlertState({
                isOpen: true,
                message: `Payment successful! You are now on the ${tier.name} plan.`
              });
            }
          });
        }}
      />

      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />
    </div>
    </>
  );
};

export default UserDropdown;
