"use client";

import React, { useState, useRef, useEffect } from 'react';

interface Message {
  text: string;
  sender: 'user' | 'assistant';
  timestamp: string;
}

const ChatUI = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      text: inputValue,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages([...messages, newMessage]);
    setInputValue('');
    
    // Here you would typically make an API call to get the assistant's response
    setTimeout(() => {
      const assistantMessage: Message = {
        text: "This is a sample response.",
        sender: 'assistant',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    }, 1000);
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
            {message.text}
          </div>
        ))}
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
          />
          <button 
            type="submit" 
            className="px-6 py-3 bg-[#005073] text-white rounded-lg text-base 
                     cursor-pointer transition-colors duration-200 hover:bg-[#003d57]"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatUI; 