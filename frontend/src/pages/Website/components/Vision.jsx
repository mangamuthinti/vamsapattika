import React from "react";
import "./Vision.css";

export default function Vision() {
  return (
    <section className="vision-section" id="vision">
      <div className="vision-container">

        {/* =========================
            EXISTING VISION CONTENT
        ========================== */}

        <div className="vision-content">
          <span className="vision-label">OUR VISION</span>

          <h2>
  Preserve <span>Your Family.</span>
  <br />
  Preserve <span>Your Legacy.</span>
</h2>
          <p>
            Every family has a story worth remembering. Vamsapattika
            helps you preserve those memories, relationships and
            generations for the future.
          </p>
        </div>


        {/* =========================
            LOADING / PROGRESS LINE
        ========================== */}

        <div className="vision-progress-area">

          <div className="vision-progress-line">
            <span className="vision-progress-dot"></span>
          </div>


          {/* =========================
              FAMILY ANIMATION
          ========================== */}

          <div className="family-running-track">

            {/* GRAND FATHER — FIRST */}
            <div className="family-person person-1">
              <img
                src="/images/family/grandfather.png"
                alt="Grandfather"
              />
            </div>

            {/* GRAND MOTHER — SECOND */}
            <div className="family-person person-2">
              <img
                src="/images/family/grandmother (2).png"
                alt="Grandmother"
              />
            </div>

            {/* FAMILY MEMBER 3 */}
            <div className="family-person person-3">
              <img
                src="/images/family/family1.png"
                alt="Family member"
              />
            </div>

            {/* FAMILY MEMBER 4 */}
            <div className="family-person person-4">
              <img
                src="/images/family/family2.png"
                alt="Family member"
              />
            </div>

            {/* FAMILY MEMBER 5 */}
            <div className="family-person person-5">
              <img
                src="/images/family/family3.png"
                alt="Family member"
              />
            </div>

            {/* CHILD — LAST */}
            <div className="family-person person-6">
              <img
                src="/images/family/child.png"
                alt="Child"
              />
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}