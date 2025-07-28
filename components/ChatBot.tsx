"use client";

import { useState, useRef, useEffect } from 'react';
import { Send, X, MessageCircle, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ChatBot() {
  console.log('🔍 ChatBot component loaded!'); // Debug log
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm GLG Capital's AI assistant. How can I help you today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Simulate AI response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const aiResponse = generateAIResponse(inputValue.trim());
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble responding right now. Please try again later.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('investment') || input.includes('invest')) {
      return "Our investment services include equity pledge financing, portfolio management, and strategic consulting. We offer fixed returns secured by company shares. Would you like to learn more about our investment opportunities?";
    }
    
    if (input.includes('contact') || input.includes('email') || input.includes('phone')) {
      return "You can contact us at corefound@glgcapitalgroupllc.com or call +1 307 263 0876. We're located at 1309 Coffeen Avenue STE 1200, Sheridan, Wyoming 82801.";
    }
    
    if (input.includes('service') || input.includes('what do you do')) {
      return "GLG Capital Group LLC provides innovative financial solutions including equity pledge financing, investment consulting, and strategic capital management. We help businesses and individuals achieve sustainable growth.";
    }
    
    if (input.includes('location') || input.includes('where')) {
      return "We're headquartered at 1309 Coffeen Avenue STE 1200, Sheridan, Wyoming 82801, United States.";
    }
    
    if (input.includes('equity') || input.includes('pledge')) {
      return "Our equity pledge system allows companies to secure financing by pledging shares as collateral. This innovative approach provides fixed returns while maintaining ownership control. Would you like to learn more?";
    }
    
    if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      return "Hello! Welcome to GLG Capital Group. I'm here to help you with any questions about our investment services, equity pledge financing, or general inquiries. How can I assist you today?";
    }
    
    return "Thank you for your question. GLG Capital Group specializes in innovative financial solutions including equity pledge financing and strategic investment consulting. For specific inquiries, please contact us at corefound@glgcapitalgroupllc.com or call +1 307 263 0876.";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Debug div - always visible */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: 'red',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        zIndex: 9999,
        fontSize: '12px'
      }}>
        ChatBot Debug: Loaded ✅
      </div>
      
      {/* ChatBot Button */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #0a2540 0%, #1a3556 100%)',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(10,37,64,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          zIndex: 1000,
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <MessageCircle size={24} />
      </button>

      {/* ChatBot Modal */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001,
            padding: '1rem'
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '400px',
              maxHeight: '600px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #0a2540 0%, #1a3556 100%)',
                color: 'white',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MessageCircle size={20} />
                <span style={{ fontWeight: 600 }}>GLG Capital Assistant</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '0.25rem'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div
              style={{
                flex: 1,
                padding: '1rem',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                maxHeight: '400px'
              }}
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  style={{
                    display: 'flex',
                    justifyContent: message.isUser ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div
                    style={{
                      maxWidth: '80%',
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      background: message.isUser 
                        ? 'linear-gradient(135deg, #0a2540 0%, #1a3556 100%)'
                        : '#f1f5f9',
                      color: message.isUser ? 'white' : '#1e293b',
                      fontSize: '0.9rem',
                      lineHeight: 1.4
                    }}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      background: '#f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Loader2 size={16} className="animate-spin" />
                    <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
                      Typing...
                    </span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div
              style={{
                padding: '1rem',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'center'
              }}
            >
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                style={{
                  background: 'linear-gradient(135deg, #0a2540 0%, #1a3556 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: (!inputValue.trim() || isLoading) ? 0.5 : 1
                }}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 