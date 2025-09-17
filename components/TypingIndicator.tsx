
import React from 'react';

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-end gap-3 self-start message-animate">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-brand-ai-start to-brand-ai-end flex items-center justify-center text-white font-bold shadow-md shadow-brand-ai-start/40 mb-1">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-100" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
          <path d="M4 12a1 1 0 1 0 2 0a1 1 0 0 0 -2 0"></path>
          <path d="M18 12a1 1 0 1 0 2 0a1 1 0 0 0 -2 0"></path>
          <path d="M12 18.5c-3.04 0 -5.93 -1.61 -7.89 -4.08a1 1 0 0 1 1.78 -1.04c1.6 2.04 4.02 3.12 6.11 3.12s4.51 -1.08 6.11 -3.12a1 1 0 0 1 1.78 1.04c-1.96 2.47 -4.85 4.08 -7.89 4.08z"></path>
          <path d="M17 9a3 3 0 0 0 -3 -3h-4a3 3 0 0 0 -3 3"></path>
        </svg>
      </div>
      <div className="flex items-center space-x-1.5 bg-slate-200 dark:bg-slate-800/80 px-4 py-3.5 rounded-2xl rounded-bl-lg shadow-md">
        <div className="w-2 h-2 bg-brand-ai-start/70 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="w-2 h-2 bg-brand-ai-start/70 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-brand-ai-start/70 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  );
};

export default TypingIndicator;