import React, { useState, useEffect } from 'react';

const FloatingTextToolbar = ({ isOpen, position, onClose, onFormat, currentStyles }) => {
  // Helper to extract numeric fontSize from "16px" or "16"
  const extractFontSize = (size) => {
    if (!size) return '16';
    return typeof size === 'string' ? size.replace('px', '') : String(size);
  };

  const [fontFamily, setFontFamily] = useState(currentStyles?.fontFamily || 'Arial');
  const [fontSize, setFontSize] = useState(extractFontSize(currentStyles?.fontSize));
  const [isBold, setIsBold] = useState(currentStyles?.fontWeight === 'bold');
  const [isItalic, setIsItalic] = useState(currentStyles?.fontStyle === 'italic');
  const [isUnderline, setIsUnderline] = useState(currentStyles?.textDecoration?.includes('underline'));
  const [isStrikethrough, setIsStrikethrough] = useState(currentStyles?.textDecoration?.includes('line-through'));
  const [textColor, setTextColor] = useState(currentStyles?.color || '#ffffff');

  useEffect(() => {
    if (currentStyles) {
      setFontFamily(currentStyles.fontFamily || 'Arial');
      setFontSize(extractFontSize(currentStyles.fontSize));
      setIsBold(currentStyles.fontWeight === 'bold');
      setIsItalic(currentStyles.fontStyle === 'italic');
      setIsUnderline(currentStyles.textDecoration?.includes('underline'));
      setIsStrikethrough(currentStyles.textDecoration?.includes('line-through'));
      setTextColor(currentStyles.color || '#ffffff');
    }
  }, [currentStyles]);

  const handleApply = (updates) => {
    const textDecoration = [];
    const updatedUnderline = updates.hasOwnProperty('underline') ? updates.underline : isUnderline;
    const updatedStrikethrough = updates.hasOwnProperty('strikethrough') ? updates.strikethrough : isStrikethrough;

    if (updatedUnderline) textDecoration.push('underline');
    if (updatedStrikethrough) textDecoration.push('line-through');

    const finalFontSize = updates.fontSize || fontSize;
    const formattedStyles = {
      fontFamily: updates.fontFamily || fontFamily,
      fontSize: finalFontSize.includes('px') ? finalFontSize : `${finalFontSize}px`,
      fontWeight: (updates.hasOwnProperty('bold') ? updates.bold : isBold) ? 'bold' : 'normal',
      fontStyle: (updates.hasOwnProperty('italic') ? updates.italic : isItalic) ? 'italic' : 'normal',
      textDecoration: textDecoration.length > 0 ? textDecoration.join(' ') : 'none',
      color: updates.color || textColor
    };

    console.log('FloatingTextToolbar sending styles:', formattedStyles);
    onFormat(formattedStyles);
  };

  const toggleBold = () => {
    const newBold = !isBold;
    setIsBold(newBold);
    handleApply({ bold: newBold });
  };

  const toggleItalic = () => {
    const newItalic = !isItalic;
    setIsItalic(newItalic);
    handleApply({ italic: newItalic });
  };

  const toggleUnderline = () => {
    const newUnderline = !isUnderline;
    setIsUnderline(newUnderline);
    handleApply({ underline: newUnderline });
  };

  const toggleStrikethrough = () => {
    const newStrikethrough = !isStrikethrough;
    setIsStrikethrough(newStrikethrough);
    handleApply({ strikethrough: newStrikethrough });
  };

  const handleFontFamilyChange = (e) => {
    const newFont = e.target.value;
    setFontFamily(newFont);
    handleApply({ fontFamily: newFont });
  };

  const handleFontSizeChange = (e) => {
    const newSize = e.target.value;
    setFontSize(newSize);
    handleApply({ fontSize: newSize });
  };

  const handleColorChange = (e) => {
    const newColor = e.target.value;
    setTextColor(newColor);
    handleApply({ color: newColor });
  };

  if (!isOpen) return null;

  return (
    <div
      className="floating-font-toolbar show"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Font Family Dropdown */}
      <select
        className="toolbar-select"
        value={fontFamily}
        onChange={handleFontFamilyChange}
      >
        <option value="Arial">Arial</option>
        <option value="Helvetica">Helvetica</option>
        <option value="Times New Roman">Times New Roman</option>
        <option value="Georgia">Georgia</option>
        <option value="Courier New">Courier New</option>
        <option value="Verdana">Verdana</option>
        <option value="Comic Sans MS">Comic Sans MS</option>
      </select>

      {/* Font Size Dropdown */}
      <select
        className="toolbar-select-small"
        value={fontSize}
        onChange={handleFontSizeChange}
      >
        <option value="10">10</option>
        <option value="12">12</option>
        <option value="14">14</option>
        <option value="16">16</option>
        <option value="18">18</option>
        <option value="20">20</option>
        <option value="24">24</option>
        <option value="28">28</option>
        <option value="32">32</option>
      </select>

      <div className="toolbar-separator"></div>

      {/* Bold */}
      <button
        className={`toolbar-btn ${isBold ? 'active' : ''}`}
        onClick={toggleBold}
        title="Bold"
      >
        <strong>B</strong>
      </button>

      {/* Italic */}
      <button
        className={`toolbar-btn ${isItalic ? 'active' : ''}`}
        onClick={toggleItalic}
        title="Italic"
      >
        <em>I</em>
      </button>

      {/* Underline */}
      <button
        className={`toolbar-btn ${isUnderline ? 'active' : ''}`}
        onClick={toggleUnderline}
        title="Underline"
      >
        <u>U</u>
      </button>

      <div className="toolbar-separator"></div>

      {/* Text Color */}
      <div className="toolbar-color-dropdown">
        <input
          type="color"
          id="floatTextColor"
          value={textColor}
          onChange={handleColorChange}
        />
        <label htmlFor="floatTextColor" className="toolbar-color-btn">
          <span className="color-icon">A</span>
          <span className="color-bar" style={{ background: textColor }}></span>
        </label>
      </div>

      {/* Strikethrough */}
      <button
        className={`toolbar-btn ${isStrikethrough ? 'active' : ''}`}
        onClick={toggleStrikethrough}
        title="Strikethrough"
      >
        <s>S</s>
      </button>

      <div className="toolbar-separator"></div>

      {/* Close Button */}
      <button
        className="toolbar-btn-close"
        onClick={onClose}
        title="Close"
      >
        ×
      </button>
    </div>
  );
};

export default FloatingTextToolbar;
