import React from 'react';
import './ChatBubble.css';

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  timestamp?: Date;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isUser, timestamp }) => {
  return (
    <div className={`chat-bubble ${isUser ? 'user' : 'bot'}`}>
      <div className="bubble-content">
        <p className="message-text">{message}</p>
        {timestamp && (
          <span className="timestamp">
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;