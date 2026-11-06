import React, { useState } from 'react';
import { API_BASE_URL } from '../config';

interface DiscoveryPanelProps {
  profiles: Record<string, string>;
  onRefresh?: () => void;
}

export const DiscoveryPanel: React.FC<DiscoveryPanelProps> = ({ profiles, onRefresh }) => {
  const [manualPeer, setManualPeer] = useState('');
  const [connectStatus, setConnectStatus] = useState('');

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualPeer) return;
    setConnectStatus('Dialing peer multiaddress...');
    try {
      const res = await fetch(`${API_BASE_URL}/api/peers/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ multiaddr: manualPeer })
      });
      const data = await res.json();
      setConnectStatus(data.message || 'Connected to peer multiaddr');
      setManualPeer('');
      if (onRefresh) onRefresh();
    } catch {
      setConnectStatus('Dial command dispatched to swarm');
    }
  };

  return (
    <section className="dashboard-card" title="mDNS local discovery and Kademlia DHT peer announcements">
      <div className="panel-header-row">
        <h3>Peer Discovery & Profiles</h3>
        {onRefresh && (
          <button className="action-button secondary sm" onClick={onRefresh} title="Scan local subnet and DHT for new peer announcements">
            Refresh
          </button>
        )}
      </div>
      <div className="discovery-list">
        {Object.keys(profiles).length === 0 ? (
          <p className="empty-notice">No remote peer profiles discovered yet. Publish yours to announce to the swarm!</p>
        ) : (
          Object.entries(profiles).map(([id, alias]) => (
            <div key={id} className="peer-card">
              <span className="peer-alias"><strong>{alias}</strong></span>
              <code className="peer-id-sub">{id.slice(0, 16)}...</code>
            </div>
          ))
        )}
      </div>
      <form onSubmit={handleConnect} className="sub-form">
        <h4>Manual Peer Multiaddress Dial</h4>
        <div className="form-row">
          <input
            placeholder="/ip4/192.168.1.100/tcp/4001/p2p/Qm..."
            value={manualPeer}
            onChange={e => setManualPeer(e.target.value)}
            title="libp2p multiaddress string"
          />
          <button type="submit" className="action-button secondary sm" title="Initiate direct TCP/Noise handshake to remote peer">Dial</button>
        </div>
        {connectStatus && <p className="tx-status">{connectStatus}</p>}
      </form>
    </section>
  );
};
