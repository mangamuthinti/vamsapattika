import React, { useState, useEffect } from 'react';
import { treesAPI } from '../api/trees';
import CustomAlert from './CustomAlert';
import JSZip from 'jszip';
import '../styles/PhotoGallery.css';

const PhotoGallery = ({ isOpen, onClose, treeId }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alertState, setAlertState] = useState({ isOpen: false, message: '' });
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    if (isOpen && treeId) {
      loadPhotos();
    }
  }, [isOpen, treeId]);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      const data = await treesAPI.getPhotos(treeId);
      setPhotos(data.photos || []);
    } catch (error) {
      console.error('Error loading photos:', error);
      setAlertState({
        isOpen: true,
        message: 'Failed to load photos. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadPhoto = (photo, personName) => {
    try {
      const link = document.createElement('a');
      link.href = photo;
      link.download = `${personName.replace(/\s+/g, '_')}_photo.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading photo:', error);
      setAlertState({
        isOpen: true,
        message: 'Failed to download photo. Please try again.'
      });
    }
  };

  const downloadAllPhotos = async () => {
    if (photos.length === 0) {
      setAlertState({
        isOpen: true,
        message: 'No photos to download.'
      });
      return;
    }

    try {
      const zip = new JSZip();

      // Add each photo to the zip
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];

        // Convert base64 to blob
        const base64Data = photo.photo.split(',')[1];
        const mimeType = photo.photo.match(/data:(.*?);/)[1];
        const extension = mimeType.includes('png') ? 'png' : 'jpg';

        // Add to zip with filename
        zip.file(`photo_${photo.id}.${extension}`, base64Data, { base64: true });
      }

      // Generate zip file
      const zipBlob = await zip.generateAsync({ type: 'blob' });

      // Download the zip file
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = `vamsapattika_photos_${treeId}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Error downloading all photos:', error);
      setAlertState({
        isOpen: true,
        message: 'Failed to download all photos. Please try again.'
      });
    }
  };

  const openPhotoModal = (photo) => {
    setSelectedPhoto(photo);
  };

  const closePhotoModal = () => {
    setSelectedPhoto(null);
  };

  if (!isOpen) return null;

  return (
    <>
      <CustomAlert
        isOpen={alertState.isOpen}
        message={alertState.message}
        onClose={() => setAlertState({ isOpen: false, message: '' })}
      />

      <div className="photo-gallery-overlay" onClick={onClose}>
        <div className="photo-gallery-modal" onClick={(e) => e.stopPropagation()}>
          <div className="photo-gallery-header">
            <h2>Family Photos Gallery</h2>
            <div className="photo-gallery-actions">
              {photos.length > 0 && (
                <button
                  className="download-all-btn"
                  onClick={downloadAllPhotos}
                  title="Download all photos"
                >
                  📥 Download All ({photos.length})
                </button>
              )}
              <button className="close-gallery-btn" onClick={onClose}>
                ✕
              </button>
            </div>
          </div>

          <div className="photo-gallery-content">
            {loading ? (
              <div className="gallery-loading">
                <div className="loader-spinner"></div>
                <p>Loading photos...</p>
              </div>
            ) : photos.length === 0 ? (
              <div className="gallery-empty">
                <div className="empty-icon">📷</div>
                <h3>No Photos Yet</h3>
                <p>Add photos to your family members to see them here</p>
              </div>
            ) : (
              <div className="photo-gallery-grid">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="photo-gallery-item"
                  >
                    <img
                      src={photo.photo}
                      alt={`Family member ${photo.id}`}
                      className="gallery-photo"
                      onClick={() => openPhotoModal(photo)}
                    />
                    <div className="photo-overlay">
                      <button
                        className="download-single-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadPhoto(photo.photo, `photo_${photo.id}`);
                        }}
                        title="Download photo"
                      >
                        📥
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Photo Detail Modal */}
      {selectedPhoto && (
        <div className="photo-detail-overlay" onClick={closePhotoModal}>
          <div className="photo-detail-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-detail-btn" onClick={closePhotoModal}>
              ✕
            </button>
            <img
              src={selectedPhoto.photo}
              alt="Family photo"
              className="detail-photo"
            />
            <button
              className="download-detail-btn"
              onClick={() => downloadPhoto(selectedPhoto.photo, `photo_${selectedPhoto.id}`)}
            >
              📥 Download Photo
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PhotoGallery;