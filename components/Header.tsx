
import React from 'react';
import { translations, languageMap } from '../utils/translations';

interface HeaderProps {
  language: string;
  onLanguageChange: (lang: string) => void;
}

const Header: React.FC<HeaderProps> = ({ language, onLanguageChange }) => {
  const headerTitle =
    translations[language]?.headerTitle || translations['en'].headerTitle;

  return (
    <header className="bg-light-card/70 dark:bg-dark-card/70 backdrop-blur-lg border-b border-white/20 dark:border-white/10 sticky top-0 z-10">
      <div className="container mx-auto flex items-center gap-3 p-4">
        <div className="p-2 bg-gradient-to-br from-brand-ai-start to-brand-ai-end rounded-lg shadow-md shadow-brand-ai-start/30">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2a10 10 0 1 0 10 10" />
            <path d="M12 18a10 10 0 1 0 0-20" />
            <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10z" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-light-text dark:text-dark-text">
          {headerTitle}
        </h1>
        <div className="ml-auto">
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="bg-slate-200/50 dark:bg-slate-800/50 border border-slate-300/50 dark:border-slate-700/50 rounded-md px-3 py-1 text-sm text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-brand-ai-start appearance-none"
            aria-label="Select language"
          >
            {Object.entries(languageMap).map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
};

export default Header;
