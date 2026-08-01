import { useState, useEffect, useRef } from 'react';

const API_BASE = 'https://pakexplorerai-travel-management-project-backend-production.up.railway.app';

export default function VedhiWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "Hi! I'm Vedhi 👋 Ask me anything about destinations, packages, or hotels — or say something like \"3 days in Swat\" for a full itinerary." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [destinations, setDestinations] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/destinations`)
      .then(res => res.json())
      .then(data => setDestinations(Array.isArray(data) ? data : []))
      .catch(() => setDestinations([]));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  function findDestination(text) {
    const lower = text.toLowerCase();
    return destinations.find(
      d =>
        (d.name && lower.includes(d.name.toLowerCase())) ||
        (d.city && lower.includes(d.city.toLowerCase()))
    );
  }

  function extractDays(text) {
    const match = text.match(/(\d+)\s*(day|days|din)/i);
    return match ? parseInt(match[1], 10) : null;
  }

  async function handleItineraryRequest(text, days) {
    const destination = findDestination(text);

    if (!destination) {
      const names = destinations.slice(0, 5).map(d => d.name).join(', ');
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: names
            ? `Which destination? Try one of these: ${names}.`
            : "I couldn't find that destination in our list."
        }
      ]);
      return;
    }

    setMessages(prev => [
      ...prev,
      { sender: 'bot', text: `Building a ${days}-day itinerary for ${destination.name}...` }
    ]);

    try {
      const res = await fetch(
        `${API_BASE}/api/itinerary/generate?destination_id=${destination.id}&days=${days}`
      );
      const data = await res.json();

      if (!res.ok) {
        setMessages(prev => [...prev, { sender: 'bot', text: data.error || 'Something went wrong generating the itinerary.' }]);
        return;
      }

      const itineraryText = data.days
        .map(
          d =>
            `Day ${d.day} — ${d.title}\nMorning: ${d.morning}\nAfternoon: ${d.afternoon}\nEvening: ${d.evening}\nTip: ${d.tip}`
        )
        .join('\n\n');

      setMessages(prev => [...prev, { sender: 'bot', text: itineraryText }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Could not reach the server. Please try again.' }]);
    }
  }

  async function handleGeneralQuestion(text) {
    try {
      const res = await fetch(`${API_BASE}/api/vedhi/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text })
      });
      const data = await res.json();

      if (!res.ok) {
        setMessages(prev => [...prev, { sender: 'bot', text: data.error || "Sorry, I couldn't get an answer." }]);
        return;
      }

      setMessages(prev => [...prev, { sender: 'bot', text: data.answer }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Could not reach the server. Please try again.' }]);
    }
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;

    setMessages(prev => [...prev, { sender: 'user', text }]);
    setInput('');
    setLoading(true);

    const days = extractDays(text);

    if (days) {
      await handleItineraryRequest(text, days);
    } else {
      await handleGeneralQuestion(text);
    }

    setLoading(false);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSend();
  }

  return (
    <div style={{ position: 'fixed', bottom: 24, left: 24, zIndex: 9999, fontFamily: 'inherit' }}>
      {isOpen && (
        <div
          style={{
            width: 340,
            height: 460,
            background: '#0B1D3A',
            borderRadius: 16,
            boxShadow: '0 12px 32px rgba(0,0,0,0.35)',
            display: 'flex',
            flexDirection: 'column',
            marginBottom: 12,
            overflow: 'hidden',
            border: '1px solid #1E3A66'
          }}
        >
          <div
            style={{
              background: '#0F2A52',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid #1E3A66'
            }}
          >
            <div style={{ color: '#fff', fontWeight: 600, fontSize: 15 }}>Vedhi — Travel Assistant</div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: '#9FB3D9', fontSize: 18, cursor: 'pointer' }}
              aria-label="Close chat"
            >
              ×
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  background: m.sender === 'user' ? '#1E3A66' : '#132B52',
                  color: '#E6ECF7',
                  padding: '8px 12px',
                  borderRadius: 12,
                  maxWidth: '85%',
                  whiteSpace: 'pre-line',
                  fontSize: 13.5,
                  lineHeight: 1.4
                }}
              >
                {m.text}
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', color: '#9FB3D9', fontSize: 12.5, padding: '4px 12px' }}>
                Vedhi is typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={{ display: 'flex', borderTop: '1px solid #1E3A66', padding: 10, gap: 8 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything, or e.g. 3 days in Swat"
              disabled={loading}
              style={{
                flex: 1,
                background: '#132B52',
                border: '1px solid #1E3A66',
                borderRadius: 8,
                padding: '8px 10px',
                color: '#fff',
                fontSize: 13.5,
                outline: 'none'
              }}
            />
            <button
              onClick={handleSend}
              disabled={loading}
              style={{
                background: '#3B6FE0',
                border: 'none',
                borderRadius: 8,
                padding: '0 14px',
                color: '#fff',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(prev => !prev)}
        style={{
          width: 58,
          height: 58,
          borderRadius: '50%',
          background: '#0F2A52',
          border: '2px solid #3B6FE0',
          color: '#fff',
          fontSize: 24,
          cursor: 'pointer',
          boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        aria-label="Open Vedhi chat"
      >
        {isOpen ? '×' : '💬'}
      </button>
    </div>
  );
}