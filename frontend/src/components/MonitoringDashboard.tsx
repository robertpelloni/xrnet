import React, { useState, useEffect } from 'react';

interface PeerStats {
  cpu: number;
  memory: number;
  messages_sent: number;
  messages_received: number;
  api_port: number;
  timestamp: number;
}

interface MonitoringProps {
  peers: number;
  neutrality: number;
  network: string;
  apiBaseUrl?: string;
}

export const MonitoringDashboard: React.FC<MonitoringProps> = ({ peers, neutrality, network, apiBaseUrl = 'http://localhost:8080' }) => {
  const [meshPeers, setMeshPeers] = useState<Record<string, PeerStats[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeshStatus = async () => {
      try {
        const url = new URL(apiBaseUrl);
        const monitorUrl = `http://${url.hostname}:9001/api/mesh/status`;

        const response = await fetch(monitorUrl);
        const data = await response.json();
        setMeshPeers(data.peers || {});
        setLoading(false);
      } catch (error) {
        // Silently fail if monitor is not running
        setLoading(false);
      }
    };

    fetchMeshStatus();
    const interval = setInterval(fetchMeshStatus, 5000);
    return () => clearInterval(interval);
  }, [apiBaseUrl]);

  return (
    <section className="monitoring-dashboard-container">
      <div className="metric">
        <label>Active Connections:</label>
        <span>{peers}</span>
      </div>
      <div className="metric">
        <label>Network State:</label>
        <span className={network.toLowerCase()}>{network}</span>
      </div>

      <div className="neutrality-index" style={{ margin: '1rem 0' }}>
        <label>Neutrality Index:</label>
        <div className="progress-bar-bg" style={{ background: '#333', height: '10px', borderRadius: '5px', margin: '5px 0' }}>
          <div
            className="progress-bar-fill"
            style={{
              width: `${neutrality * 100}%`,
              height: '100%',
              borderRadius: '5px',
              transition: 'width 0.5s ease',
              backgroundColor: neutrality > 0.8 ? '#4caf50' : '#ff9800'
            }}
          ></div>
        </div>
        <span className="neutrality-value">{(neutrality * 100).toFixed(1)}%</span>
      </div>

      <h3>Live Peer Mesh</h3>
      {loading ? (
        <p>Polling telemetry...</p>
      ) : Object.keys(meshPeers).length === 0 ? (
        <p className="empty-msg">No active telemetry from peers.</p>
      ) : (
        <div className="peer-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px' }}>
          {Object.entries(meshPeers).map(([peerId, history]) => {
            const latest = history[history.length - 1];
            return (
              <div key={peerId} className="peer-card" style={{ background: '#1a1a1a', padding: '8px', borderRadius: '4px', border: '1px solid #333' }}>
                <div className="peer-card-id" style={{ fontSize: '0.6rem', opacity: 0.5 }}>{peerId.slice(0, 8)}...</div>
                <div className="mini-metric" style={{ fontSize: '0.7rem', display: 'flex', justifyContent: 'space-between' }}>
                  <label>CPU</label>
                  <span>{latest.cpu.toFixed(0)}%</span>
                </div>
                <div className="mini-metric" style={{ fontSize: '0.7rem', display: 'flex', justifyContent: 'space-between' }}>
                  <label>MSG</label>
                  <span>{latest.messages_sent}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
