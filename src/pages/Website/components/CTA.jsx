import React from "react";
import "./CTA.css";

export default function CTA({ scrollTo, navigate }) {
  return (
    <section id="contact" className="cta-section">
      <div className="cta-tree-pattern" />
      <div className="container cta-content">
        <span className="kicker">YOUR STORY STARTS HERE</span>
        <h2>Your ancestors left a legacy.<br /><em>Now, preserve it.</em></h2>
        <p>Build a family history that your children and grandchildren can discover, cherish and pass on.</p>
        <div className="cta-actions">
          <button className="primary-btn light" onClick={() => navigate("/family-tree")}>Start Your VAMSAPATTIKA <span>→</span></button>
          <button className="cta-link" onClick={() => scrollTo("about")}>Explore Vamsapattika ↗</button>
        </div>
      </div>
    </section>
  );
}
