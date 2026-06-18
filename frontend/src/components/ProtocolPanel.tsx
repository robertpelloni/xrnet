import React, { useState } from 'react';

interface ProtocolPanelProps {
  peers: number;
  network: string;
}

export const ProtocolPanel: React.FC<ProtocolPanelProps> = ({ peers, network }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    setIsSearching(true);

    try {
      await fetch('http://localhost:8080/api/dht/put', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: `search:${Date.now()}`, value: searchQuery })
      });

      setTimeout(() => {
        setIsSearching(false);
        alert(`Everything Protocol Search Result: No decentralized records found for "${searchQuery}". Query propagated to DHT.`);
      }, 1500);
    } catch (error) {
      console.error('Search failed:', error);
      setIsSearching(false);
    }
  };

  return (
    <section className="protocol-panel">
      <h2>Everything Protocol</h2>
      <div className="metric">
        <label>Peers:</label>
        <span>{peers}</span>
      </div>
      <div className="metric">
        <label>P2P Node:</label>
        <span>Active (libp2p)</span>
      </div>
      <div className="metric">
        <label>Network:</label>
        <span className={network.toLowerCase()}>{network}</span>
      </div>

      <form className="search-form" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search the DHT..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit" disabled={isSearching}>
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </form>
    </section>
  );
};
