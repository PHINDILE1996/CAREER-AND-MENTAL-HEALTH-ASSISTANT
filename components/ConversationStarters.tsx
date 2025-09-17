import React from 'react';
import { translations } from '../utils/translations';

interface ConversationStartersProps {
  onSelectStarter: (text: string) => void;
  language: string;
}

const starterIcons = [
  <svg key="find" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  <svg key="anxious" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.546-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  <svg key="skills" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
];

const ConversationStarters: React.FC<ConversationStartersProps> = ({
  onSelectStarter,
  language,
}) => {
  const starterContent = translations[language]?.starters || translations['en'].starters;
  
  return (
    <div className="px-6 pb-6 pt-2">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {starterContent.map((starter: {title: string, prompt: string}, index: number) => (
          <button
            key={starter.title}
            onClick={() => onSelectStarter(starter.prompt)}
            className="p-4 bg-slate-200/50 dark:bg-slate-800/50 border border-slate-300/50 dark:border-slate-700/50 rounded-xl text-left text-sm text-light-text dark:text-dark-text hover:bg-slate-200/80 dark:hover:bg-slate-700/80 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-ai-start focus:ring-offset-2 dark:focus:ring-offset-transparent"
          >
            <div className="flex items-center gap-3">
              <div className="text-brand-ai-start">{starterIcons[index]}</div>
              <span className="font-semibold">{starter.title}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ConversationStarters;
