import React, { useState, useRef, useEffect } from 'react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  onAudioSubmit: (audioBlob: Blob) => void;
  onImageSubmit: (file: File) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, onAudioSubmit, onImageSubmit, isLoading }) => {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      // Cap height at approx 5 rows
      textarea.style.height = `${Math.min(scrollHeight, 120)}px`;
    }
  }, [text]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (text.trim() && !isLoading) {
      onSendMessage(text);
      setText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageSubmit(file);
    }
    // Reset file input value to allow uploading the same file again
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const startRecording = async () => {
    if (isRecording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const options = { mimeType: 'audio/webm; codecs=opus' };
      const mediaRecorder = new MediaRecorder(stream, MediaRecorder.isTypeSupported(options.mimeType) ? options : undefined);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        onAudioSubmit(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access was denied. Please allow microphone access in your browser settings to use this feature.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  
  const handleButtonClick = () => {
    if (text.trim()) {
      handleSubmit();
    } else if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const renderButtonIcon = () => {
    if (isLoading) {
      return (
        <div className="w-6 h-6 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
      )
    }
    if (isRecording) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
          <path d="M7 12m0 5a5 5 0 0 1 5 -5h0a5 5 0 0 1 5 5v0a5 5 0 0 1 -5 5h0a5 5 0 0 1 -5 -5z" />
        </svg>
      );
    }
    if (text.trim()) {
       return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      );
    }
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M9 2m0 3a3 3 0 0 1 3 -3h0a3 3 0 0 1 3 3v5a3 3 0 0 1 -3 3h0a3 3 0 0 1 -3 -3z" />
        <path d="M5 10a7 7 0 0 0 14 0" />
        <path d="M8 21l8 0" />
        <path d="M12 17l0 4" />
      </svg>
    );
  };

  return (
    <div className="p-4 bg-transparent border-t border-white/20 dark:border-white/10">
      <form onSubmit={handleSubmit} className="flex items-start gap-3">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={handleAttachmentClick}
          disabled={isLoading}
          className="p-3 w-[52px] h-[52px] flex items-center justify-center shrink-0 bg-slate-200/70 dark:bg-slate-800/70 text-light-text dark:text-dark-text rounded-full disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-brand-ai-start focus:ring-offset-2 dark:focus:ring-offset-transparent transition-all duration-200 self-end transform hover:scale-105 active:scale-95"
          aria-label="Attach CV/Resume"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M15 7l-6.5 6.5a1.5 1.5 0 0 0 3 3l6.5 -6.5a3 3 0 0 0 -6 -6l-6.5 6.5a4.5 4.5 0 0 0 9 9l6.5 -6.5" />
          </svg>
        </button>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isRecording ? "Recording... tap button to stop" : "Type or tap mic to speak..."}
          disabled={isLoading || isRecording}
          className="flex-1 px-4 py-2.5 bg-slate-200/70 dark:bg-slate-800/70 text-light-text dark:text-dark-text border border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-ai-start focus:border-transparent transition duration-200 disabled:opacity-50 resize-none"
          rows={1}
          autoFocus
        />
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={isLoading}
          className={`p-3 w-[52px] h-[52px] flex items-center justify-center shrink-0 bg-gradient-to-br from-brand-ai-start to-brand-ai-end text-white rounded-full disabled:from-teal-200 disabled:to-cyan-300 dark:disabled:from-teal-900 dark:disabled:to-cyan-950 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand-ai-start focus:ring-offset-2 dark:focus:ring-offset-transparent transition-all duration-200 self-end transform hover:scale-105 hover:brightness-110 active:scale-95 ${isRecording ? 'from-red-500 to-rose-600 animate-pulse' : ''}`}
          aria-label={text.trim() ? "Send message" : (isRecording ? "Stop recording" : "Start recording")}
        >
          {renderButtonIcon()}
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
