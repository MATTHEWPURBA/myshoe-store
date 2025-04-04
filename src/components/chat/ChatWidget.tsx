import React, { useState, useEffect, useRef } from 'react';
import { useChat, ChatMessage } from '../../hooks/useChat';
import { shoeApi } from '../../api/shoeApi';
import { Shoe } from '../../types';
import ChatBubble from './ChatBubble';
import ChatTypingIndicator from './ChatTypingIndicator';
import ProductRecommendation from './ProductRecommendation';

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [recommendedProducts, setRecommendedProducts] = useState<Shoe[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const {
    messages,
    sendMessage,
    isConnected,
    isTyping,
    error
  } = useChat();
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);
  
  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);
  
  // Fetch product recommendations when messages change
  useEffect(() => {
    const fetchRecommendedProducts = async () => {
      // Get the last message
      const lastMessage = messages[messages.length - 1];
      
      // Check if it has product recommendations
      if (lastMessage && !lastMessage.isFromUser && lastMessage.metadata?.products) {
        try {
          const products = [];
          
          for (const productId of lastMessage.metadata.products) {
            const product = await shoeApi.getShoeById(productId);
            if (product) {
              products.push(product);
            }
          }
          
          setRecommendedProducts(products);
        } catch (error) {
          console.error('Error fetching product recommendations:', error);
          setRecommendedProducts([]);
        }
      } else if (lastMessage && lastMessage.isFromUser) {
        // Clear recommendations when user sends a new message
        setRecommendedProducts([]);
      }
    };
    
    fetchRecommendedProducts();
  }, [messages]);
  
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (sendMessage(input)) {
      setInput('');
    }
  };
  
  const toggleChat = () => {
    setIsOpen(prev => !prev);
  };
  
  const handleProductSelect = (productId: number) => {
    // Navigate to product page
    window.location.href = `/shoes/${productId}`;
    
    // Close chat
    setIsOpen(false);
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat button */}
      <button
        aria-label={isOpen ? "Close chat" : "Open chat"}
        className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={toggleChat}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>
      
      {/* Chat window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 bg-white rounded-lg shadow-xl flex flex-col h-96 border border-gray-200">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <h3 className="font-medium">Shoe Store Assistant</h3>
            <div className="flex items-center">
              <span className={`h-2 w-2 rounded-full mr-2 ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></span>
              <span className="text-xs">{isConnected ? 'Online' : 'Connecting...'}</span>
            </div>
          </div>
          
          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>Send a message to start chatting</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <ChatBubble key={message.id} message={message} />
                ))}
                
                {/* Product recommendations */}
                {recommendedProducts.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-gray-500">Recommended products:</p>
                    {recommendedProducts.map(product => (
                      <ProductRecommendation 
                        key={product.id}
                        product={product}
                        onClick={() => handleProductSelect(product.id)}
                      />
                    ))}
                  </div>
                )}
                
                {isTyping && <ChatTypingIndicator />}
              </div>
            )}
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input form */}
          <form onSubmit={handleSend} className="border-t border-gray-200 p-4">
            <div className="flex">
              <input
                type="text"
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!isConnected}
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400"
                disabled={!isConnected || !input.trim()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;