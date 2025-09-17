import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Chat } from '@google/genai';
import {
  createChatSession,
  transcribeAudio,
  analyzeCvImage,
} from '../services/geminiService';
import { blobToBase64 } from '../utils/audioUtils';
import { fileToBase64 } from '../utils/imageUtils';
import { findJobs } from '../utils/mockJobApi';
import type { ChatMessage } from '../types';
import { Sender } from '../types';
import Message from './Message';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';
import ConversationStarters from './ConversationStarters';

interface ChatWindowProps {
  language: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ language }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [chat, setChat] = useState<Chat | null>(null);
  const [isConversationStarted, setIsConversationStarted] =
    useState<boolean>(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(
    null
  );
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isTranscribing]);

  const initializeChat = useCallback(async () => {
    setIsLoading(true);
    setMessages([]); // Clear previous messages
    try {
      const chatSession = createChatSession(language);
      setChat(chatSession);
      
      // The AI will generate its own greeting in the correct language. We send a clear instruction to trigger it.
      const stream = await chatSession.sendMessageStream({ message: "Introduce yourself and welcome me." });
      
      let fullResponse = '';
      const aiMessageId = `ai-intro-${Date.now()}`;
      let messageAdded = false;

      for await (const chunk of stream) {
        fullResponse += chunk.text;
         if (!messageAdded) {
            setMessages([{ id: aiMessageId, sender: Sender.AI, text: fullResponse }]);
            messageAdded = true;
          } else {
            setMessages((prev) =>
              prev.map((msg) => (msg.id === aiMessageId ? { ...msg, text: fullResponse } : msg))
            );
          }
      }

    } catch (error) {
      console.error('Failed to initialize chat:', error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: Sender.AI,
        text: "Sorry, I'm having trouble connecting right now. Please check your network connection and refresh the page.",
      };
      setMessages([errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  useEffect(() => {
    initializeChat();
     // Cleanup speech synthesis on component unmount
    return () => {
      speechSynthesis.cancel();
    };
  }, [initializeChat]);

  const parseAndSetMessage = (
    fullResponse: string,
    aiMessageId: string,
    isNewMessage: boolean
  ) => {
    // Regex to find quick replies like [text]
    const quickReplyRegex = /\[([^\]]+)\]/g;
    const quickReplies = [...fullResponse.matchAll(quickReplyRegex)].map(
      (match) => match[1]
    );
    const cleanedText = fullResponse.replace(quickReplyRegex, '').trim();

    const newMessage: ChatMessage = {
      id: aiMessageId,
      sender: Sender.AI,
      text: cleanedText,
      quickReplies: quickReplies.length > 0 ? quickReplies : undefined,
    };

    if (isNewMessage) {
      setMessages((prev) => [...prev, newMessage]);
    } else {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === aiMessageId ? newMessage : msg))
      );
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!chat || isLoading || isTranscribing) return;

    speechSynthesis.cancel();
    setSpeakingMessageId(null);

    if (!isConversationStarted) {
      setIsConversationStarted(true);
    }

    setMessages((prev) =>
      prev.map((msg) =>
        msg.quickReplies ? { ...msg, quickReplies: undefined } : msg
      )
    );

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: Sender.USER,
      text,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      let modelResponse = await chat.sendMessage({ message: text });
      let response = modelResponse;

      const functionCallPart = response.candidates?.[0]?.content?.parts.find(
        (part) => !!part.functionCall
      );

      if (functionCallPart && functionCallPart.functionCall) {
        const { name, args } = functionCallPart.functionCall;

        if (name === 'findJobs') {
          const jobResults = findJobs(
            args.query as string,
            args.location as string,
            args.job_type as string
          );

          modelResponse = await chat.sendMessage({
            message: [
              {
                functionResponse: {
                  name: 'findJobs',
                  response: {
                    jobs: jobResults,
                  },
                },
              },
            ],
          });
          response = modelResponse;
        }
      }

      const fullResponseText = response.text;
      if (fullResponseText) {
        parseAndSetMessage(fullResponseText, `ai-${Date.now()}`, true);
      } else if (!functionCallPart) {
        const emptyResponseMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: Sender.AI,
          text: "I'm not sure how to respond to that. Could you try rephrasing?",
        };
        setMessages((prev) => [...prev, emptyResponseMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: Sender.AI,
        text: 'I apologize, but I encountered an error. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAudioSubmit = async (audioBlob: Blob) => {
    // Hide quick replies
    setMessages((prev) =>
      prev.map((msg) =>
        msg.quickReplies ? { ...msg, quickReplies: undefined } : msg
      )
    );
    setIsTranscribing(true);
    try {
      const base64Audio = await blobToBase64(audioBlob);
      const transcribedText = await transcribeAudio(base64Audio, audioBlob.type);
      if (transcribedText) {
        await handleSendMessage(transcribedText);
      } else {
         const errorMessage: ChatMessage = {
            id: `error-${Date.now()}`,
            sender: Sender.AI,
            text: "I'm sorry, I couldn't understand the audio. Could you please try again?",
          };
          setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Audio submission error:", error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: Sender.AI,
        text: 'I apologize, but there was an error processing your audio. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleImageSubmit = async (file: File) => {
    if (isLoading || isTranscribing) return;
    setIsLoading(true);

    // Hide quick replies
    setMessages((prev) =>
      prev.map((msg) =>
        msg.quickReplies ? { ...msg, quickReplies: undefined } : msg
      )
    );

    try {
      const { base64, mimeType, dataUrl } = await fileToBase64(file);

      // Display the uploaded image immediately
      const userMessage: ChatMessage = {
        id: `user-img-${Date.now()}`,
        sender: Sender.USER,
        text: `(Uploaded CV: ${file.name})`,
        imageUrl: dataUrl,
      };
      setMessages((prev) => [...prev, userMessage]);
      if (!isConversationStarted) setIsConversationStarted(true);

      const response = await analyzeCvImage(base64, mimeType);

      parseAndSetMessage(response.text, `ai-${Date.now()}`, true);
    } catch (error) {
      console.error('Image submission error:', error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: Sender.AI,
        text: 'I apologize, but there was an error analyzing your document. Please ensure it is a clear image file and try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSpeech = useCallback(
    (messageId: string, text: string) => {
      if (speakingMessageId === messageId) {
        speechSynthesis.cancel();
        setSpeakingMessageId(null);
      } else {
        speechSynthesis.cancel(); // Stop any previous speech
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => setSpeakingMessageId(null);
        utterance.onerror = () => {
          console.error('Speech synthesis error');
          setSpeakingMessageId(null);
        };
        speechSynthesis.speak(utterance);
        setSpeakingMessageId(messageId);
      }
    },
    [speakingMessageId]
  );
  
  const showTypingIndicator = (isLoading && !isTranscribing) && isConversationStarted;

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto bg-light-card dark:bg-dark-card backdrop-blur-xl shadow-2xl shadow-brand-ai-end/10 dark:shadow-brand-ai-start/10 rounded-2xl overflow-hidden border border-white/20 dark:border-white/10">
      <div
        ref={chatContainerRef}
        className="flex-1 p-6 space-y-6 overflow-y-auto"
      >
        {messages.map((message) => (
          <Message
            key={message.id}
            message={message}
            onToggleSpeech={handleToggleSpeech}
            speakingMessageId={speakingMessageId}
            onQuickReplyClick={handleSendMessage}
          />
        ))}
        {showTypingIndicator && <TypingIndicator />}
         {(isTranscribing || (isLoading && messages.length === 0)) && <TypingIndicator />}
      </div>
      {!isConversationStarted && !isLoading && messages.length > 0 && (
        <ConversationStarters
          onSelectStarter={handleSendMessage}
          language={language}
        />
      )}
      <ChatInput
        onSendMessage={handleSendMessage}
        onAudioSubmit={handleAudioSubmit}
        onImageSubmit={handleImageSubmit}
        isLoading={isLoading || isTranscribing}
      />
    </div>
  );
};

export default ChatWindow;