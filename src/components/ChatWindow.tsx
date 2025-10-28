import React, { useEffect, useRef, useState } from 'react';
import { SYSTEM_PROMPT } from '../config/systemPrompt';
import { ChatMessage as HFChatMessage, HuggingFaceService } from '../services/huggingfaceService';
import ChatBubble from './ChatBubble';
import './ChatWindow.css';
import MessageInput from './MessageInput';

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatWindowProps {
  title?: string;
  initialMessages?: Message[];
  onSendMessage?: (message: string) => void;
  apiKey?: string;
}

const STORAGE_KEY = 'asurion_chatbot_history';

const ChatWindow: React.FC<ChatWindowProps> = ({
  title = 'Chatbot',
  initialMessages = [],
  onSendMessage,
  apiKey,
}) => {
  const [messages, setMessages] = useState<Message[]>(() => {
    // Load messages from localStorage on initial render
    const savedMessages = localStorage.getItem(STORAGE_KEY);
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        // Convert timestamp strings back to Date objects
        return parsed.map((msg: Message) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
      } catch (error) {
        console.error('Error loading chat history:', error);
        return initialMessages;
      }
    }
    return initialMessages;
  });
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const huggingFaceService = useRef<HuggingFaceService | null>(null);

  // Initialize Hugging Face service
  useEffect(() => {
    const key = apiKey || process.env.REACT_APP_HUGGINGFACE_API_KEY;
    if (key) {
      huggingFaceService.current = new HuggingFaceService(key);
      setError(null);
    } else {
      setError('Hugging Face API key is not configured. Please add REACT_APP_HUGGINGFACE_API_KEY to your .env file.');
    }
  }, [apiKey]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);

    // Call the optional callback
    if (onSendMessage) {
      onSendMessage(text);
    }

    // Get bot response from Hugging Face API
    getBotResponse(text);
  };

  const getBotResponse = async (userMessage: string) => {
    if (!huggingFaceService.current) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Error: Hugging Face API is not configured. Please check your API key.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
      return;
    }

    setIsTyping(true);
    setError(null);

    try {
      // Convert messages to Hugging Face format
      const chatHistory: HFChatMessage[] = [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        ...messages.slice(-10).map((msg): HFChatMessage => ({
          role: msg.isUser ? 'user' : 'assistant',
          content: msg.text,
        })),
        {
          role: 'user',
          content: userMessage,
        },
      ];

      const response = await huggingFaceService.current.generateResponse(chatHistory);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting bot response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsTyping(false);
    }
  };

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear the chat history?')) {
      setMessages([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h2 className="chat-title">{title}</h2>
        <div className="header-actions">
          <div className="status-indicator">
            <span className="status-dot"></span>
            <span className="status-text">Online</span>
          </div>
          {messages.length > 0 && (
            <button className="clear-history-btn" onClick={clearHistory} title="Clear chat history">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="chat-messages">
        {error && (
          <div className="error-banner">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>{error}</span>
          </div>
        )}
        {messages.length === 0 ? (
          <div className="empty-state">
            <p>Start a conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <ChatBubble
              key={message.id}
              message={message.text}
              isUser={message.isUser}
              timestamp={message.timestamp}
            />
          ))
        )}
        {isTyping && (
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput onSendMessage={handleSendMessage} disabled={isTyping} />
    </div>
  );
};

export default ChatWindow;