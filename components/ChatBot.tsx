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
    
    if (input.includes('hello') || input.includes('hi')) {
      return "Hello! Welcome to GLG Capital Group LLC. How can I assist you today?";
    }
    
    if (input.includes('help')) {
      return "I can help you with information about our services, contact details, investment opportunities, and general inquiries about GLG Capital Group LLC. What would you like to know?";
    }
    
    return "Thank you for your message. I'm here to help with information about GLG Capital Group LLC's services, contact details, and investment opportunities. Could you please be more specific about what you'd like to know?";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #0a2540 0%, #1a3556 100%)',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(10,37,64,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          zIndex: 1000,
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 6px 25px rgba(10,37,64,0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(10,37,64,0.3)';
        }}
      >
        <MessageCircle size={24} />
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1001,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsOpen(false);
            }
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '400px',
              height: '600px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #0a2540 0%, #1a3556 100%)',
                color: 'white',
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>
                  GLG Capital Assistant
                </h3>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', opacity: 0.8 }}>
                  AI-powered support
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
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