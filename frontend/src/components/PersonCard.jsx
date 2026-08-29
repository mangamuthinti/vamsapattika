import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useFamilyTree } from '../context/FamilyTreeContext';
import FloatingTextToolbar from './FloatingTextToolbar';
import CustomAlert from './CustomAlert';
import CustomConfirm from './CustomConfirm';
import { useLanguage } from '../context/LanguageContext';

const PersonCard = ({ personId }) => {
  const { familyData, globalShowPhotos, updatePerson, removePerson, setModalState, setSelectedPerson, textToolbarState, setTextToolbarState } = useFamilyTree();
  const [menuOpen, setMenuOpen] = useState(false);
  const { language, translateDynamic, translateName } = useLanguage();
  const person = familyData[personId];

  const [displayOccupation, setDisplayOccupation] = useState(person?.occupation || '');

  const cardRef = useRef(null);
  const activeTextElementRef = useRef(null);
  const [alertState, setAlertState] = useState({ isOpen: false, message: '' });
  const [confirmState, setConfirmState] = useState({ isOpen: false, message: '', onConfirm: null });


  if (!person) return null;

  const cardStyle = {
    background: person.customColors?.background || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderColor: person.customColors?.border || '#764ba2',
    color: person.customColors?.text || 'white'
  };

  useEffect(() => {
    if (!person) return undefined;

    let cancelled = false;

    // A family member's occupation is translated by meaning
    if (!person.occupation) {
      setDisplayOccupation('');
      return undefined;
    }

    translateDynamic(person.occupation).then((occupation) => {
      if (!cancelled) {
        setDisplayOccupation(occupation || person.occupation || '');
      }
    });

    return () => {
      cancelled = true;
    };
  }, [person?.occupation, language, translateDynamic]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if clicking on the menu button or menu itself
      if (event.target.closest('.card-menu-btn') || event.target.closest('.card-menu')) {
        return;
      }

      if (menuOpen && cardRef.current && !cardRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [menuOpen]);

  // Update toolbar position on scroll when this card's toolbar is open
  useEffect(() => {
    if (textToolbarState.isOpen && textToolbarState.personId === personId) {
      const handleScroll = () => {
        if (activeTextElementRef.current) {
          const position = calculateToolbarPosition(activeTextElementRef.current);
          if (position) {
            setTextToolbarState(prev => ({
              ...prev,
              position: position
            }));
          }
        }
      };

      // Listen to scroll on tree-container (the main scrollable area)
      const treeContainer = document.querySelector('.tree-container');
      if (treeContainer) {
        treeContainer.addEventListener('scroll', handleScroll);
      }
      // Also listen to window scroll in case there's window-level scrolling
      window.addEventListener('scroll', handleScroll, true);

      return () => {
        if (treeContainer) {
          treeContainer.removeEventListener('scroll', handleScroll);
        }
        window.removeEventListener('scroll', handleScroll, true);
      };
    }
  }, [textToolbarState.isOpen, textToolbarState.personId, personId, setTextToolbarState]);

  const handleEdit = () => {
    setSelectedPerson(personId);
    setModalState({ isOpen: true, mode: 'edit', parentId: null });
    setMenuOpen(false);
  };

  const handleAddSpouse = () => {
    if (person.spouse) {
      setAlertState({
        isOpen: true,
        message: 'This person already has a spouse. Please remove the existing spouse first.'
      });
      return;
    }
    setModalState({ isOpen: true, mode: 'spouse', parentId: personId });
    setMenuOpen(false);
  };

  const handleAddChild = () => {
    setModalState({ isOpen: true, mode: 'add', parentId: personId });
    setMenuOpen(false);
  };

  const handleRemove = () => {
    setConfirmState({
      isOpen: true,
      message: `Are you sure you want to remove ${person.name}?`,
      onConfirm: () => {
        removePerson(personId);
        setMenuOpen(false);
        setConfirmState({ isOpen: false, message: '', onConfirm: null });
      }
    });
  };

  const toggleMenu = (e) => {
    e.stopPropagation();

    // Close text toolbar if open
    if (textToolbarState.isOpen) {
      activeTextElementRef.current = null;
      setTextToolbarState({ isOpen: false, position: { x: 0, y: 0 }, personId: null, field: null });
    }

    setMenuOpen(!menuOpen);
  };

  const calculateToolbarPosition = (textElement) => {
    if (!textElement) return null;

    const textRect = textElement.getBoundingClientRect();
    const toolbarWidth = 450;
    const toolbarHeight = 60;

    // Calculate position - centered on screen, below text
    let x = (window.innerWidth / 2) - (toolbarWidth / 2);
    let y = textRect.bottom + 10; // Always show below text

    // Ensure within viewport bounds
    x = Math.max(10, Math.min(x, window.innerWidth - toolbarWidth - 10));
    y = Math.max(70, Math.min(y, window.innerHeight - toolbarHeight - 10));

    return { x, y };
  };

  const handleTextClick = (e, field) => {
    e.stopPropagation();

    // Don't open toolbar if clicking on menu
    if (e.target.closest('.card-menu-btn') || e.target.closest('.card-menu')) {
      return;
    }

    // Close menu if open
    if (menuOpen) {
      setMenuOpen(false);
    }

    activeTextElementRef.current = e.target;
    const position = calculateToolbarPosition(e.target);

    if (position) {
      setTextToolbarState({
        isOpen: true,
        position: position,
        personId: personId,
        field: field
      });
    }
  };

  const handleCardClick = (e) => {
    // Don't open properties if clicking on the menu button or menu items
    if (e.target.closest('.card-menu-btn') || e.target.closest('.card-menu')) {
      return;
    }

    // If clicking on text elements, show text toolbar instead
    if (e.target.classList.contains('name') ||
      e.target.classList.contains('dates') ||
      e.target.classList.contains('occupation')) {
      return; // Text click handler will take care of this
    }

    console.log('PersonCard clicked, setting selectedPerson to:', personId);
    setSelectedPerson(personId);
  };

  const handleFormatText = (styles) => {
    if (!textToolbarState.field || !textToolbarState.personId) return;

    const targetPerson = familyData[textToolbarState.personId];
    if (!targetPerson) return;

    console.log('Applying text styles:', {
      personId: textToolbarState.personId,
      field: textToolbarState.field,
      styles: styles
    });

    const textStyles = targetPerson.textStyles || {};
    updatePerson(textToolbarState.personId, {
      textStyles: {
        ...textStyles,
        [textToolbarState.field]: styles
      }
    });
  };

  const closeTextToolbar = () => {
    activeTextElementRef.current = null;
    setTextToolbarState({ isOpen: false, position: { x: 0, y: 0 }, personId: null, field: null });
  };

  const genderSymbol = {
    male: '♂',
    female: '♀',
    other: '⚥'
  };

  return (
    <>
      <CustomAlert
        isOpen={alertState.isOpen}
        message={alertState.message}
        onClose={() => setAlertState({ isOpen: false, message: '' })}
      />
      <CustomConfirm
        isOpen={confirmState.isOpen}
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState({ isOpen: false, message: '', onConfirm: null })}
      />
      <div
        ref={cardRef}
        className={`person level-${person.level} gender-${person.gender} shape-${person.shape} ${!globalShowPhotos || person.photo === '' ? 'no-photo' : ''}`}
        style={cardStyle}
        onClick={handleCardClick}
      >
        <button className="card-menu-btn" onClick={toggleMenu}>⋮</button>

        {/* Render menu in portal, centered on screen */}
        {menuOpen && ReactDOM.createPortal(
          <div className="card-menu-overlay" onClick={() => setMenuOpen(false)}>
            <div
              className="card-menu show"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="menu-item" onClick={handleEdit}>
                <span className="menu-icon">✏️</span>
                <span>Edit Info</span>
              </button>

              {/* Show "Add Spouse" only if no spouse */}
              {!person.spouse && (
                <button className="menu-item" onClick={handleAddSpouse}>
                  <span className="menu-icon">💑</span>
                  <span>Add Spouse</span>
                </button>
              )}

              {/* Show "Add Child" only if has spouse */}
              {person.spouse && (
                <button className="menu-item" onClick={handleAddChild}>
                  <span className="menu-icon">👶</span>
                  <span>Add Child</span>
                </button>
              )}

              {/* Hide Remove for root node (id=1) */}
              {personId !== 1 && (
                <button className="menu-item menu-item-danger" onClick={handleRemove}>
                  <span className="menu-icon">🗑️</span>
                  <span>Remove</span>
                </button>
              )}
            </div>
          </div>,
          document.body
        )}

        {globalShowPhotos && person.photo !== '' && (
          <div className={`photo-container ${!person.photo ? 'empty' : ''} ${person.photoShape ? `photo-shape-${person.photoShape}` : 'photo-shape-circle'}`}>
            {person.photo ? (
              <img
                src={person.photo}
                alt={person.name}
                className="person-photo"
              />
            ) : null}
          </div>
        )}

        <div
          key={`name-${personId}-${person.name}`}
          className="name"
          style={{
            ...person.textStyles?.name,
          }}
          onClick={(e) => handleTextClick(e, 'name')}
        >
          {person.name}
        </div>
        <div className="gender-badge">{genderSymbol[person.gender]}</div>
        {(person.birthDate || person.deathDate) && (
          <div
            key={`dates-${personId}-${person.birthDate}-${person.deathDate}`}
            className="dates"
            style={{
              ...person.textStyles?.dates,
            }}
            onClick={(e) => handleTextClick(e, 'dates')}
          >
            {person.birthDate && new Date(person.birthDate).getFullYear()}
            {person.birthDate && person.deathDate && '-'}
            {person.deathDate && new Date(person.deathDate).getFullYear()}
          </div>
        )}
        {person.occupation && (
          <div
            key={`occupation-${personId}-${person.occupation}`}
            className="occupation"
            style={{
              ...person.textStyles?.occupation,
            }}
            onClick={(e) => handleTextClick(e, 'occupation')}
          >
            {displayOccupation}
          </div>
        )}
        {person.link && <div className="link-badge">🔗</div>}

        {/* Render toolbar in portal only if this card's text is being edited */}
        {textToolbarState.isOpen && textToolbarState.personId === personId && ReactDOM.createPortal(
          <FloatingTextToolbar
            isOpen={true}
            position={textToolbarState.position}
            onClose={closeTextToolbar}
            onFormat={handleFormatText}
            currentStyles={person.textStyles?.[textToolbarState.field]}
          />,
          document.body
        )}
      </div>
    </>
  );
};

export default PersonCard;
