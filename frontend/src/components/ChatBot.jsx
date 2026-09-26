import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendAiChat } from '../services/api';
import { getUserLocation } from '../utils/locationUtils';
import '../styles/ChatBot.css';

const WELCOME_MESSAGE = {
  role: 'assistant',
  content:
    'Hello, I am the EmerCare Assistant. Describe your symptoms or emergency and I will suggest primary treatment and find nearby hospitals and blood donors for you.'
};

const buildHistory = (messages) =>
  messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .slice(-10)
    .map((m) => ({ role: m.role, content: m.content }));

function SuggestionSection({ title, items, emptyText, viewLabel, onView, renderItem }) {
  return (
    <div className="chat-suggestions">
      <div className="chat-suggestions-header">
        <span className="chat-suggestions-title">{title}</span>
        {items.length > 0 && (
          <button type="button" className="chat-suggestions-view" onClick={onView}>
            {viewLabel}
          </button>
        )}
      </div>
      {items.length === 0 ? (
        <p className="chat-suggestions-empty">{emptyText}</p>
      ) : (
        <div className="chat-suggestions-list">{items.map(renderItem)}</div>
      )}
    </div>
  );
}

export default function ChatBot() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleUseLocation = async () => {
    setError(null);
    try {
      const coords = await getUserLocation();
      setLocation({ latitude: coords.latitude, longitude: coords.longitude });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMessage = { role: 'user', content: text };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setError(null);
    setLoading(true);

    try {
      const response = await sendAiChat({
        message: text,
        history: buildHistory(messages),
        latitude: location?.latitude ?? null,
        longitude: location?.longitude ?? null
      });

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.reply,
          suggestions: response.suggestions
        }
      ]);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="chatbot-fab-wrap">
        <button
          type="button"
          className={`chatbot-fab${isOpen ? ' chatbot-fab-open' : ''}`}
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Open EmerCare Assistant"
          title="EmerCare Assistant"
        >
          {isOpen ? (
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor" stroke="none">
              <path d="M12 3l1.9 5.1a2 2 0 0 0 1.2 1.2L20.2 12l-5.1 1.9a2 2 0 0 0-1.2 1.2L12 20.2l-1.9-5.1a2 2 0 0 0-1.2-1.2L3.8 12l5.1-1.9a2 2 0 0 0 1.2-1.2L12 3z" />
            </svg>
          )}
        </button>
      </div>

      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <span className="chatbot-avatar">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </span>
              <div>
                <div className="chatbot-title">EmerCare Assistant</div>
                <div className="chatbot-status">Triage · Hospital & donor suggestions</div>
              </div>
            </div>
            <button type="button" className="chatbot-close" onClick={() => setIsOpen(false)} aria-label="Close chat">
              &times;
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`chat-msg chat-msg-${msg.role}`}>
                <div className="chat-bubble">{msg.content}</div>
                {msg.suggestions && (
                  <div className="chat-suggestions-wrap">
                    <SuggestionSection
                      title="Hospitals near you"
                      items={msg.suggestions.hospitals}
                      emptyText="No hospitals found in range."
                      viewLabel="View all"
                      onView={() => navigate('/hospitals')}
                      renderItem={(h) => (
                        <div key={h.id} className="chat-suggestion-card">
                          <div className="chat-suggestion-main">
                            <span className="chat-suggestion-name">{h.hospitalName}</span>
                            <span className="chat-suggestion-meta">
                              {[h.city, h.distanceKm !== undefined ? `${h.distanceKm} km` : null]
                                .filter(Boolean)
                                .join(' · ')}
                            </span>
                          </div>
                          {h.phone && (
                            <a href={`tel:${h.phone}`} className="chat-suggestion-call">
                              Call
                            </a>
                          )}
                        </div>
                      )}
                    />
                    <SuggestionSection
                      title="Blood donors"
                      items={msg.suggestions.donors}
                      emptyText={msg.suggestions.donors.length === 0 && msg.suggestions.hospitals.length > 0 ? 'No donors in range.' : 'No matching blood donors found.'}
                      viewLabel="View all"
                      onView={() => navigate('/donors')}
                      renderItem={(d) => (
                        <div key={d.id} className="chat-suggestion-card">
                          <span className="chat-blood-badge">{d.bloodGroup}</span>
                          <div className="chat-suggestion-main">
                            <span className="chat-suggestion-name">{d.name}</span>
                            <span className="chat-suggestion-meta">
                              {[d.city, d.distanceKm !== undefined ? `${d.distanceKm} km` : null]
                                .filter(Boolean)
                                .join(' · ')}
                            </span>
                          </div>
                          {d.phone && (
                            <a href={`tel:${d.phone}`} className="chat-suggestion-call">
                              Call
                            </a>
                          )}
                        </div>
                      )}
                    />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="chat-msg chat-msg-assistant">
                <div className="chat-bubble chat-typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-footer">
            <button
              type="button"
              className={`chat-location-btn${location ? ' chat-location-btn-active' : ''}`}
              onClick={handleUseLocation}
              title="Allow location to get nearby suggestions"
              disabled={loading}
            >
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="3 11 22 2 13 21 11 13 3 11" />
              </svg>
              {location ? 'Location on' : 'Use my location'}
            </button>

            {error && <div className="chat-error">{error}</div>}

            <form className="chat-input-form" onSubmit={handleSend}>
              <input
                ref={inputRef}
                type="text"
                className="chat-input"
                placeholder="Describe your symptoms..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
              />
              <button type="submit" className="chat-send-btn" disabled={loading || !input.trim()}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}