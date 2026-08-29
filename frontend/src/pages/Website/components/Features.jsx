import React from "react";
import { features } from "../data";
import "./Features.css";

function Icon({ children }) {
  return (
    <span className="feature-icon" aria-hidden="true">
      {children}
    </span>
  );
}

export default function Features() {
  return (
    <section id="features" className="section features">
      <div className="container">

        {/* =========================
            SECTION HEADER
        ========================== */}

        <div className="center-heading">

          <span className="section-label">
            WHAT YOU CAN CREATE
          </span>

          <h2>
            Everything that makes your <em>family unique.</em>
          </h2>

          <p>
            Bring your family's people, places, photographs and stories
            together in one beautiful heritage record.
          </p>

        </div>


        {/* =========================
            FEATURE CARDS
        ========================== */}

        <div className="feature-grid">

          {features.map((feature, index) => {

            const isLastCard = index === features.length - 1;

            return (
              <article
                className={`feature-card feature-card-${index + 1}`}
                key={feature.title}
                data-number={`0${index + 1}`}
              >

                {/* =========================
                    ICON
                    1 = LEFT
                    2 = CENTER
                    3 = RIGHT
                    4 = LEFT
                    5 = CENTER
                    6 = RIGHT
                ========================== */}

                <Icon>
                  {feature.icon}
                </Icon>


                {/* =========================
                    TITLE
                ========================== */}

                <h3>
                  {feature.title}
                </h3>


                {/* =========================
                    DESCRIPTION
                ========================== */}

                <p>
  {index === 0 ? (
    <>
      Build a clear, multi-generation{" "}
      <strong>
        <u>VAMSAPATTIKA</u>
      </strong>{" "}
      that connects the people who shaped your story.
    </>
  ) : (
    feature.text
  )}
</p>


                {/* =========================
                    CARD ACTION
                    1–5 = ARROW
                    6   = TROPHY
                ========================== */}

                <button
                  type="button"
                  className={`card-arrow ${isLastCard ? "card-trophy" : ""}`}
                  aria-label={
                    isLastCard
                      ? "Complete your family heritage"
                      : `Go to ${features[index + 1].title}`
                  }
                >
                  <span>
                    {isLastCard ? "🏆" : "→"}
                  </span>
                </button>

              </article>
            );
          })}

        </div>

      </div>
    </section>
  );
}