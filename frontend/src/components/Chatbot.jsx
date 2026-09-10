import React, { useState, useEffect, useRef } from 'react';
import { 
  FaComments, 
  FaTimes, 
  FaMinus, 
  FaExpandAlt,
  FaPaperPlane, 
  FaSpinner, 
  FaUser, 
  FaRedo,
  FaExternalLinkAlt
} from 'react-icons/fa';
import { sendChatMessage } from '../services/api';

const QUICK_PROMPTS = [
  'Tell me about Abhishek',
  'What are his core skills & stack?',
  'Show me his top projects',
  'How can I get in touch?'
];

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Hi there! 👋 I'm Abhishek's virtual assistant.\n\nFeel free to ask me anything about his background, experience, projects, or how to get in touch!"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [messages, isOpen, isMinimized]);

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    setInput('');

    const userMessage = { role: 'user', text: query };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setLoading(true);

    try {
      // Build history for conversational flow
      const history = nextMessages.slice(1, -1).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        text: m.text
      }));

      const res = await sendChatMessage(query, history);

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: res.reply
        }
      ]);
    } catch (err) {
      console.error('Chatbot request error:', err);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: "I'm having trouble connecting right now. Please try again in a moment or contact Abhishek directly at **pabhishek7333@gmail.com**.",
          isError: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    setMessages([
      {
        role: 'assistant',
        text: "Conversation refreshed. How can I help you today?"
      }
    ]);
  };

  // Helper to format clean text (bold, bullet points, links)
  const renderFormattedText = (text) => {
    if (!text) return null;

    const lines = text.split('\n');
    return lines.map((line, lineIdx) => {
      const isBullet = /^\s*[*•-]\s+/.test(line);
      const cleanLine = line.replace(/^\s*[*•-]\s+/, '');

      // Parse bold **text** and markdown links [text](url)
      const parts = cleanLine.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\))/g);

      const content = parts.map((part, partIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={partIdx} style={{ color: 'var(--text-1)' }}>{part.slice(2, -2)}</strong>;
        }
        const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
        if (linkMatch) {
          return (
            <a
              key={partIdx}
              href={linkMatch[2]}
              target="_blank"
              rel="noopener noreferrer"
              className="chat-bubble-link"
            >
              {linkMatch[1]} <FaExternalLinkAlt style={{ fontSize: '0.65rem' }} />
            </a>
          );
        }
        return part;
      });

      if (isBullet) {
        return (
          <li key={lineIdx} className="chat-bullet-item">
            {content}
          </li>
        );
      }

      if (!line.trim()) {
        return <div key={lineIdx} style={{ height: '0.45rem' }}></div>;
      }

      return (
        <p key={lineIdx} className="chat-paragraph">
          {content}
        </p>
      );
    });
  };

  return (
    <div className="chatbot-wrapper">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          className="chatbot-trigger-btn"
          onClick={() => { setIsOpen(true); setIsMinimized(false); }}
          title="Chat with Abhishek's Assistant"
          aria-label="Open Chat"
        >
          <div className="trigger-pulse"></div>
          <div className="trigger-avatar-wrap">
            <img 
              src="https://github.com/pabhi0901.png" 
              alt="Abhishek" 
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <span className="trigger-online-dot"></span>
          </div>
          <div className="trigger-text-group">
            <span className="trigger-title">Chat with me</span>
            <span className="trigger-status">Online • Replies instantly</span>
          </div>
          <div className="trigger-chat-icon">
            <FaComments />
          </div>
        </button>
      )}

      {/* Modern Floating Chat Window */}
      {isOpen && (
        <div className={`chatbot-window ${isMinimized ? 'minimized' : ''}`}>
          {/* Header */}
          <div className="chatbot-header">
            <div className="header-info">
              <div className="bot-avatar">
                <img 
                  src="https://github.com/pabhi0901.png" 
                  alt="Abhishek" 
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <span className="avatar-online-dot"></span>
              </div>
              <div className="header-text">
                <div className="bot-title">Abhishek's Assistant</div>
                <div className="bot-subtitle">
                  <span className="status-indicator-dot"></span> Online • Ready to help
                </div>
              </div>
            </div>

            <div className="header-actions">
              <button 
                className="header-action-btn" 
                onClick={handleReset} 
                title="Restart Conversation"
                aria-label="Restart Conversation"
              >
                <FaRedo />
              </button>
              <button 
                className="header-action-btn" 
                onClick={() => setIsMinimized(!isMinimized)} 
                title={isMinimized ? "Maximize" : "Minimize"}
                aria-label={isMinimized ? "Maximize" : "Minimize"}
              >
                {isMinimized ? <FaExpandAlt /> : <FaMinus />}
              </button>
              <button 
                className="header-action-btn" 
                onClick={() => setIsOpen(false)} 
                title="Close"
                aria-label="Close Chat"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Chat Body */}
          {!isMinimized && (
            <>
              <div className="chatbot-messages">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`chat-message-row ${msg.role}`}>
                    {msg.role === 'assistant' && (
                      <div className="msg-bot-avatar">
                        <img 
                          src="https://github.com/pabhi0901.png" 
                          alt="AI" 
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                    )}
                    <div className={`chat-bubble ${msg.role} ${msg.isError ? 'error' : ''}`}>
                      <div className="bubble-content">
                        {renderFormattedText(msg.text)}
                      </div>
                    </div>
                    {msg.role === 'user' && (
                      <div className="msg-user-avatar">
                        <FaUser />
                      </div>
                    )}
                  </div>
                ))}

                {/* Animated Typing Indicator */}
                {loading && (
                  <div className="chat-message-row assistant">
                    <div className="msg-bot-avatar">
                      <img 
                        src="https://github.com/pabhi0901.png" 
                        alt="AI" 
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                    <div className="chat-bubble assistant typing-bubble">
                      <div className="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts (Suggested Questions) */}
              {messages.length <= 2 && !loading && (
                <div className="quick-prompts-container">
                  <div className="quick-prompts-label">Suggested:</div>
                  <div className="quick-prompts-scroll">
                    {QUICK_PROMPTS.map((prompt, idx) => (
                      <button
                        key={idx}
                        className="quick-prompt-chip"
                        onClick={() => handleSend(prompt)}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Input Bar */}
              <div className="chatbot-input-bar">
                <input
                  ref={inputRef}
                  type="text"
                  className="chatbot-input"
                  placeholder="Ask a question..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                />
                <button
                  className="chatbot-send-btn"
                  onClick={() => handleSend()}
                  disabled={!input.trim() || loading}
                  aria-label="Send"
                >
                  {loading ? <FaSpinner className="spin" /> : <FaPaperPlane />}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Chatbot;
