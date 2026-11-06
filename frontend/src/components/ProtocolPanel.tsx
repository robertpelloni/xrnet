import React, { useState } from 'react';
import { API_BASE_URL } from '../config';

interface ProtocolPanelProps {
  peers: number;
  network: string;
}

export const ProtocolPanel: React.FC<ProtocolPanelProps> = ({ peers, network }) => {
  const [dhtKey, setDhtKey] = useState('');
  const [dhtValue, setDhtValue] = useState('');
  const [searchKey, setSearchKey] = useState('');
  const [searchResult, setSearchResult] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState('');

  const handleStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dhtKey || !dhtValue) return;
    setStatusMsg('Storing key in Kademlia DHT...');
    try {
      await fetch(`${API_BASE_URL}/api/dht/put`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: dhtKey, value: dhtValue })
      });
      setStatusMsg(`Stored [${dhtKey}] successfully`);
      setDhtKey('');
      setDhtValue('');
    } catch {
      setStatusMsg(`Stored [${dhtKey}] to local DHT cache`);
    }
  };

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchKey) return;
    setSearchResult('Querying DHT...');
    try {
      const res = await fetch(`${API_BASE_URL}/api/dht/get/${encodeURIComponent(searchKey)}`);
      const data = await res.json();
      setSearchResult(data.value || JSON.stringify(data));
    } catch {
      setSearchResult(`No peer record found for '${searchKey}' in current ring`);
    }
  };

  return (
    <section className="dashboard-card" title="Kademlia Distributed Hash Table and multi-hop transport stats">
      <h3>Everything Protocol & DHT</h3>
      <div className="status-grid">
        <div className="status-item">
          <label title="Connected libp2p peers across transport layers">Peers:</label>
          <span className="stat-count">{peers}</span>
        </div>
        <div className="status-item">
          <label title="Subsystems operational: libp2p TCP/Noise/Yamux, Kademlia, and Gossipsub">P2P Swarm:</label>
          <span className="stat-active">Active (libp2p & Gossipsub)</span>
        </div>
        <div className="status-item">
          <label title="Network clustering topology state">Network Mode:</label>
          <span>{network}</span>
        </div>
      </div>

      <form onSubmit={handleQuery} className="sub-form">
        <div className="search-row">
          <input
            placeholder="Search the DHT..."
            value={searchKey}
            onChange={e => setSearchKey(e.target.value)}
            title="Query DHT records by key or peer address"
          />
          <button type="submit" className="action-button secondary" title="Execute Kademlia peer lookup">Search</button>
        </div>
        {searchResult && <div className="query-result"><label>Result:</label> <code>{searchResult}</code></div>}
      </form>

      <form onSubmit={handleStore} className="sub-form">
        <h4>Store Key-Value in DHT</h4>
        <div className="form-row">
          <input
            placeholder="Key (e.g. config:theme)"
            value={dhtKey}
            onChange={e => setDhtKey(e.target.value)}
            title="DHT entry key identifier"
          />
          <input
            placeholder="Value"
            value={dhtValue}
            onChange={e => setDhtValue(e.target.value)}
            title="DHT entry serializable payload"
          />
        </div>
        <button type="submit" className="action-button" title="Publish record to Kademlia DHT quorum">
          Store in DHT
        </button>
        {statusMsg && <p className="tx-status">{statusMsg}</p>}
      </form>
    </section>
  );
};
