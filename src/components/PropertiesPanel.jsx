import React, { useState } from 'react';
import { useFamilyTree } from '../context/FamilyTreeContext';
import CustomAlert from './CustomAlert';
import PhotoEditorNew from './PhotoEditorNew';

const PropertiesPanel = () => {
  const { selectedPerson, familyData, setSelectedPerson, updatePerson, modalState, globalShowPhotos } = useFamilyTree();

  const person = selectedPerson ? familyData[selectedPerson] : null;

  // Hide properties panel when modal is open
  if (modalState.isOpen) {
    return null;
  }

  const [formData, setFormData] = useState({
    name: person?.name || '',
    birthDate: person?.birthDate || '',
    deathDate: person?.deathDate || '',
    occupation: person?.occupation || '',
    gender: person?.gender || 'male'
  });

  const [colors, setColors] = useState({
    fill: person?.customColors?.background || '#667eea',
    border: person?.customColors?.border || '#764ba2',
    text: person?.customColors?.text || '#ffffff'
  });

  const [gradient, setGradient] = useState({
    color1: '#667eea',
    color2: '#764ba2',
    direction: 'diagonal-down'
  });

  const [alertState, setAlertState] = useState({
    isOpen: false,
    message: ''
  });

  const [dragActive, setDragActive] = useState(false);
  const [photoEditorOpen, setPhotoEditorOpen] = useState(false);
  const [tempPhotoUrl, setTempPhotoUrl] = useState(null);

  // Update form data when person changes
  React.useEffect(() => {
    if (person) {
      setFormData({
        name: person.name || '',
        birthDate: person.birthDate || '',
        deathDate: person.deathDate || '',
        occupation: person.occupation || '',
        gender: person.gender || 'male'
      });

      // Extract colors - handle gradients
      let fillColor = '#667eea';
      if (person.customColors?.background) {
        if (person.customColors.background.startsWith('linear-gradient')) {
          fillColor = person.customColors.background;
        } else {
          fillColor = person.customColors.background;
        }
      }

      setColors({
        fill: fillColor,
        border: person.customColors?.border || '#764ba2',
        text: person.customColors?.text || '#ffffff'
      });
    }
  }, [person]);

  const closePanel = () => {
    setSelectedPerson(null);
  };

  const handleInputChange = (field, value) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    if (selectedPerson) {
      updatePerson(selectedPerson, { [field]: value });
    }
  };

  const handleShapeChange = (shape) => {
    // Check if shape is coming soon
    if (shape === 'apple' || shape === 'rose' || shape === 'sunflower') {
      setAlertState({
        isOpen: true,
        message: 'This shape will be available in the upcoming release. Stay tuned!'
      });
      return;
    }

    if (selectedPerson) {
      console.log('Changing shape for person:', selectedPerson, 'to:', shape);
      updatePerson(selectedPerson, { shape });

      // Apply to spouse as well (like HTML version)
      const selectedPersonData = familyData[selectedPerson];
      if (selectedPersonData?.spouse) {
        updatePerson(selectedPersonData.spouse, { shape });
      }
    }
  };

  const handleColorChange = (colorType, value) => {
    const newColors = { ...colors, [colorType]: value };
    setColors(newColors);
    if (selectedPerson) {
      console.log('Changing color for person:', selectedPerson, 'colorType:', colorType, 'value:', value);
      const colorUpdate = {
        customColors: {
          background: newColors.fill,
          border: newColors.border,
          text: newColors.text
        }
      };

      updatePerson(selectedPerson, colorUpdate);

      // Apply to spouse as well (like HTML version)
      const selectedPersonData = familyData[selectedPerson];
      if (selectedPersonData?.spouse) {
        updatePerson(selectedPersonData.spouse, colorUpdate);
      }
    }
  };

  const applyGradientPreset = (preset) => {
    const presets = {
      blue: { color1: '#667eea', color2: '#764ba2' },
      sunset: { color1: '#fa709a', color2: '#fee140' },
      mint: { color1: '#0fd850', color2: '#00b4d8' },
      rose: { color1: '#ff6b9d', color2: '#ffc371' }
    };

    const { color1, color2 } = presets[preset];
    const gradientBg = `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;

    if (selectedPerson) {
      const colorUpdate = {
        customColors: {
          background: gradientBg,
          border: color1,
          text: '#ffffff'
        }
      };

      updatePerson(selectedPerson, colorUpdate);
      setColors({
        fill: gradientBg,
        border: color1,
        text: '#ffffff'
      });

      // Apply to spouse as well (like HTML version)
      const selectedPersonData = familyData[selectedPerson];
      if (selectedPersonData?.spouse) {
        updatePerson(selectedPersonData.spouse, colorUpdate);
      }
    }
  };

  const applyCustomGradient = () => {
    const directions = {
      'diagonal-down': '135deg',
      'left-to-right': '90deg',
      'top-to-bottom': '180deg',
      'diagonal-up': '45deg',
      'right-to-left': '270deg',
      'bottom-to-top': '0deg'
    };

    const gradientBg = `linear-gradient(${directions[gradient.direction]}, ${gradient.color1} 0%, ${gradient.color2} 100%)`;

    if (selectedPerson) {
      const colorUpdate = {
        customColors: {
          background: gradientBg,
          border: gradient.color1,
          text: colors.text
        }
      };

      updatePerson(selectedPerson, colorUpdate);
      setColors({
        ...colors,
        fill: gradientBg,
        border: gradient.color1
      });

      // Apply to spouse as well (like HTML version)
      const selectedPersonData = familyData[selectedPerson];
      if (selectedPersonData?.spouse) {
        updatePerson(selectedPersonData.spouse, colorUpdate);
      }
    }
  };

  const processPhotoFile = (file) => {
    if (!file || !selectedPerson) return;

    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      setAlertState({
        isOpen: true,
        message: 'Please upload an image file (JPG, PNG, etc.)'
      });
      return;
    }

    // Check file size (max 1MB = 1048576 bytes)
    const maxSize = 1 * 1024 * 1024; // 1MB in bytes
    if (file.size > maxSize) {
      setAlertState({
        isOpen: true,
        message: `Image size is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Please upload an image smaller than 1MB.`
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      console.log('📸 Photo loaded, opening NEW editor');
      // Open the NEW photo editor popup
      setTempPhotoUrl(reader.result);
      setPhotoEditorOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoSave = (croppedImage) => {
    try {
      console.log('💾 Saving photo for person:', selectedPerson);
      console.log('📸 Photo data length:', croppedImage?.length);

      if (!selectedPerson) {
        console.error('❌ No person selected');
        return;
      }

      if (!croppedImage || croppedImage.length < 100) {
        console.error('❌ Invalid image data');
        setAlertState({ isOpen: true, message: 'Failed to save photo. Please try again.' });
        return;
      }

      // Save the photo
      updatePerson(selectedPerson, { photo: croppedImage });
      console.log('✅ Photo saved successfully');

      // Close editor
      setPhotoEditorOpen(false);
      setTempPhotoUrl(null);
    } catch (err) {
      console.error('❌ Error saving photo:', err);
      setAlertState({ isOpen: true, message: 'Failed to save photo. Please try again.' });
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    processPhotoFile(file);
    // Clear the input
    e.target.value = '';
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processPhotoFile(e.dataTransfer.files[0]);
    }
  };

  const resetAllStyles = () => {
    if (selectedPerson) {
      updatePerson(selectedPerson, {
        shape: 'apple',
        customColors: {}
      });
      setColors({
        fill: '#667eea',
        border: '#764ba2',
        text: '#ffffff'
      });
    }
  };

  const shapes = [
    { id: 'rectangle', label: 'Rectangle' },
    { id: 'rounded', label: 'Rounded' },
    { id: 'circle', label: 'Circle' },
    { id: 'hexagon', label: 'Hexagon' },
    { id: 'apple', label: 'Apple' },
    { id: 'sunflower', label: 'Sunflower' },
    { id: 'rose', label: 'Rose' }
  ];

  return (
    <>
      <CustomAlert
        isOpen={alertState.isOpen}
        message={alertState.message}
        onClose={() => setAlertState({ isOpen: false, message: '' })}
      />
      <div className={`properties-panel ${selectedPerson ? 'show' : ''}`}>
        <div className="panel-header">
          <span className="panel-title">Properties</span>
          <span className="panel-close" onClick={closePanel}>×</span>
        </div>
      <div className="panel-content">
        {!person ? (
          <div className="no-selection">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <p>Select a person to view properties</p>
          </div>
        ) : (
          <div>
            {/* BASIC INFO */}
            <div className="property-section">
              <div className="section-header">BASIC INFO</div>

              <div className="property-row">
                <span className="property-row-label">Name</span>
              </div>
              <input
                type="text"
                className="property-input"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div className="property-row">
                    <span className="property-row-label">Birth Date</span>
                  </div>
                  <input
                    type="date"
                    className="property-input"
                    value={formData.birthDate}
                    onChange={(e) => handleInputChange('birthDate', e.target.value)}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <div className="property-row">
                    <span className="property-row-label">Death Date</span>
                  </div>
                  <input
                    type="date"
                    className="property-input"
                    value={formData.deathDate}
                    onChange={(e) => handleInputChange('deathDate', e.target.value)}
                  />
                </div>
              </div>

              <div className="property-row" style={{ marginTop: '12px' }}>
                <span className="property-row-label">Occupation</span>
              </div>
              <input
                type="text"
                className="property-input"
                value={formData.occupation}
                onChange={(e) => handleInputChange('occupation', e.target.value)}
                placeholder="e.g., Farmer"
              />

              <div className="property-row" style={{ marginTop: '12px' }}>
                <span className="property-row-label">Gender</span>
              </div>
              <select
                className="property-input"
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>

              {/* Marriage Date - Only show if person has a spouse */}
              {person.spouse && (
                <>
                  <div className="property-row" style={{ marginTop: '12px' }}>
                    <span className="property-row-label">Marriage Date & Time</span>
                  </div>
                  <input
                    type="datetime-local"
                    className="property-input"
                    value={person.marriageDate || familyData[person.spouse]?.marriageDate || ''}
                    onChange={(e) => {
                      updatePerson(selectedPerson, { marriageDate: e.target.value });
                      // Also update spouse's marriage date
                      updatePerson(person.spouse, { marriageDate: e.target.value });
                    }}
                  />
                </>
              )}
            </div>

            {/* PHOTO - Only show if globalShowPhotos is true */}
            {globalShowPhotos && (
              <div className="property-section">
                <div className="section-header">PHOTO</div>
                {person.photo && person.photo !== '' ? (
                  // Has uploaded photo
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    style={{
                      border: dragActive ? '2px dashed #1976d2' : '2px dashed transparent',
                      borderRadius: '8px',
                      padding: '10px',
                      backgroundColor: dragActive ? 'rgba(25, 118, 210, 0.05)' : 'transparent',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ textAlign: 'center', marginBottom: '15px', position: 'relative' }}>
                      <img
                        src={person.photo}
                        alt={person.name}
                        style={{
                          width: '150px',
                          height: '150px',
                          objectFit: 'cover',
                          borderRadius: '50%',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          opacity: dragActive ? 0.5 : 1,
                          transition: 'opacity 0.2s'
                        }}
                      />
                      {dragActive && (
                        <div style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          color: '#1976d2',
                          fontSize: '14px',
                          fontWeight: '500',
                          backgroundColor: 'white',
                          padding: '10px 20px',
                          borderRadius: '8px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                        }}>
                          📤 Drop to replace
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      id="photoUpload"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handlePhotoUpload}
                    />
                    <button
                      className="btn-apply-color"
                      style={{ width: '100%', padding: '12px', marginBottom: '10px' }}
                      onClick={() => document.getElementById('photoUpload').click()}
                    >
                      Change Photo or Drag Here
                    </button>
                    <button
                      className="btn-apply-color"
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: '#f5f5f5',
                        color: '#666'
                      }}
                      onClick={() => updatePerson(selectedPerson, { photo: null })}
                    >
                      Remove Photo
                    </button>
                  </div>
                ) : person.photo === '' ? (
                  // Default photo removed - show restore option
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    style={{
                      border: dragActive ? '2px dashed #1976d2' : '2px dashed transparent',
                      borderRadius: '8px',
                      padding: '10px',
                      backgroundColor: dragActive ? 'rgba(25, 118, 210, 0.05)' : 'transparent',
                      transition: 'all 0.2s'
                    }}
                  >
                    <input
                      type="file"
                      id="photoUpload"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handlePhotoUpload}
                    />
                    {dragActive && (
                      <div style={{
                        textAlign: 'center',
                        padding: '20px',
                        color: '#1976d2',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}>
                        📤 Drop image here
                      </div>
                    )}
                    <button
                      className="btn-apply-color"
                      style={{ width: '100%', padding: '12px', marginBottom: '10px' }}
                      onClick={() => document.getElementById('photoUpload').click()}
                    >
                      Upload Photo or Drag Here
                    </button>
                    <button
                      className="btn-apply-color"
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: '#e3f2fd',
                        color: '#1976d2'
                      }}
                      onClick={() => updatePerson(selectedPerson, { photo: null })}
                    >
                      Restore Default Photo
                    </button>
                  </div>
                ) : (
                  // Default state - has default photo icon
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    style={{
                      border: dragActive ? '2px dashed #1976d2' : '2px dashed transparent',
                      borderRadius: '8px',
                      padding: '10px',
                      backgroundColor: dragActive ? 'rgba(25, 118, 210, 0.05)' : 'transparent',
                      transition: 'all 0.2s'
                    }}
                  >
                    <input
                      type="file"
                      id="photoUpload"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handlePhotoUpload}
                    />
                    {dragActive && (
                      <div style={{
                        textAlign: 'center',
                        padding: '20px',
                        color: '#1976d2',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}>
                        📤 Drop image here
                      </div>
                    )}
                    <button
                      className="btn-apply-color"
                      style={{ width: '100%', padding: '12px', marginBottom: '10px' }}
                      onClick={() => document.getElementById('photoUpload').click()}
                    >
                      Upload Photo or Drag Here
                    </button>
                    <button
                      className="btn-apply-color"
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: '#f5f5f5',
                        color: '#666'
                      }}
                      onClick={() => updatePerson(selectedPerson, { photo: '' })}
                    >
                      Remove Default Photo
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* PHOTO SHAPE - Only show if photo exists and globalShowPhotos is true */}
            {globalShowPhotos && person.photo && person.photo !== '' && (
              <>
                <div className="property-section">
                  <div className="section-header">PHOTO SHAPE</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                    {[
                      { id: 'circle', label: 'Circle' },
                      { id: 'square', label: 'Square' },
                      { id: 'rounded', label: 'Rounded' },
                      { id: 'diamond', label: 'Diamond' }
                    ].map((photoShape) => (
                      <button
                        key={photoShape.id}
                        className={`photo-shape-btn photo-shape-btn-${photoShape.id} ${person.photoShape === photoShape.id ? 'active' : ''}`}
                        onClick={() => {
                          updatePerson(selectedPerson, { photoShape: photoShape.id });
                          // Apply to spouse as well
                          const selectedPersonData = familyData[selectedPerson];
                          if (selectedPersonData?.spouse) {
                            updatePerson(selectedPersonData.spouse, { photoShape: photoShape.id });
                          }
                        }}
                        title={photoShape.label}
                      >
                        <div className={`photo-shape-preview photo-shape-preview-${photoShape.id}`}></div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* FRAME SHAPE */}
            <div className="property-section">
              <div className="section-header">FRAME SHAPE</div>
              <div className="shape-options">
                {shapes.map((shape) => (
                  <div
                    key={shape.id}
                    className={`shape-btn ${person.shape === shape.id ? 'active' : ''}`}
                    onClick={() => handleShapeChange(shape.id)}
                  >
                    <div className={`shape-preview shape-preview-${shape.id}`}></div>
                  </div>
                ))}
              </div>
            </div>

            {/* COLORS */}
            <div className="property-section">
              <div className="section-header">COLORS</div>

              <div className="colors-grid">
                <div className="color-item">
                  <div className="color-label">Fill</div>
                  <input
                    type="color"
                    className="color-input"
                    value={colors.fill.startsWith('linear-gradient') ? '#667eea' : colors.fill}
                    onChange={(e) => handleColorChange('fill', e.target.value)}
                  />
                </div>

                <div className="color-item">
                  <div className="color-label">Border</div>
                  <input
                    type="color"
                    className="color-input"
                    value={colors.border}
                    onChange={(e) => handleColorChange('border', e.target.value)}
                  />
                </div>

                <div className="color-item">
                  <div className="color-label">Text</div>
                  <input
                    type="color"
                    className="color-input"
                    value={colors.text}
                    onChange={(e) => handleColorChange('text', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* GRADIENT COLORS */}
            <div className="property-section">
              <div className="section-header">Gradient Colors</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                <button
                  className="gradient-preset-btn"
                  style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                  onClick={() => applyGradientPreset('blue')}
                >
                  Blue
                </button>
                <button
                  className="gradient-preset-btn"
                  style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}
                  onClick={() => applyGradientPreset('sunset')}
                >
                  Sunset
                </button>
                <button
                  className="gradient-preset-btn"
                  style={{ background: 'linear-gradient(135deg, #0fd850 0%, #00b4d8 100%)' }}
                  onClick={() => applyGradientPreset('mint')}
                >
                  Mint
                </button>
                <button
                  className="gradient-preset-btn"
                  style={{ background: 'linear-gradient(135deg, #ff6b9d 0%, #ffc371 100%)' }}
                  onClick={() => applyGradientPreset('rose')}
                >
                  Rose
                </button>
              </div>

              {/* Custom Gradient */}
              <div style={{ marginTop: '15px', padding: '15px', background: '#f9f9f9', borderRadius: '8px' }}>
                <div style={{ fontWeight: '600', marginBottom: '10px', fontSize: '13px' }}>Custom Gradient</div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: '#666' }}>Color 1</label>
                    <input
                      type="color"
                      className="color-input"
                      value={gradient.color1}
                      onChange={(e) => setGradient({ ...gradient, color1: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: '#666' }}>Color 2</label>
                    <input
                      type="color"
                      className="color-input"
                      value={gradient.color2}
                      onChange={(e) => setGradient({ ...gradient, color2: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <label style={{ fontSize: '12px', color: '#666' }}>Direction</label>
                  <select
                    className="property-input"
                    value={gradient.direction}
                    onChange={(e) => setGradient({ ...gradient, direction: e.target.value })}
                  >
                    <option value="diagonal-down">Diagonal ↘</option>
                    <option value="left-to-right">Left to Right →</option>
                    <option value="top-to-bottom">Top to Bottom ↓</option>
                    <option value="diagonal-up">Diagonal ↗</option>
                    <option value="right-to-left">Right to Left ←</option>
                    <option value="bottom-to-top">Bottom to Top ↑</option>
                  </select>
                </div>

                <div
                  style={{
                    height: '40px',
                    borderRadius: '6px',
                    marginBottom: '10px',
                    background: `linear-gradient(${
                      gradient.direction === 'diagonal-down' ? '135deg' :
                      gradient.direction === 'left-to-right' ? '90deg' :
                      gradient.direction === 'top-to-bottom' ? '180deg' :
                      gradient.direction === 'diagonal-up' ? '45deg' :
                      gradient.direction === 'right-to-left' ? '270deg' :
                      '0deg'
                    }, ${gradient.color1} 0%, ${gradient.color2} 100%)`
                  }}
                />

                <button
                  className="btn-apply-color"
                  style={{ width: '100%', padding: '10px' }}
                  onClick={applyCustomGradient}
                >
                  Apply Custom Gradient
                </button>
              </div>
            </div>

            {/* RESET */}
            <div className="property-section">
              <button
                className="btn-reset-style"
                onClick={resetAllStyles}
              >
                Reset All Styles
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Photo Editor Modal - NEW SAFE VERSION */}
      <PhotoEditorNew
        isOpen={photoEditorOpen}
        onClose={() => {
          setPhotoEditorOpen(false);
          setTempPhotoUrl(null);
        }}
        imageUrl={tempPhotoUrl}
        onSave={handlePhotoSave}
      />
    </div>
    </>
  );
};

export default PropertiesPanel;
