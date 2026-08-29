import React, { useEffect, useState } from "react";
import "./Hero.css";

export default function Hero({ scrollTo, navigate }) {

  /* =====================================================
     SUN / MOON — USER LOCAL TIME
  ===================================================== */

  const getTimeVisual = () => {
    const hour = new Date().getHours();

    // 6:00 AM to 5:59 PM = Sun
    // 6:00 PM to 5:59 AM = Moon
    return hour >= 6 && hour < 18 ? "sun" : "moon";
  };

  const [timeVisual, setTimeVisual] = useState(getTimeVisual);

  useEffect(() => {
    const updateTimeVisual = () => {
      setTimeVisual(getTimeVisual());
    };

    // Check immediately
    updateTimeVisual();

    // Keep checking the user's local time
    const interval = setInterval(updateTimeVisual, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="home" className="hero">

      {/* =====================================================
          BACKGROUND GLOW
      ===================================================== */}

      <div className="hero-glow glow-one" />
      <div className="hero-glow glow-two" />


      <div className="container hero-grid">

        {/* =====================================================
            HERO CONTENT
        ===================================================== */}

        <div className="hero-copy">

          <div className="eyebrow">
            <span />
            YOUR FAMILY. YOUR STORY. YOUR LEGACY.
          </div>


          <h1>
            Discover Your Roots.
            <br />
            <em>Preserve Your Legacy.</em>
          </h1>


          <p className="hero-text">
            Every family has a story. Bring generations of names,
            relationships, traditions, photographs, memories and stories
            together in one meaningful digital family legacy.
          </p>


          {/* =================================================
              HERO BUTTONS
          ================================================= */}

          <div className="hero-actions">

            <button
              className="primary-btn"
              onClick={() => navigate("/family-tree")}
            >
              Start Your VAMSAPATTIKA <span>→</span>
            </button>

          </div>


          {/* =================================================
              HERO VALUES
          ================================================= */}

          <div className="hero-values">

            <span>
              <b>Discover</b> your roots
            </span>

            <i>•</i>

            <span>
              <b>Preserve</b> your memories
            </span>

            <i>•</i>

            <span>
              <b>Pass On</b> your legacy
            </span>

          </div>

        </div>


        {/* =====================================================
            HERO TREE VISUAL
        ===================================================== */}

        <div className="hero-tree">

          <div className="tree-card">

            <img
              src="/images/hero-tree .jpg"
              alt="Illustration of a heritage tree"
            />


            {/* =================================================
                ROOTS RUN DEEP SLOGAN
            ================================================= */}

            <div className="tree-slogan">

              <div className="tree-slogan-icon">
                ⊙
              </div>

              <div className="tree-slogan-text">

                <strong>ROOTS RUN DEEP</strong>

                <small>
                  Every branch carries a story.
                </small>

              </div>

            </div>

          </div>


          {/* =================================================
              AUTOMATIC SUN / MOON
              BASED ON USER LOCAL TIME
          ================================================= */}

          <div
            className={`time-visual ${
              timeVisual === "sun"
                ? "time-visual-sun"
                : "time-visual-moon"
            }`}
            aria-label={
              timeVisual === "sun"
                ? "Daytime"
                : "Nighttime"
            }
          >

            {timeVisual === "sun" ? (

              /* =================================================
                 SUN VISUAL
              ================================================= */

              <svg
                className="time-sun"
                viewBox="0 0 120 120"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >

                <defs>
                  <radialGradient
                    id="sunCoreGradient"
                    cx="50%"
                    cy="45%"
                    r="60%"
                  >
                    <stop
                      offset="0%"
                      stopColor="#FFF8B5"
                    />

                    <stop
                      offset="55%"
                      stopColor="#FFD45A"
                    />

                    <stop
                      offset="100%"
                      stopColor="#FF972D"
                    />
                  </radialGradient>

                  <filter
                    id="sunGlow"
                    x="-80%"
                    y="-80%"
                    width="260%"
                    height="260%"
                  >
                    <feGaussianBlur
                      stdDeviation="4"
                      result="blur"
                    />

                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>


                {/* Sun rays */}

                <g
                  className="sun-rays"
                  stroke="#FFB52E"
                  strokeWidth="4"
                  strokeLinecap="round"
                >

                  <line x1="60" y1="7" x2="60" y2="20" />
                  <line x1="60" y1="100" x2="60" y2="113" />

                  <line x1="7" y1="60" x2="20" y2="60" />
                  <line x1="100" y1="60" x2="113" y2="60" />

                  <line
                    x1="22"
                    y1="22"
                    x2="31"
                    y2="31"
                  />

                  <line
                    x1="89"
                    y1="89"
                    x2="98"
                    y2="98"
                  />

                  <line
                    x1="98"
                    y1="22"
                    x2="89"
                    y2="31"
                  />

                  <line
                    x1="31"
                    y1="89"
                    x2="22"
                    y2="98"
                  />

                </g>


                {/* Soft sun glow */}

                <circle
                  cx="60"
                  cy="60"
                  r="34"
                  fill="#FFD45A"
                  opacity="0.22"
                  filter="url(#sunGlow)"
                />


                {/* Main sun */}

                <circle
                  cx="60"
                  cy="60"
                  r="25"
                  fill="url(#sunCoreGradient)"
                />


                {/* Inner highlight */}

                <circle
                  cx="52"
                  cy="51"
                  r="8"
                  fill="#FFFBE0"
                  opacity="0.42"
                />

              </svg>

            ) : (

             /* =================================================
   MOON VISUAL
================================================= */

<svg
  className="time-moon"
  viewBox="0 0 120 120"
  xmlns="http://www.w3.org/2000/svg"
  aria-hidden="true"
>

  <defs>

    <linearGradient
  id="moonGradient"
  x1="15%"
  y1="20%"
  x2="85%"
  y2="80%"
>
  <stop
    offset="90%"
    stopColor="#6b6565"
  />

  <stop
    offset="58%"
    stopColor="#646060"
  />

  <stop
    offset="42%"
    stopColor="#f7f3f3"
  />

  <stop
    offset="100%"
    stopColor="#FFFFFF"
  />
</linearGradient>

    <filter
      id="moonGlow"
      x="-80%"
      y="-80%"
      width="260%"
      height="260%"
    >
      <feGaussianBlur
        stdDeviation="5"
        result="blur"
      />

      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

  </defs>


  {/* Moon glow */}

  <circle
    cx="58"
    cy="58"
    r="34"
    fill="#111111"
    opacity="0.18"
    filter="url(#moonGlow)"
  />


  {/* Crescent moon */}

  <path
    d="
      M 78 20
      C 57 23, 43 41, 43 62
      C 43 84, 61 101, 82 101
      C 91 101, 100 98, 107 92
      C 94 94, 81 90, 73 82
      C 61 71, 57 55, 62 41
      C 65 32, 70 25, 78 20
      C 78 20, 78 20, 78 20
      Z
    "
    fill="url(#moonGradient)"
  />


  {/* Moon highlight */}

  <path
    d="
      M 58 38
      C 51 46, 49 57, 52 67
      C 55 78, 63 86, 73 90
    "
    fill="none"
    stroke="#777777"
    strokeWidth="3"
    strokeLinecap="round"
    opacity="0.22"
  />


  {/* Stars */}

  <g
    className="moon-stars"
    fill="#FFD45A"
  >

    <circle
      cx="29"
      cy="30"
      r="2.5"
    />

    <circle
      cx="22"
      cy="70"
      r="2"
    />

    <circle
      cx="35"
      cy="91"
      r="2.5"
    />

    <circle
      cx="93"
      cy="25"
      r="2"
    />

  </g>

</svg>

            )}

          </div>


          {/* =================================================
              FLOATING LABELS
          ================================================= */}

          <div className="floating-note note-top">
            ✦ &nbsp; GENERATIONS
          </div>


          <div className="floating-note note-bottom">
            ♥ &nbsp; MEMORIES
          </div>

        </div>

      </div>


      {/* =====================================================
          BOTTOM COLOR LINE
      ===================================================== */}

      <div className="hero-bottom-line" />

    </section>
  );
}