
import React, { useState } from 'react';
import ChatWindow from './components/ChatWindow';
import Header from './components/Header';

const App: React.FC = () => {
  const [language, setLanguage] = useState('en');

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
  };

  return (
    <div className="flex flex-col h-screen font-sans">
      <Header language={language} onLanguageChange={handleLanguageChange} />
      <main className="flex-1 overflow-hidden p-4">
        <ChatWindow key={language} language={language} />
      </main>
    </div>
  );
};

export default App;
