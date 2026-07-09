import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Globe, 
  RefreshCw, 
  ExternalLink, 
  Trash2, 
  Sparkles, 
  AlertCircle 
} from 'lucide-react';

// A simple React-based markdown parser to handle bold (**), headers (###), lists (*, 1.), and inline code (`)
const parseMarkdown = (text) => {
  if (!text) return '';
  
  const lines = text.split('\n');
  const elements = [];
  
  let inList = false;
  let listItems = [];
  let listType = null; // 'ul' or 'ol'
  
  const flushList = (key) => {
    if (listItems.length > 0) {
      const ListTag = listType === 'ol' ? 'ol' : 'ul';
      elements.push(
        <ListTag 
          key={key} 
          style={{ 
            paddingLeft: '20px', 
            margin: '8px 0', 
            listStyleType: listType === 'ol' ? 'decimal' : 'disc',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}
        >
          {listItems}
        </ListTag>
      );
      listItems = [];
      inList = false;
      listType = null;
    }
  };
  
  const formatInline = (str) => {
    const boldRegex = /(\*\*.*?\*\*|`.*?`)/g;
    const splitParts = str.split(boldRegex);
    
    return splitParts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} style={{ fontWeight: '750', color: 'var(--color-text-primary)' }}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code 
            key={index} 
            style={{ 
              backgroundColor: '#F1F5F9', 
              padding: '2px 6px', 
              borderRadius: '4px', 
              fontFamily: 'monospace', 
              fontSize: '12px',
              color: '#EF4444',
              fontWeight: '600'
            }}
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };
  
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    
    // Check for headers
    if (trimmed.startsWith('#### ')) {
      flushList(`list-before-h4-${idx}`);
      elements.push(
        <h5 key={idx} style={{ fontSize: '13px', fontWeight: '800', margin: '14px 0 6px 0', color: 'var(--color-text-primary)' }}>
          {formatInline(trimmed.slice(5))}
        </h5>
      );
      return;
    }
    if (trimmed.startsWith('### ')) {
      flushList(`list-before-h3-${idx}`);
      elements.push(
        <h4 key={idx} style={{ fontSize: '14.5px', fontWeight: '800', margin: '16px 0 8px 0', color: 'var(--color-text-primary)' }}>
          {formatInline(trimmed.slice(4))}
        </h4>
      );
      return;
    }
    if (trimmed.startsWith('## ')) {
      flushList(`list-before-h2-${idx}`);
      elements.push(
        <h3 key={idx} style={{ fontSize: '16px', fontWeight: '800', margin: '18px 0 10px 0', color: 'var(--color-text-primary)' }}>
          {formatInline(trimmed.slice(3))}
        </h3>
      );
      return;
    }
    
    // Check for unordered lists
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      if (!inList || listType !== 'ul') {
        flushList(`list-flush-${idx}`);
        inList = true;
        listType = 'ul';
      }
      listItems.push(
        <li key={idx} style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
          {formatInline(trimmed.slice(2))}
        </li>
      );
      return;
    }
    
    // Check for ordered lists
    const olMatch = trimmed.match(/^(\d+)\.\s(.*)/);
    if (olMatch) {
      if (!inList || listType !== 'ol') {
        flushList(`list-flush-${idx}`);
        inList = true;
        listType = 'ol';
      }
      listItems.push(
        <li key={idx} style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
          {formatInline(olMatch[2])}
        </li>
      );
      return;
    }
    
    // Empty line separates paragraphs
    if (trimmed === '') {
      flushList(`list-flush-empty-${idx}`);
      return;
    }
    
    // Regular text line
    flushList(`list-flush-text-${idx}`);
    elements.push(
      <p key={idx} style={{ fontSize: '13.5px', lineHeight: '1.6', margin: '8px 0', color: 'var(--color-text-secondary)' }}>
        {formatInline(line)}
      </p>
    );
  });
  
  flushList('list-end');
  return elements;
};

