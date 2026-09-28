import React, { useEffect, useRef } from "react";
import "./VideoModal.css";

export default function VideoModal({ video, onClose }) {
  const videoRef = useRef(null);

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleClose = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    onClose();
  };

  return (
    <div className="video-modal-overlay" onClick={handleBackdropClick}>
      <div className="video-modal-content">
        <button className="video-modal-close" onClick={handleClose} aria-label="Close video">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <div className="video-modal-header">
          <h3>{video.title}</h3>
          <p>{video.language}</p>
        </div>
        <div className="video-modal-player">
          <video
            ref={videoRef}
            controls
            autoPlay
            controlsList="nodownload"
            src={video.videoUrl}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  );
}