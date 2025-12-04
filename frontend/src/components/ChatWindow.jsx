import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, Loader, Trash2 } from 'lucide-react';

// Simple markdown-to-HTML converter with table support
function formatMarkdown(text) {
  if (!text) return '';
  
  // Process tables first (before other formatting)
  let formatted = text;
  
  // Match markdown tables
  const tableRegex = /^(\|.+\|\r?\n)(\|[-:| ]+\|\r?\n)((?:\|.+\|\r?\n?)+)/gm;
  formatted = formatted.replace(tableRegex, (match, header, separator, body) => {
    // Parse header
    const headers = header.split('|').filter(h => h.trim()).map(h => h.trim());
    
    // Parse alignment from separator
    const alignments = separator.split('|').filter(s => s.trim()).map(s => {
      const trimmed = s.trim();
      if (trimmed.startsWith(':') && trimmed.endsWith(':')) return 'center';
      if (trimmed.endsWith(':')) return 'right';
      return 'left';
    });
    
    // Parse body rows
    const rows = body.trim().split('\n').map(row => 
      row.split('|').filter(cell => cell !== '').map(cell => cell.trim())
    );
    
    // Build HTML table
    let tableHtml = '<table class="markdown-table">';
    tableHtml += '<thead><tr>';
    headers.forEach((h, i) => {
      tableHtml += `<th style="text-align: ${alignments[i] || 'left'}">${h}</th>`;
    });
    tableHtml += '</tr></thead><tbody>';
    
    rows.forEach(row => {
      tableHtml += '<tr>';
      row.forEach((cell, i) => {
        tableHtml += `<td style="text-align: ${alignments[i] || 'left'}">${cell}</td>`;
      });
      tableHtml += '</tr>';
    });
    
    tableHtml += '</tbody></table>';
    return tableHtml;
  });
  
  formatted = formatted
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    // Code blocks
    .replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>')
    // Inline code
    .replace(/`(.*?)`/g, '<code>$1</code>')
    // Lists
    .replace(/^\* (.*$)/gim, '<li>$1</li>')
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br />');
  
  // Wrap lists
  formatted = formatted.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
  
  // Wrap in paragraph if not already wrapped
  if (!formatted.startsWith('<h') && !formatted.startsWith('<ul') && !formatted.startsWith('<pre>') && !formatted.startsWith('<table')) {
    formatted = '<p>' + formatted + '</p>';
  }
  
  return formatted;
}

function ChatWindow({ candidates }) {
  const [messages, setMessages] = useState(() => {
    // Load chat history from localStorage on mount
    const saved = localStorage.getItem('chatHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });

      if (!response.ok) throw new Error('Chat request failed');

      const data = await response.json();
      
      // Add AI response
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasCandidates = candidates && candidates.length > 0;

  const clearHistory = () => {
    if (window.confirm('Clear all chat history?')) {
      setMessages([]);
      localStorage.removeItem('chatHistory');
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <MessageCircle size={20} />
        <h3>Ask about Candidates</h3>
        {messages.length > 0 && (
          <button 
            className="clear-chat-btn"
            onClick={clearHistory}
            title="Clear chat history"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {!hasCandidates ? (
        <div className="chat-empty">
          <p>Upload resumes to start asking questions about candidates.</p>
        </div>
      ) : (
        <>
          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="chat-welcome">
                <p>👋 Hi! I can help answer questions about your candidates.</p>
                <p className="chat-example">Try asking:</p>
                <ul>
                  <li>"Who has the most experience?"</li>
                  <li>"Compare the top 2 candidates"</li>
                  <li>"Who is best for technical skills?"</li>
                </ul>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.role}`}>
                <div 
                  className="message-content"
                  dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }}
                />
              </div>
            ))}

            {isLoading && (
              <div className="chat-message assistant">
                <div className="message-content">
                  <Loader className="spinner-small" size={16} />
                  Thinking...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-container">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about candidates..."
              rows={2}
              disabled={isLoading}
              className="chat-input"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="chat-send-btn"
            >
              <Send size={18} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default ChatWindow;
