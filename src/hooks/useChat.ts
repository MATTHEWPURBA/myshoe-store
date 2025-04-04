import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './useAuth'; // Your existing auth hook

export interface ChatMessage {
  id: string;
  content: string;
  isFromUser: boolean;
  timestamp: string;
  metadata?: {
    products?: number[];
    intent?: string;
    sentiment?: string;
  };
}

interface SocketError extends Error {
  description?: string;
  type?: string;
  // Add any other potential properties from Socket.io errors
}

export function useChat() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Initialize socket connection
  useEffect(() => {
    // Try to connect to the actual port the server is running on
    const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL || 'http://localhost:50001';
    console.log('Attempting to connect to WebSocket server at:', WEBSOCKET_URL);

    const newSocket = io(WEBSOCKET_URL, {
      // Try both WebSocket and polling transports
      transports: ['websocket', 'polling'],
      // Increase timeouts
      timeout: 10000,
      auth: {
        token: localStorage.getItem('token') || '',
      },
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    // In the connect handler
    newSocket.on('connect', () => {
      console.log('Connected to chat server');
      setIsConnected(true);
      reconnectAttempts.current = 0;
      setError(null);

      // Use the user variable
      if (user && user.name) {
        console.log(`Chat connected for user: ${user.name}`);
      }
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from chat server');
      setIsConnected(false);
    });

    // Add more detailed logging
    newSocket.on('connect_error', (err: SocketError) => {
      console.error('WebSocket connection error details:', {
        message: err.message,
        // Use optional chaining to safely access these properties
        description: err.description,
        type: err.type,
      });
      reconnectAttempts.current += 1;

      if (reconnectAttempts.current >= maxReconnectAttempts) {
        setError('Could not connect to chat server. Please try again later.');
      }
    });

    newSocket.on('chat:message', (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
      setIsTyping(false);
    });

    newSocket.on('chat:typing', (data: { isTyping: boolean }) => {
      setIsTyping(data.isTyping);
    });

    newSocket.on('chat:error', (error: { message: string }) => {
      console.error('Chat error:', error);
      setError(error.message || 'Something went wrong. Please try again.');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Re-connect when auth state changes
  useEffect(() => {
    if (socket && isAuthenticated !== undefined) {
      // Reconnect with new auth state
      socket.auth = { token: localStorage.getItem('token') || '' };
      socket.connect();
    }
  }, [isAuthenticated, socket]);

  // Send message
  const sendMessage = useCallback(
    (content: string) => {
      if (!socket || !isConnected) {
        setError('Not connected to chat server');
        return false;
      }

      if (!content.trim()) {
        return false;
      }

      const message: ChatMessage = {
        id: uuidv4(),
        content,
        isFromUser: true,
        timestamp: new Date().toISOString(),
      };

      // Add message to UI immediately
      setMessages((prev) => [...prev, message]);

      // Send to server
      socket.emit('chat:message', message);

      return true;
    },
    [socket, isConnected]
  );

  // Clear messages
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    sendMessage,
    clearMessages,
    isConnected,
    isTyping,
    error,
  };
}
