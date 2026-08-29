import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="vamsapattika-language">
      <span className="vamsapattika-language-icon" aria-hidden="true">A</span>
      <select
        className="vamsapattika-language-select"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        aria-label="Select language"
      >
        <option value="en">English</option>
        <option value="hi">हिन्दी</option>
        <option value="te">తెలుగు</option>
      </select>
      <span className="vamsapattika-language-arrow" aria-hidden="true">▾</span>
    </div>
  );
};

export default LanguageSelector;
