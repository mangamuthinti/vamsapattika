import React from "react";
import "./Privacy.css";

export default function Privacy() {
  return (
    <section className="privacy-section">
      <div className="container privacy-box">

        {/* Main content */}
        <div className="privacy-content">

          {/* Heart image */}
          <div className="privacy-icon">
            <img src="/images/heart.png" alt="Family heart" />
          </div>

          <div className="privacy-text">
            <span className="kicker">PRIVACY BY DESIGN</span>

            <h2>
              Your family history belongs to <em>your family.</em>
            </h2>

            <p>
              Family history can contain personal and sensitive information.
              Vamsapattika should put responsible information management at
              its core, giving users appropriate control over what they provide,
              what is visible and who can access it.
            </p>
          </div>
        </div>

        {/* Privacy controls */}
        <div className="privacy-list">
          <span>What information you provide</span>
          <span>Who can access family records</span>
          <span>What information is shared</span>
          <span>How family content is managed</span>
        </div>

        {/* Family illustration at bottom */}
        <div className="family-image-wrapper">
          <img
            src="images/familyimage.jpeg"
            alt="Family illustration"
            className="family-image"
          />
        </div>

      </div>
    </section>
  );
}