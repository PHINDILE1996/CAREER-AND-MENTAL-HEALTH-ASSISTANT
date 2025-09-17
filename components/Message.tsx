import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ChatMessage } from '../types';
import { Sender } from '../types';

interface MessageProps {
  message: ChatMessage;
  onToggleSpeech: (messageId: string, text: string) => void;
  speakingMessageId: string | null;
  onQuickReplyClick?: (text: string) => void;
}

const AiAvatar: React.FC = () => (
  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-brand-ai-start to-brand-ai-end flex items-center justify-center text-white font-bold shadow-md shadow-brand-ai-start/40 mb-1">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-100" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M4 12a1 1 0 1 0 2 0a1 1 0 0 0 -2 0"></path>
      <path d="M18 12a1 1 0 1 0 2 0a1 1 0 0 0 -2 0"></path>
      <path d="M12 18.5c-3.04 0 -5.93 -1.61 -7.89 -4.08a1 1 0 0 1 1.78 -1.04c1.6 2.04 4.02 3.12 6.11 3.12s4.51 -1.08 6.11 -3.12a1 1 0 0 1 1.78 1.04c-1.96 2.47 -4.85 4.08 -7.89 4.08z"></path>
      <path d="M17 9a3 3 0 0 0 -3 -3h-4a3 3 0 0 0 -3 3"></path>
    </svg>
  </div>
);

const Message: React.FC<MessageProps> = ({ message, onToggleSpeech, speakingMessageId, onQuickReplyClick }) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.sender === Sender.USER;
  const isSpeaking = speakingMessageId === message.id;

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const userStyles =
    'bg-gradient-to-br from-brand-user-start to-brand-user-end text-white self-end rounded-2xl rounded-br-lg';
  const aiStyles =
    'bg-slate-200 dark:bg-slate-800/80 text-light-text dark:text-dark-text self-start rounded-2xl rounded-bl-lg';

  return (
    <div
      className={`flex items-end gap-3 message-animate ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      {!isUser && <AiAvatar />}
      <div className={`flex flex-col w-full max-w-md lg:max-w-2xl ${isUser ? 'items-end' : 'items-start'}`}>
        <div className="group relative">
          <div
            className={`px-4 py-3 shadow-md rounded-lg transition-all duration-300 ${
              isUser ? userStyles : aiStyles
            }`}
          >
            {message.imageUrl && (
              <img 
                src={message.imageUrl} 
                alt="User upload" 
                className="rounded-lg mb-2 max-w-xs max-h-64 object-contain bg-black/10 p-1"
              />
            )}
            {isUser ? (
              <p className="text-sm whitespace-pre-wrap">{message.text}</p>
            ) : (
              <div className="text-sm leading-relaxed prose prose-slate dark:prose-invert prose-p:my-2 prose-a:text-brand-ai-start prose-ol:my-2 prose-ul:my-2">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: ({ node, ...props }) => (
                      <a
                        {...props}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      />
                    ),
                  }}
                >
                  {message.text || '...'}
                </ReactMarkdown>
              </div>
            )}
          </div>
          {!isUser && message.text.length > 0 && (
            <div className="absolute -right-10 top-1/2 -translate-y-1/2 flex flex-col gap-1">
              <button
                onClick={() => onToggleSpeech(message.id, message.text)}
                className="p-1.5 rounded-full text-slate-500 dark:text-slate-300 hover:bg-slate-300/50 dark:hover:bg-slate-700/50 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                aria-label={isSpeaking ? 'Stop speech' : 'Play message'}
              >
                {isSpeaking ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M18 6l-12 12" />
                    <path d="M6 6l12 12" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M15 8a5 5 0 0 1 0 8" />
                    <path d="M17.7 5a9 9 0 0 1 0 14" />
                    <path d="M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5" />
                  </svg>
                )}
              </button>
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-full text-slate-500 dark:text-slate-300 hover:bg-slate-300/50 dark:hover:bg-slate-700/50 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                aria-label={copied ? 'Copied' : 'Copy message'}
              >
                {copied ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
          )}
        </div>
        {message.quickReplies && onQuickReplyClick && !isUser && (
          <div className="flex flex-wrap gap-2 mt-3 justify-start message-animate">
            {message.quickReplies.map((reply, index) => (
              <button
                key={index}
                onClick={() => onQuickReplyClick(reply)}
                className="px-3 py-1.5 bg-slate-200/50 dark:bg-slate-800/50 border border-slate-300/50 dark:border-slate-700/50 rounded-full text-sm text-light-text dark:text-dark-text hover:bg-slate-200/80 dark:hover:bg-slate-700/80 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-ai-start"
              >
                {reply}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
