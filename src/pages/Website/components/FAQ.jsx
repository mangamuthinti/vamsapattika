import React, { useState } from "react";
import "./FAQ.css";

import faqWatermark from "../assets/faq-watermark.png";

const faqs = [
  {
    question: "What is VAMSHAPATTIKA?",
    answer:
      "Vamsapattika is a digital platform that helps families preserve their history, memories, stories and heritage for future generations.",
  },
  {
    question: "How does VAMSHAPATTIKA work?",
    answer:
      "You can create your VAMSHAPATTIKA, add family members and preserve important photographs, stories, dates and memories.",
  },
  {
    question: "Can I add multiple generations?",
    answer:
      "Yes. You can connect parents, grandparents, children, siblings and previous generations to build your family history.",
  },
  {
    question: "How do I create my VAMSAPATTIKA?",
    answer:
      "Start with yourself or an elder family member and gradually add parents, grandparents, children and other relatives.",
  },
  {
    question: "Is my family information private?",
    answer:
      "Your family information is designed to be protected and shared only with the people you choose.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="faq-section">
      <div className="container">

        {/* FAQ TITLE BOX */}
        <div
          className="faq-title-box"
          style={{
            "--faq-watermark": `url(${faqWatermark})`,
          }}
        >
          
          <h2>
            Frequently Asked <em>Questions?.</em>
          </h2>
        </div>

        {/* FAQ QUESTIONS */}
        <div className="faq-questions">
          {faqs.map((faq, index) => (
            <div
              className={`faq-item ${
                openIndex === index ? "active" : ""
              }`}
              key={index}
            >
              <button
                className="faq-question"
                onClick={() => toggleFAQ(index)}
                type="button"
              >
                <span>{faq.question}</span>

                <span className="faq-icon">
  {index === 0
    ? "🌳"
    : index === 1
    ? "🌳"
    : index === 2
    ? "🌳"
    : index === 3
    ? "🌳"
    : openIndex === index
    ? "🌳"
    : "🌳"}
</span>
              </button>

              {openIndex === index && (
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}