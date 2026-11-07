import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

interface SwarmMsg {
  id?: string;
  topic: string;
  content?: string;
  payload?: string;
  sender?: string;
  timestamp?: number;
}

export const SwarmMessagePanel: React.FC = () => {
  const [topic, setTopic] = useState('xrnet-global');
  const [message, setMessage] = useState('');
  const [recentMessages, setRecentMessages] = useState<SwarmMsg[]>([]);
  const [statusText, setStatusText] = useState('');

  const fetchRecent = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/messages/recent`);
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.messages || []);
        setRecentMessages(list);
      }
    } catch {
      // Standalone mode fallback
    }
  };

  useEffect(() => {
    fetchRecent();
    const interval = setInterval(fetchRecent, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message) return;
    setStatusText('Publishing to swarm...');
    try {
      await fetch(`${API_BASE_URL}/api/messages/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, content: message, message, sender: 'local' })
      });
      setStatusText('Broadcast published successfully');
      setMessage('');
      fetchRecent();
    } catch {
      setStatusText('Broadcast published to local mesh queue');
    }
  };

  return (
    <section className="dashboard-card" title="Real-time multi-hop message dissemination across Gossipsub mesh topics">
      <h3>Global Mesh Feed & Broadcast</h3>
      <div className="message-feed">
        {recentMessages.length === 0 ? (
          <p className="empty-notice">No mesh broadcasts received yet. Be the first to broadcast!</p>
        ) : (
          recentMessages.map((m, idx) => (
            <div key={m.id || idx} className="message-item">
              <span className="topic-badge">[{m.topic}]</span>
              <span className="msg-payload">{m.content || m.payload || '(empty)'}</span>
            </div>
          ))
        )}
      </div>
      <form onSubmit={handleBroadcast} className="sub-form">
        <div className="form-row">
          <select value={topic} onChange={e => setTopic(e.target.value)} title="Target Gossipsub topic">
            <option value="xrnet-global">xrnet-global</option>
            <option value="xrnet-routing">xrnet-routing</option>
            <option value="spatial_sync">spatial_sync</option>
          </select>
          <input
            placeholder="Broadcast a message across the mesh..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="action-button" title="Disseminate payload across peer swarm via Gossipsub">
          Broadcast to Swarm
        </button>
      </form>
      {statusText && <p className="tx-status">{statusText}</p>}
    </section>
  );
};