export default function ChatDrawer({ 
  show, 
  onClose, 
  audit, 
  token, 
  backendUrl 
}) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini');
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Fetch chat history when drawer opens for a specific audit
  useEffect(() => {
    if (show && audit && token) {
      fetchChatHistory();
    }
  }, [show, audit, token]);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${backendUrl}/chats/${audit._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to load chat history.');
      }
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || loading) return;

    const messageText = inputValue.trim();
    setInputValue('');
    setError(null);
    
    // Add user message to UI immediately
    const userMessage = {
      sender: 'user',
      text: messageText,
      timestamp: new Date(),
      modelUsed: selectedModel,
      sources: []
    };
    
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await fetch(`${backendUrl}/chats/${audit._id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: messageText,
          model: selectedModel,
          webSearchEnabled
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response from AI.');
      }

      setMessages(prev => [...prev, data.message]);
    } catch (err) {
      console.error(err);
      setError(err.message);
      // Remove the user message if it failed, or show error block
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (!window.confirm('Are you sure you want to clear this audit\'s chat history?')) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${backendUrl}/chats/${audit._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to clear chat history.');
      }
      
      const data = await response.json();
      setMessages(data.chat?.messages || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!show || !audit) return null;

  const totalSavings = audit.savings?.totalMonthly || 0;
  const formattedDate = new Date(audit.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(4px)',
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'flex-end',
      transition: 'opacity 0.3s ease'
    }}>
      {/* Click outside to close */}
      <div onClick={onClose} style={{ flexGrow: 1, height: '100%' }}></div>

      {/* Drawer Body */}
      <div style={{
        width: '100%',
        maxWidth: '550px',
        height: '100%',
        backgroundColor: '#FFFFFF',
        boxShadow: '-10px 0 30px -5px rgba(0, 0, 0, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-body)',
        animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* CSS Animation injection */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes slideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: #CBD5E1;
            border-radius: 3px;
          }
        `}} />

        {/* Drawer Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-text-primary)' }}>
                  🧠 Consult AI Cost Specialist
                </h3>
                <span className="badge badge-green" style={{ fontSize: '10px', padding: '2px 8px' }}>
                  Premium
                </span>
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                Audit generated on {formattedDate} • <strong>+${totalSavings.toLocaleString()}/mo</strong> savings.
              </p>
            </div>
            <button 
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-muted)',
                padding: '4px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.15s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#F1F5F9'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <X size={20} />
            </button>
          </div>

          {/* Active AI Status Bar */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            backgroundColor: '#F8FAFC',
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid var(--color-border)',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--color-text-muted)' }}>
                Active Specialist:
              </span>
              <span className="badge badge-green" style={{ fontSize: '10px', padding: '3px 10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                Audex AI Optimized Cost Consultant
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {messages.length > 1 && (
                <button
                  onClick={handleClearChat}
                  title="Clear chat history"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#EF4444',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px',
                    borderRadius: '4px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEE2E2'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div 
          className="custom-scrollbar"
          data-lenis-prevent
          style={{
            flexGrow: 1,
            overflowY: 'auto',
            padding: '24px',
            backgroundColor: 'var(--color-bg-primary)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          {error && (
            <div style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              borderRadius: '8px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'start',
              gap: '8px',
              color: '#B91C1C',
              fontSize: '13px'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Error sending message:</strong> {error}
                <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.8 }}>
                  Fallback routes will be attempted, but all configured API endpoints failed. Please check internet connection or key configurations.
                </div>
              </div>
            </div>
          )}

          {messages.map((msg, index) => {
            const isUser = msg.sender === 'user';
            
            // Fallback status detection
            // If the user selected e.g. gemini, but modelUsed in response is different (e.g. grok/mistral)
            const wasFallback = !isUser && msg.modelUsed !== 'system' && msg.modelUsed !== selectedModel;

            return (
              <div 
                key={index} 
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  gap: '4px'
                }}
              >
                {/* Speaker Header */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  fontSize: '10px', 
                  fontWeight: '700', 
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  paddingLeft: isUser ? '0' : '4px',
                  paddingRight: isUser ? '4px' : '0'
                }}>
                  {isUser ? 'You' : 'Audex Cost Specialist'}
                  {!isUser && msg.modelUsed && msg.modelUsed !== 'system' && (
                    <span style={{ 
                      fontSize: '9px',
                      padding: '1px 5px',
                      borderRadius: '3px',
                      backgroundColor: wasFallback ? '#FFFBEB' : '#F1F5F9',
                      color: wasFallback ? '#B45309' : 'var(--color-text-muted)',
                      border: wasFallback ? '1px solid #FDE68A' : 'none',
                      fontWeight: '700'
                    }}>
                      {wasFallback ? `⚠️ Fallback: ${msg.modelUsed.toUpperCase()}` : msg.modelUsed.toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Message Bubble */}
                <div style={{
                  padding: '12px 16px',
                  borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  backgroundColor: isUser ? 'var(--color-green-primary)' : '#FFFFFF',
                  color: isUser ? '#FFFFFF' : 'var(--color-text-primary)',
                  boxShadow: 'var(--shadow-sm)',
                  border: isUser ? 'none' : '1px solid var(--color-border)',
                  fontSize: '13.5px',
                  lineHeight: '1.5',
                  whiteSpace: isUser ? 'pre-wrap' : 'normal',
                  wordBreak: 'break-word'
                }}>
                  {isUser ? msg.text : parseMarkdown(msg.text)}
                </div>

                {/* Render sources if present */}
                {!isUser && msg.sources && msg.sources.length > 0 && (
                  <div style={{
                    marginTop: '6px',
                    width: '100%',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '11px',
                    color: 'var(--color-text-secondary)',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                  }}>
                    <div style={{ fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px', color: 'var(--color-text-muted)' }}>
                      <Globe size={11} /> Grounded Sources used:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {msg.sources.map((src, sIdx) => (
                        <div key={sIdx} style={{ borderBottom: sIdx < msg.sources.length - 1 ? '1px solid #F1F5F9' : 'none', paddingBottom: sIdx < msg.sources.length - 1 ? '4px' : '0' }}>
                          <a 
                            href={src.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ 
                              color: '#2563EB', 
                              textDecoration: 'none', 
                              fontWeight: '600',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '2px'
                            }}
                          >
                            {src.title} <ExternalLink size={9} />
                          </a>
                          <div style={{ color: 'var(--color-text-muted)', fontSize: '10.5px', marginTop: '2px', fontStyle: 'italic' }}>
                            "{src.snippet.substring(0, 100)}..."
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* AI Response Loading Indicator */}
          {loading && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              maxWidth: '85%',
              alignSelf: 'flex-start',
              gap: '4px'
            }}>
              <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--color-text-muted)' }}>
                Audex Specialist is thinking...
              </div>
              <div style={{
                padding: '12px 20px',
                borderRadius: '16px 16px 16px 4px',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <RefreshCw size={14} className="animate-spin" style={{ animation: 'spin 1s linear infinite', color: 'var(--color-green-primary)' }} />
                <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                  {webSearchEnabled ? 'Searching web & formulating strategy...' : 'Reviewing audit report...'}
                </span>
                <style dangerouslySetInnerHTML={{__html: `
                  @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                  }
                `}} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Footer */}
        <form 
          onSubmit={handleSendMessage}
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--color-border)',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          {/* Controls Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Web Search Toggle */}
            <button
              type="button"
              onClick={() => setWebSearchEnabled(!webSearchEnabled)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '9999px',
                border: '1px solid',
                borderColor: webSearchEnabled ? 'var(--color-green-primary)' : 'var(--color-border)',
                backgroundColor: webSearchEnabled ? 'var(--color-green-light)' : '#FFFFFF',
                color: webSearchEnabled ? 'var(--color-green-text)' : 'var(--color-text-secondary)',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Globe size={13} />
              {webSearchEnabled ? 'Live Search On' : 'Search Web'}
            </button>

            <span style={{ fontSize: '10.5px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Sparkles size={11} style={{ color: '#D97706' }} /> Core context: Audited Report Details
            </span>
          </div>

          {/* Text Input Row */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about model comparisons, pricing updates, or action plans..."
              disabled={loading}
              style={{
                flexGrow: 1,
                padding: '12px 16px',
                borderRadius: '10px',
                border: '1px solid var(--color-border)',
                fontSize: '13.5px',
                fontFamily: 'var(--font-body)',
                outline: 'none',
                transition: 'border-color 0.15s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-text-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
            />
            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              style={{
                backgroundColor: (loading || !inputValue.trim()) ? '#CBD5E1' : 'var(--color-green-primary)',
                color: '#FFFFFF',
                border: 'none',
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: (loading || !inputValue.trim()) ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.15s'
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
