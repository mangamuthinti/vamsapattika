import React, { useState, useRef, useEffect } from 'react';
import CustomAlert from './CustomAlert';
import '../styles/PhotoEditor.css';

const PhotoEditor = ({ isOpen, onClose, imageUrl, onSave }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [alertState, setAlertState] = useState({ isOpen: false, message: '' });
  const containerRef = useRef(null);
  const imageRef = useRef(null);

  // Reset position and scale when modal opens
  useEffect(() => {
    if (isOpen) {
      setPosition({ x: 0, y: 0 });
      setScale(1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleMouseDown = (e) => {
    if (e.target === imageRef.current) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart, position]);

  const handleSave = () => {
    if (!imageUrl) {
      setAlertState({ isOpen: true, message: 'No image to save' });
      return;
    }

    try {
      console.log('💾 Starting save process...');
      console.log('📍 Position:', position, 'Scale:', scale);

      const tempImg = new Image();

      tempImg.onerror = () => {
        console.error('❌ Failed to load image');
        setAlertState({ isOpen: true, message: 'Failed to process image. Please try again.' });
      };

      tempImg.onload = () => {
        try {
          console.log('✅ Image loaded, creating canvas...');
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Set canvas size (150x150 to match photo container)
          canvas.width = 150;
          canvas.height = 150;

          const imgWidth = tempImg.naturalWidth;
          const imgHeight = tempImg.naturalHeight;
          console.log(`📐 Image dimensions: ${imgWidth}x${imgHeight}`);

          // Container is 300x300, crop area is 150x150 (centered)
          const containerSize = 300;
          const cropSize = 150;
          const cropX = (containerSize - cropSize) / 2; // 75
          const cropY = (containerSize - cropSize) / 2; // 75

          // Calculate how the image fits in the container
          const fitScale = Math.max(containerSize / imgWidth, containerSize / imgHeight);
          const displayWidth = imgWidth * fitScale * scale;
          const displayHeight = imgHeight * fitScale * scale;

          // Calculate starting position (centered if no drag)
          const startX = (containerSize - displayWidth) / 2 + position.x;
          const startY = (containerSize - displayHeight) / 2 + position.y;

          // Calculate which part of the original image is in the crop area
          const sourceX = Math.max(0, (cropX - startX) / (fitScale * scale));
          const sourceY = Math.max(0, (cropY - startY) / (fitScale * scale));
          const sourceW = cropSize / (fitScale * scale);
          const sourceH = cropSize / (fitScale * scale);

          console.log(`✂️ Source crop: (${sourceX.toFixed(1)}, ${sourceY.toFixed(1)}) ${sourceW.toFixed(1)}x${sourceH.toFixed(1)}`);

          // Fill white background
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, 150, 150);

          // Draw the cropped portion
          ctx.drawImage(
            tempImg,
            sourceX, sourceY, sourceW, sourceH,
            0, 0, 150, 150
          );

          const croppedImage = canvas.toDataURL('image/jpeg', 0.95);
          console.log(`📸 Cropped image size: ${croppedImage.length} characters`);

          if (croppedImage && croppedImage.startsWith('data:image') && croppedImage.length > 1000) {
            console.log('✅ Image valid, calling onSave...');
            onSave(croppedImage);
          } else {
            console.error('❌ Invalid cropped image');
            setAlertState({ isOpen: true, message: 'Failed to process image. Please try again.' });
          }
        } catch (err) {
          console.error('❌ Error in canvas processing:', err);
          setAlertState({ isOpen: true, message: 'Failed to process image: ' + err.message });
        }
      };

      tempImg.src = imageUrl;
    } catch (err) {
      console.error('❌ Error in handleSave:', err);
      setAlertState({ isOpen: true, message: 'Failed to process image: ' + err.message });
    }
  };

  const handleReset = () => {
    setPosition({ x: 0, y: 0 });
    setScale(1);
  };

  return (
    <>
      <CustomAlert
        isOpen={alertState.isOpen}
        message={alertState.message}
        onClose={() => setAlertState({ isOpen: false, message: '' })}
      />
      <div className="photo-editor-overlay" onClick={onClose}>
        <div className="photo-editor-modal" onClick={(e) => e.stopPropagation()}>
        <div className="photo-editor-header">
          <h3>Crop Photo</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="photo-editor-content">
          <div className="editor-preview-container" ref={containerRef}>
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Preview"
              className="editor-image"
              style={{
                transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) scale(${scale})`,
                cursor: isDragging ? 'grabbing' : 'grab'
              }}
              onMouseDown={handleMouseDown}
              draggable={false}
            />
            <div className="crop-guide"></div>
          </div>

          <div className="editor-controls">
            <div className="control-group">
              <label>Zoom</label>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
              />
              <span>{(scale * 100).toFixed(0)}%</span>
            </div>

            <div className="editor-instructions">
              <p>📌 <strong>Drag</strong> the image to reposition</p>
              <p>🔍 Use the <strong>zoom slider</strong> to resize</p>
              <p>📐 Final size: <strong>150x150 pixels</strong></p>
            </div>
          </div>
        </div>

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
    </>
  );
};

export default PhotoEditor;
