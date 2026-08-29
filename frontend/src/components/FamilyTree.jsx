import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useFamilyTree } from '../context/FamilyTreeContext';
import PersonCard from './PersonCard';
import { formatDateTime } from '../utils/exportUtils';

const labelGradients = {
  blue: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  sunset: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  ocean: 'linear-gradient(135deg, #2e3192 0%, #1bffff 100%)',
  mint: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
  rose: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
};

const TreeNode = ({ personId }) => {
  const { familyData, getChildren, getSpouse, updatePerson } = useFamilyTree();
  const person = familyData[personId];
  const spouse = getSpouse(personId);
  const children = getChildren(personId);

  // Debug logging
  console.log(`TreeNode ${personId}:`, {
    person,
    childrenIds: person?.children,
    childrenObjects: children,
    familyData
  });
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [labelText, setLabelText] = useState(person?.coupleLabel || 'Couple');
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [colorMenuPosition, setColorMenuPosition] = useState({ x: 0, y: 0 });
  const [colorMenuTarget, setColorMenuTarget] = useState(null);
  const [showBoxToolbar, setShowBoxToolbar] = useState(false);
  const [boxToolbarPosition, setBoxToolbarPosition] = useState({ x: 0, y: 0 });

  if (!person) return null;

  const hasSpouse = spouse !== null;
  const hasFamily = hasSpouse;

  const handleLabelClick = () => {
    setIsEditingLabel(true);
  };

  const handleLabelChange = (e) => {
    setLabelText(e.target.value);
  };

  const handleLabelBlur = () => {
    setIsEditingLabel(false);
    if (labelText.trim()) {
      updatePerson(personId, { coupleLabel: labelText });
    }
  };

  const handleLabelKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLabelBlur();
    }
  };

  const handleRightClick = (e, target) => {
    e.preventDefault();
    setColorMenuPosition({ x: e.clientX, y: e.clientY });
    setColorMenuTarget(target);
    setShowColorMenu(true);
  };

  const handleColorSelect = (gradientKey) => {
    if (colorMenuTarget === 'label') {
      updatePerson(personId, { labelGradient: gradientKey });
    } else if (colorMenuTarget === 'marriage') {
      updatePerson(personId, { marriageGradient: gradientKey });
    }
    setShowColorMenu(false);
  };

  // Close color menu when clicking outside
  React.useEffect(() => {
    if (showColorMenu) {
      const handleClick = () => setShowColorMenu(false);
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [showColorMenu]);

  React.useEffect(() => {
    if (showBoxToolbar) {
      const handleClick = (e) => {
        if (!e.target.closest('.box-style-toolbar') && !e.target.closest('.family-box')) {
          setShowBoxToolbar(false);
        }
      };
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [showBoxToolbar]);

  return (
    <li data-id={personId} data-level={person.level} data-gender={person.gender}>
      {hasFamily ? (
        <div
          className="family-box"
          style={{
            borderColor: person.coupleBoxStyle?.borderColor || 'rgba(250, 112, 154, 0.4)',
            backgroundColor: person.coupleBoxStyle?.backgroundColor === 'transparent' ? 'transparent' : (person.coupleBoxStyle?.backgroundColor || 'rgba(250, 112, 154, 0.1)'),
            borderWidth: `${person.coupleBoxStyle?.borderThickness || 4}px`,
            borderStyle: (person.coupleBoxStyle?.borderThickness === 0 || person.coupleBoxStyle?.borderColor === 'transparent') ? 'none' : 'solid',
            background: person.coupleBoxStyle?.backgroundColor === 'transparent' ? 'transparent' : undefined
          }}
          onClick={(e) => {
            if (e.target.classList.contains('family-box')) {
              const rect = e.currentTarget.getBoundingClientRect();
              setBoxToolbarPosition({
                x: rect.left + rect.width / 2 - 200,
                y: rect.top - 60
              });
              setShowBoxToolbar(!showBoxToolbar);
            }
          }}
        >
          <div
            className="family-label"
            onClick={handleLabelClick}
            onContextMenu={(e) => handleRightClick(e, 'label')}
            style={person.labelGradient ? { background: labelGradients[person.labelGradient] } : {}}
          >
            {isEditingLabel ? (
              <input
                type="text"
                className="family-label-input"
                value={labelText}
                onChange={handleLabelChange}
                onBlur={handleLabelBlur}
                onKeyPress={handleLabelKeyPress}
                autoFocus
              />
            ) : (
              labelText
            )}
          </div>
          <div className="couple-container">
            <PersonCard key={`person-${personId}`} personId={personId} />
            {spouse && <PersonCard key={`person-${spouse.id}`} personId={spouse.id} />}
          </div>
          {/* Marriage date at bottom of family box */}
          {person.marriageDate && (
            <div
              className="marriage-date"
              onContextMenu={(e) => handleRightClick(e, 'marriage')}
              style={person.marriageGradient ? { background: labelGradients[person.marriageGradient] } : {}}
            >
              {formatDateTime(person.marriageDate)}
            </div>
          )}

          {/* Color picker menu */}
          {showColorMenu && ReactDOM.createPortal(
            <div
              className="label-color-menu"
              style={{
                position: 'fixed',
                left: `${colorMenuPosition.x}px`,
                top: `${colorMenuPosition.y}px`,
                background: 'white',
                border: '1px solid #ddd',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                padding: '8px',
                zIndex: 10000,
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '8px'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {Object.keys(labelGradients).map(key => (
                <button
                  key={key}
                  onClick={() => handleColorSelect(key)}
                  title={key.charAt(0).toUpperCase() + key.slice(1)}
                  style={{
                    width: '40px',
                    height: '40px',
                    border: '2px solid #ddd',
                    borderRadius: '6px',
                    background: labelGradients[key],
                    cursor: 'pointer',
                    transition: 'transform 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
                  onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                />
              ))}
            </div>,
            document.body
          )}

          {/* Inline Box Style Toolbar */}
          {showBoxToolbar && ReactDOM.createPortal(
            <div
              className="box-style-toolbar"
              style={{
                position: 'fixed',
                left: `${boxToolbarPosition.x}px`,
                top: `${boxToolbarPosition.y}px`,
                background: 'white',
                border: '1px solid #ddd',
                borderRadius: '10px',
                padding: '12px 16px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
                zIndex: 10000,
                display: 'flex',
                gap: '12px',
                alignItems: 'center'
              }}
            >
              <input
                type="color"
                value={person.coupleBoxStyle?.borderColor?.match(/#[0-9a-f]{6}/i)?.[0] || '#fa709a'}
                onChange={(e) => {
                  updatePerson(personId, {
                    coupleBoxStyle: {
                      ...person.coupleBoxStyle,
                      borderColor: e.target.value
                    }
                  });
                }}
                title="Border Color"
                style={{
                  width: '40px',
                  height: '40px',
                  border: '2px solid #ddd',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              />

              <div style={{ position: 'relative' }}>
                <input
                  type="color"
                  value={person.coupleBoxStyle?.backgroundColor?.match(/#[0-9a-f]{6}/i)?.[0] || '#fce4ec'}
                  onChange={(e) => {
                    const color = e.target.value;
                    const rgb = parseInt(color.slice(1), 16);
                    const r = (rgb >> 16) & 255;
                    const g = (rgb >> 8) & 255;
                    const b = rgb & 255;
                    updatePerson(personId, {
                      coupleBoxStyle: {
                        ...person.coupleBoxStyle,
                        backgroundColor: `rgba(${r}, ${g}, ${b}, 0.1)`
                      }
                    });
                  }}
                  title="Background Color"
                  style={{
                    width: '40px',
                    height: '40px',
                    border: '2px solid #ddd',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                />
                <button
                  onClick={() => {
                    updatePerson(personId, {
                      coupleBoxStyle: {
                        ...person.coupleBoxStyle,
                        backgroundColor: 'transparent'
                      }
                    });
                  }}
                  style={{
                    position: 'absolute',
                    bottom: '0px',
                    right: '0px',
                    fontSize: '9px',
                    padding: '1px 4px',
                    border: '1px solid #999',
                    borderRadius: '3px',
                    background: 'white',
                    cursor: 'pointer',
                    color: '#333',
                    fontWeight: '600',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }}
                  title="No Background"
                >
                  ⦸
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: '#666' }}>Width:</span>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={person.coupleBoxStyle?.borderThickness || 4}
                  onChange={(e) => {
                    updatePerson(personId, {
                      coupleBoxStyle: {
                        ...person.coupleBoxStyle,
                        borderThickness: parseInt(e.target.value)
                      }
                    });
                  }}
                  style={{ width: '80px' }}
                />
                <span style={{ fontSize: '13px', color: '#333', minWidth: '30px' }}>
                  {person.coupleBoxStyle?.borderThickness || 4}px
                </span>
              </div>

              <button
                onClick={() => setShowBoxToolbar(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#999',
                  padding: '4px 8px'
                }}
              >
                ×
              </button>
            </div>,
            document.body
          )}
        </div>
      ) : (
        <PersonCard key={`person-${personId}`} personId={personId} />
      )}

      {children.length > 0 && (
        <ul>
          {children.map(child => (
            <TreeNode key={child.id} personId={child.id} />
          ))}
        </ul>
      )}
    </li>
  );
};

const FamilyTree = () => {
  const { getRootPerson, isLoading, familyData, getChildren } = useFamilyTree();
  const root = getRootPerson();

  // Calculate tree depth (number of generations)
  const calculateTreeDepth = (personId, currentDepth = 1) => {
    const children = getChildren(personId);
    if (children.length === 0) {
      return currentDepth;
    }
    const childDepths = children.map(child => calculateTreeDepth(child.id, currentDepth + 1));
    return Math.max(...childDepths);
  };

  // Calculate scale factor based on tree depth
  const getScaleFactor = (depth) => {
    if (depth <= 3) return 1; // No scaling for 1-3 generations
    if (depth === 4) return 0.9; // 90% size for 4 generations
    if (depth === 5) return 0.8; // 80% size for 5 generations
    if (depth === 6) return 0.7; // 70% size for 6 generations
    return 0.65; // 65% size for 7+ generations
  };

  const treeDepth = root ? calculateTreeDepth(root.id) : 1;
  const scaleFactor = getScaleFactor(treeDepth);

  if (isLoading) {
    return (
      <div className="tree-container" id="treeContainer">
        <div className="tree-loader">
          <div className="loader-spinner"></div>
          <p>Loading your family tree...</p>
        </div>
      </div>
    );
  }

  if (!root) {
    return <div className="tree">No family data available</div>;
  }

  return (
    <div className="tree-container" id="treeContainer">
      {treeDepth > 3 && (
        <div
          style={{
            position: 'fixed',
            bottom: '40px',
            right: '15px',
            background: 'linear-gradient(135deg, #064468 0%, #005580 100%)',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '16px',
            fontSize: '11px',
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            zIndex: 900,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span style={{ fontSize: '14px' }}>📐</span>
          <span>{treeDepth} Gen - {Math.round(scaleFactor * 100)}% scale</span>
        </div>
      )}
      <div
        id="familyTree"
        className="tree"
        style={{
          '--tree-scale': scaleFactor,
          '--card-width': `${180 * scaleFactor}px`,
          '--card-height': `${200 * scaleFactor}px`,
          '--photo-size': `${55 * scaleFactor}px`,
          '--font-size-name': `${0.9 * scaleFactor}rem`,
          '--font-size-details': `${0.72 * scaleFactor}rem`,
          '--couple-gap': `${25 * scaleFactor}px`,
          '--box-padding': `${18 * scaleFactor}px`
        }}
      >
        <ul>
          <TreeNode personId={root.id} />
        </ul>
      </div>
    </div>
  );
};

export default FamilyTree;
