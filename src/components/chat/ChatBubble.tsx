import React from 'react';
import { ChatMessage } from '../../hooks/useChat';

interface ChatBubbleProps {
  message: ChatMessage;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const { isFromUser, content, timestamp } = message;
  
  return (
    <div className={`flex ${isFromUser ? 'justify-end' : 'justify-start'}`}>
      <div className="max-w-[80%]">
        <div 
          className={`rounded-lg p-3 ${
            isFromUser 
              ? 'bg-blue-600 text-white rounded-br-none' 
              : 'bg-gray-200 text-gray-800 rounded-bl-none'
          }`}
        >
          {content}
        </div>
        <div className={`text-xs text-gray-500 mt-1 ${isFromUser ? 'text-right' : 'text-left'}`}>
          {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;