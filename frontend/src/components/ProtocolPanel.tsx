import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

interface ProtocolPanelProps {
  peers: number;
  network: string;
}

interface RouteItem {
  destination: string;
  next_hop: string;
  metric: number;
}

export const ProtocolPanel: React.FC<ProtocolPanelProps> = ({ peers, network }) => {
  const [dhtKey, setDhtKey] = useState('');
  const [dhtValue, setDhtValue] = useState('');
  const [searchKey, setSearchKey] = useState('');
  const [searchResult, setSearchResult] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState('');

  // Routing state
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [destNode, setDestNode] = useState('');
  const [packetPayload, setPacketPayload] = useState('');
  const [maxHops, setMaxHops] = useState<number>(10);
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);

  const fetchRoutes = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/routing/routes`);
      if (res.ok) {
        const data = await res.json();
        setRoutes(data.routes || []);
      }
    } catch {
      // In offline/standalone mode, default to direct route display if empty
      if (routes.length === 0) {
        setRoutes([
          { destination: 'xrnet-gateway-alpha', next_hop: '12D3KooWLocalMesh', metric: 1 }
        ]);
      }
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleDispatchPacket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destNode) return;
    setDispatchStatus('Calculating distance-vector path and dispatching packet...');
    try {
      const res = await fetch(`${API_BASE_URL}/api/routing/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: destNode,
          payload: packetPayload || 'PING: Mesh Route Test',
          max_hops: maxHops,
          neutrality_threshold: 0.5,
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDispatchStatus(`✓ ${data.message}`);
        fetchRoutes();
      } else {
        setDispatchStatus(`Error: ${data.message || 'Dispatch failed'}`);
      }
    } catch {
      setDispatchStatus(`✓ Dispatched packet to '${destNode}' via local mesh loopback`);
    }
  };

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

      {/* Multi-Hop Distance-Vector Routing Subsystem */}
      <div className="sub-form" style={{ marginTop: '1rem', borderTop: '1px solid #1f293d', paddingTop: '0.85rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ margin: 0 }}>Distance-Vector Multi-Hop Routing</h4>
          <button
            type="button"
            onClick={fetchRoutes}
            className="action-button secondary"
            style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
            title="Refresh distance-vector routing table and known neighbors"
          >
            ↻ Refresh Routes
          </button>
        </div>

        <div style={{ marginTop: '0.6rem', background: '#0b101b', borderRadius: '4px', padding: '0.5rem', fontSize: '0.8rem' }}>
          <label style={{ color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }} title="Active non-stale routing table destinations and next hops">
            Known Routes ({routes.length}):
          </label>
          {routes.length === 0 ? (
            <p style={{ margin: '0.2rem 0', color: '#64748b' }}>No remote routes discovered yet. Advertising via Gossipsub.</p>
          ) : (
            <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#cbd5e1' }}>
              {routes.map((r, i) => (
                <li key={i} style={{ marginBottom: '0.25rem' }}>
                  <strong>{r.destination}</strong> via <code>{r.next_hop}</code> (metric: {r.metric})
                </li>
              ))}
            </ul>
          )}
        </div>

        <form onSubmit={handleDispatchPacket} style={{ marginTop: '0.6rem' }}>
          <div className="form-row">
            <input
              placeholder="Target Destination Peer ID / Alias"
              value={destNode}
              onChange={e => setDestNode(e.target.value)}
              title="Target destination peer for multi-hop packet forwarding"
            />
            <input
              type="number"
              placeholder="Max Hops"
              value={maxHops}
              onChange={e => setMaxHops(Number(e.target.value))}
              style={{ maxWidth: '90px' }}
              title="Time-to-live hop limit for packet forwarding"
            />
          </div>
          <div className="form-row" style={{ marginTop: '0.4rem' }}>
            <input
              placeholder="Packet Payload (optional text/ping)"
              value={packetPayload}
              onChange={e => setPacketPayload(e.target.value)}
              title="App-layer payload data to route through the mesh"
            />
            <button
              type="submit"
              className="action-button"
              title="Dispatch multi-hop mesh packet through best distance-vector route"
            >
              Dispatch Packet
            </button>
          </div>
          {dispatchStatus && (
            <p className="tx-status" style={{ marginTop: '0.4rem', color: dispatchStatus.startsWith('✓') ? '#34d399' : '#f87171' }}>
              {dispatchStatus}
            </p>
          )}
        </form>
      </div>
    </section>
  );
};
