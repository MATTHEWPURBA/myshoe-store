import React from 'react';

const ChatTypingIndicator: React.FC = () => {
  return (
    <div className="flex justify-start">
      <div className="bg-gray-200 text-gray-800 rounded-lg rounded-bl-none p-3 flex items-center space-x-1">
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
      </div>
    </div>
  );
};

export default ChatTypingIndicator;