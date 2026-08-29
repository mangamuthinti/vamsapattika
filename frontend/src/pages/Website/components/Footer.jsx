import React, { useEffect, useState } from "react";
import "./Footer.css";

export default function Footer({ scrollTo }) {

  const [visitorCount, setVisitorCount] = useState(null);

  /* =====================================================
     VISITOR COUNTER
  ===================================================== */

  useEffect(() => {

    const countVisitor = async () => {

      try {

        const response = await fetch(
          "https://counterapi.com/api/vamsapattika.com/view/website-visitors?unique=true"
        );

        const data = await response.json();

        setVisitorCount(data.value);

      } catch (error) {

        console.error("Visitor counter error:", error);

      }

    };

    countVisitor();

  }, []);


  /* =====================================================
     SCROLL TO TOP
  ===================================================== */

  const scrollToTop = () => {

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  };


  return (
    <footer className="footer">

      <div className="container footer-main">


        {/* =================================================
            LOGO
        ================================================= */}

        <div
          className="footer-brand"
          onClick={scrollToTop}
          role="button"
          tabIndex={0}
          aria-label="Go to top"
        >

          <img
            src="/vamsapattika-logo.jpeg"
            alt="Vamsapattika"
            className="footer-logo"
          />

        </div>


        {/* =================================================
            EXPLORE 01
        ================================================= */}

        <div className="footer-col explore-col">

          <h4>
            EXPLORE 
          </h4>

          <button onClick={() => scrollTo("about")}>
            About Us
          </button>

          <button onClick={() => scrollTo("features")}>
            Features
          </button>

          <button onClick={() => scrollTo("how-it-works")}>
            How It Works
          </button>

          <button onClick={() => scrollTo("faq")}>
            FAQ
          </button>

        </div>


        {/* =================================================
            CONTACT US 02
        ================================================= */}

        <div className="footer-col contact-col">

          <h4>
            CONTACT US 
          </h4>

          <a
            href="mailto:support@vamsapattika.com"
            className="contact-item"
          >
            <span className="contact-icon">
              ✉
            </span>

            <span>
              support@vamsapattika.com
            </span>
          </a>


          <div className="contact-item">

            <span className="contact-icon">
              ⌖
            </span>

            <span>
              Hyderabad, India
            </span>

          </div>


          <a
            href="https://www.vamsapattika.com"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-item"
          >

            <span className="contact-icon">
              ◎
            </span>

            <span>
              www.vamsapattika.com
            </span>

          </a>

        </div>


        {/* =================================================
            VISITORS 03
        ================================================= */}

        <div className="footer-col visitors-col">

          {/* HEADING FIRST */}

          <h4>
            VISITORS 
          </h4>


          {/* NUMBER BELOW HEADING */}

          <div className="visitor-box">

            <span className="visitor-eye">
              👁
            </span>

            

            <span className="visitor-label">
              Visitors
            </span>
<span className="visitor-number">

              {visitorCount !== null
                ? visitorCount.toLocaleString()
                : "0"}

            </span>
          </div>

        </div>

      </div>


      {/* =====================================================
          COPYRIGHT
      ===================================================== */}

      <div className="container footer-bottom">

        <span>
          © 2026 Vamsapattika. All Rights Reserved @Provegaa Tech Hub.
        </span>

      </div>

    </footer>
  );
}