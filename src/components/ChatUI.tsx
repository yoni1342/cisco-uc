"use client";

import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid'; // Make sure to install uuid package

interface Message {
  text: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  isHtml?: boolean;
}

interface WebhookResponse {
  output: string;
  data?: {
    isFollowup?: boolean;
  };
  activeQuestion?: string;
}

const ChatUI = () => {
  // Session management
  const [sessionId] = useState(() => {
    if (typeof window === 'undefined') return '';
    const savedSessionId = localStorage.getItem('chatSessionId');
    if (savedSessionId) return savedSessionId;
    const newSessionId = uuidv4();
    localStorage.setItem('chatSessionId', newSessionId);
    return newSessionId;
  });

  // Initialize messages from localStorage if they exist
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem(`chatHistory-${sessionId}`);
    if (saved) {
      return JSON.parse(saved);
    }
    return [];
  });

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(`chatHistory-${sessionId}`, JSON.stringify(messages));
  }, [messages, sessionId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    setIsLoading(true);
    // Add user message immediately
    setMessages(prev => [...prev, {
      text: inputValue,
      sender: 'user',
      timestamp: new Date().toISOString(),
      isHtml: true
    }]);
    
    const currentInput = inputValue;
    setInputValue(''); // Clear input immediately

    try {
      const response = await fetch(
        "https://amazon360.app.n8n.cloud/webhook/0638fe95-2a53-48a9-b06c-af9558f09809/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chatInput: currentInput.replace(/<[^>]*>/g, ""),
            sessionId: sessionId,
            action: "sendMessage",
          }),
        }
      );

      if (!response.ok) {
        console.error("Server error:", response.status, await response.text());
        throw new Error(`Server responded with ${response.status}`);
      }

      const responseText = await response.text();
      console.log("Raw response:", responseText);

      const data: WebhookResponse = responseText ? JSON.parse(responseText) : null;

      if (data?.output) {
        setMessages(prev => [...prev, {
          text: data.output,
          sender: 'assistant',
          timestamp: new Date().toISOString(),
        }]);
      }
    } catch (error) {
      console.error("Error details:", error);
      setMessages(prev => [...prev, {
        text: "Sorry, there was an error processing your message. Please try again.",
        sender: 'assistant',
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-5 bg-gray-50 min-h-screen">
      <div className="flex flex-col gap-4 mb-24 p-5 overflow-y-auto max-h-[calc(100vh-120px)]">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`max-w-[70%] p-3 rounded-xl leading-relaxed ${
              message.sender === 'user'
                ? 'self-end bg-[#005073] text-white'
                : 'self-start bg-white border border-gray-200 text-gray-800'
            }`}
          >
            {message.isHtml ? (
              <div dangerouslySetInnerHTML={{ __html: message.text }} />
            ) : (
              message.text
            )}
          </div>
        ))}
        {isLoading && (
          <div className="self-start bg-white border border-gray-200 text-gray-800 p-3 rounded-xl">
            Typing...
          </div>
        )}
        <div ref={messagesEndRef} /> {/* Invisible element for scrolling */}
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-white border-t border-gray-200">
        <form onSubmit={handleSubmit} className="max-w-6xl mx-auto flex gap-3">
          <input
            type="text"
            className="flex-1 p-3 border-2 border-gray-200 rounded-lg text-base 
                     transition-colors duration-200 focus:outline-none focus:border-[#005073]"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className={`px-6 py-3 bg-[#005073] text-white rounded-lg text-base 
                     cursor-pointer transition-colors duration-200 hover:bg-[#003d57]
                     ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isLoading}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatUI; 