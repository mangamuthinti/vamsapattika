import React from "react";
import { steps } from "../data";
import "./Process.css";

import tree from "../assets/tree.png";
import family from "../assets/family.png";
import memories from "../assets/memories.png";
import heritage from "../assets/heritage.png";
import legacy from "../assets/newtree.jpg";

const watermarkImages = [
  tree,
  family,
  memories,
  heritage,
  legacy,
];

export default function Process() {
  return (
    <section id="how-it-works" className="section process">
      <div className="container">

        <div className="center-heading">
          <span className="section-label">
          HOW VAMSAPATTIKA WORKS
          </span>

          <h2>
            Five steps to your family's <em>digital legacy.</em>
          </h2>
        </div>

        <div className="steps">
          {steps.map(([number, title, text], index) => (
            <div
              className="step"
              key={number}
              style={{
                "--watermark-image": `url(${watermarkImages[index]})`,
              }}
            >
              <div className="step-content">

  <div className="step-title-row">
    <span className="step-number">
      {number}
    </span>

    <h3>
      {title}
    </h3>
  </div>

  <p>
    {text}
  </p>

</div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}