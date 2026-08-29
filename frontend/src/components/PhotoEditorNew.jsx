import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import CustomAlert from './CustomAlert';
import '../styles/PhotoEditor.css';

const PhotoEditorNew = ({ isOpen, onClose, imageUrl, onSave }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [alertState, setAlertState] = useState({ isOpen: false, message: '' });
  const canvasRef = useRef(null);
  const previewRef = useRef(null);
  const imageRef = useRef(null);

  if (!isOpen || !imageUrl) return null;

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleSave = () => {
    try {
      const img = new Image();

      img.onload = () => {
        try {
          const container = previewRef.current;
          const displayedImg = imageRef.current;

          if (!container || !displayedImg) {
            throw new Error('Elements not found');
          }

          // Get bounding boxes
          const containerRect = container.getBoundingClientRect();
          const imgRect = displayedImg.getBoundingClientRect();

          console.log('📦 Container rect:', containerRect);
          console.log('🖼️ Image rect:', imgRect);

          // Calculate image position relative to container
          const relativeX = imgRect.left - containerRect.left;
          const relativeY = imgRect.top - containerRect.top;

          console.log('📍 Image position in container:', relativeX, relativeY);
          console.log('📐 Image displayed size:', imgRect.width, 'x', imgRect.height);

          // Draw to temp canvas
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = 300;
          tempCanvas.height = 300;
          const tempCtx = tempCanvas.getContext('2d');

          // Calculate scale factor from displayed size to natural size
          const scaleX = img.width / imgRect.width;
          const scaleY = img.height / imgRect.height;

          console.log('📏 Scale factors:', scaleX, scaleY);

          // The crop area in container coordinates (center 150x150)
          const cropLeft = 75;
          const cropTop = 75;
          const cropSize = 150;

          // Calculate which part of the original image to use
          const sourceX = (cropLeft - relativeX) * scaleX;
          const sourceY = (cropTop - relativeY) * scaleY;
          const sourceW = cropSize * scaleX;
          const sourceH = cropSize * scaleY;

          console.log('✂️ Source crop:', sourceX, sourceY, sourceW, sourceH);

          // Create output
          const outputCanvas = document.createElement('canvas');
          outputCanvas.width = 150;
          outputCanvas.height = 150;
          const outputCtx = outputCanvas.getContext('2d');

          // Draw the cropped portion
          outputCtx.drawImage(
            img,
            sourceX,
            sourceY,
            sourceW,
            sourceH,
            0,
            0,
            150,
            150
          );

          const dataUrl = outputCanvas.toDataURL('image/jpeg', 0.9);

          if (dataUrl && dataUrl.length > 100) {
            console.log('✅ Saved!');
            onSave(dataUrl);
            onClose();
          } else {
            throw new Error('Invalid image data');
          }
        } catch (err) {
          console.error('❌ Error:', err);
          setAlertState({ isOpen: true, message: 'Failed to crop. Please try again.' });
        }
      };

      img.onerror = () => {
        setAlertState({ isOpen: true, message: 'Failed to load image. Please try again.' });
      };

      img.src = imageUrl;
    } catch (err) {
      console.error('Save error:', err);
      setAlertState({ isOpen: true, message: 'Failed to save image. Please try again.' });
    }
  };

  const modal = (
    <div
      className="photo-editor-overlay"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div className="photo-editor-modal" onClick={(e) => e.stopPropagation()}>
        <div className="photo-editor-header">
          <h3>Crop Photo</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="photo-editor-content">
          {/* Preview Area */}
          <div className="editor-preview-container" ref={previewRef}>
            <div
              className="editor-image-wrapper"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                cursor: isDragging ? 'grabbing' : 'grab'
              }}
              onMouseDown={handleMouseDown}
            >
              <img
                ref={imageRef}
                src={imageUrl}
                alt="Preview"
                draggable={false}
                style={{ display: 'block', userSelect: 'none' }}
              />
            </div>
            {/* Crop guide - circular overlay */}
            <div className="crop-guide"></div>
          </div>

          {/* Controls */}
          <div className="editor-controls">
            <div className="control-group">
              <label>Zoom</label>
              <button
                className="zoom-btn"
                onClick={() => setScale(Math.max(0.5, scale - 0.1))}
                disabled={scale <= 0.5}
              >
                −
              </button>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
              />
              <button
                className="zoom-btn"
                onClick={() => setScale(Math.min(3, scale + 0.1))}
                disabled={scale >= 3}
              >
                +
              </button>
              <span>{Math.round(scale * 100)}%</span>
            </div>

            <div className="editor-instructions">
              <p>📌 <strong>Drag</strong> the image to reposition</p>
              <p>🔍 Use <strong>+/− buttons or slider</strong> to zoom</p>
              <p>⭕ White circle shows the final crop area</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="photo-editor-actions">
          <button className="btn-secondary" onClick={handleReset}>
            Reset
          </button>
          <button className="btn-primary" onClick={handleSave}>
            Save & Crop
          </button>
        </div>
      </div>
    </div>
  );

  // Render to document.body to ensure it's centered on screen
  return (
    <>
      <CustomAlert
        isOpen={alertState.isOpen}
        message={alertState.message}
        onClose={() => setAlertState({ isOpen: false, message: '' })}
      />
      {ReactDOM.createPortal(modal, document.body)}
    </>
  );
};

export default PhotoEditorNew;
