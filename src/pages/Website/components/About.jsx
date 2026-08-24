import React from "react";
import "./About.css";
import "./Heritage.css";

export default function About() {
  return (
    <>
      {/* =================================================
          ABOUT SECTION
      ================================================= */}

      <section id="about" className="section about">
        <div className="container about-grid">

          {/* =================================================
              LEFT IMAGE + ABOUT + VAMSAPATTIKA
          ================================================= */}

          <div className="about-vertical">

            {/* ABOUT LABEL */}
            <div className="about-label">
              <span className="abo-underline">ABO</span>UT
            </div>

            {/* OLD MAN IMAGE */}
            <div className="about-oldman">
              <img
                src="/images/old man.jpg"
                alt="Family heritage"
                className="about-oldman-image"
              />
            </div>

            {/* VAMSAPATTIKA */}
            <div className="about-logo-text">
              {"VAMSAPATTIKA".split("").map((letter, index) => (
                <span key={index}>{letter}</span>
              ))}
            </div>

          </div>

          {/* =================================================
              ABOUT CONTENT
          ================================================= */}

          <div className="about-content">

            <h2>
              A VAMSAPATTIKA is only the beginning.
            </h2>

            <p className="lead">
              <strong>VAMSAPATTIKA</strong> is a family genealogy and heritage
              platform designed to help individuals and families document
              their ancestry and build a living family history.
            </p>

            <p>
              From grandparents and great-grandparents to present-day
              generations, VAMSAPATTIKA creates a meaningful way to connect
              people and preserve the knowledge that time can otherwise take
              away.
            </p>

            <div className="heritage-quote">
              <span>“</span>

              <p>
                Start with what you know. Discover what you don’t. Preserve
                everything that matters.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* =================================================
          HERITAGE SECTION
      ================================================= */}

      <section className="heritage-strip">
        <div className="container heritage-grid">

          {/* HERITAGE IMAGE */}
          <div className="heritage-image-wrap">

            <img
              src="/images/heritage.jpeg"
              alt="Heritage tree representing family generations"
              className="heritage-image"
            />

            <div className="image-badge">
              YOUR HERITAGE
            </div>

          </div>

          {/* HERITAGE CONTENT */}
          <div className="heritage-copy">

            <span className="kicker">
              VAMSAPATTIKA IS MORE THAN A FAMILY TREE
            </span>

            <h2 className="heritage-title">

              <span className="heritage-main-title">
                People. Places. Stories.
              </span>

              <span className="memories-vertical">
                {"MEMORIES".split("").map((letter, index) => (
                  <span key={index}>{letter}</span>
                ))}
              </span>

            </h2>

            <p>
              Heritage is more than names and dates. It is the places your
              family came from, the traditions they carried, the achievements
              they celebrated and the values they passed forward.
            </p>

            <div className="heritage-points">

              <div>
                <span>✓</span>
                Connect generations
              </div>

              <div>
                <span>✓</span>
                Celebrate your roots
              </div>

              <div>
                <span>✓</span>
                Preserve family knowledge
              </div>

              <div>
                <span>✓</span>
                Build a lasting legacy
              </div>

            </div>

          </div>

        </div>
      </section>
    </>
  );
}