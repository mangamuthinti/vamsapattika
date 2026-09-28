import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Website/components/Header";
import VideoModal from "./components/VideoModal";
import "./DemoPage.css";

const videos = [
  {
    id: 1,
    title: "English Demo",
    language: "English",
    thumbnail: "/images/tree.png",
    videoUrl: "/videos/english.mp4"
  },
  {
    id: 2,
    title: "Hindi Demo",
    language: "हिंदी",
    thumbnail: "/images/family.png",
    videoUrl: "/videos/hindi.mp4"
  },
  {
    id: 3,
    title: "Telugu Demo",
    language: "తెలుగు",
    thumbnail: "/images/memories.png",
    videoUrl: "/videos/telugu.mp4"
  }
];

export default function DemoPage() {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const scrollTo = (id) => {
    if (id === "home") {
      navigate("/");
      setMenuOpen(false);
    } else if (id === "demo") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setMenuOpen(false);
    } else {
      // Navigate to homepage with hash, browser will handle scroll
      window.location.href = "/#" + id;
    }
  };

  const openVideo = (video) => {
    setSelectedVideo(video);
  };

  const closeVideo = () => {
    setSelectedVideo(null);
  };

  return (
    <div className="demo-page">
      <Header scrollTo={scrollTo} menuOpen={menuOpen} setMenuOpen={setMenuOpen} navigate={navigate} />

      <main className="demo-main">
        <div className="container">
          <div className="demo-page-heading">
            <span className="section-label">
              WATCH VAMSAPATTIKA IN ACTION
            </span>
            <h1>
              See how easy it is to <em>preserve your legacy.</em>
            </h1>
            <p className="demo-description">
              Watch our demonstration videos in your preferred language to learn how Vamsapattika helps you create and preserve your family's digital legacy.
            </p>
          </div>

          <div className="videos-grid">
            {videos.map((video) => (
              <div
                className="video-card"
                key={video.id}
                onClick={() => openVideo(video)}
              >
                <div className="video-thumbnail">
                  <img src={video.thumbnail} alt={video.title} />
                  <div className="play-overlay">
                    <div className="play-button">
                      <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                        <circle cx="30" cy="30" r="30" fill="rgba(255,255,255,0.95)" />
                        <path d="M24 18L42 30L24 42V18Z" fill="#6b2b9f" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="video-info">
                  <h3>{video.title}</h3>
                  <p className="video-language">{video.language}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {selectedVideo && (
        <VideoModal video={selectedVideo} onClose={closeVideo} />
      )}
    </div>
  );
}