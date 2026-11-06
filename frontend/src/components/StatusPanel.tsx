import React, { useState } from 'react';
import { API_BASE_URL } from '../config';

interface StatusPanelProps {
  status: string;
  peerId: string;
  isSyncing: boolean;
  protocolOutput: string;
  latencyMs?: number | null;
  handlePublishProfile: () => void;
  handleProtocol: () => void;
  onRefresh?: () => void;
}

export const StatusPanel: React.FC<StatusPanelProps> = ({
  status,
  peerId,
  isSyncing,
  protocolOutput,
  latencyMs,
  handlePublishProfile,
  handleProtocol,
  onRefresh
}) => {
  const [shutdownStatus, setShutdownStatus] = useState('');

  const handleShutdown = async () => {
    if (!window.confirm("Are you sure you want to gracefully shutdown the local xrnet backend server?")) return;
    setShutdownStatus("Requesting daemon shutdown...");
    try {
      const res = await fetch(`${API_BASE_URL}/api/system/shutdown`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await res.json();
      setShutdownStatus(data.message || "Shutdown signal accepted.");
    } catch {
      setShutdownStatus("Backend daemon shutdown signal dispatched.");
    }
  };

  return (
    <section className="dashboard-card status-panel" title="Core node status, identity, and lifecycle management">
      <div className="panel-header-row">
        <h3>System Status & Engine</h3>
        {onRefresh && (
          <button className="icon-refresh-btn" onClick={onRefresh} title="Trigger immediate diagnostic status poll">
            ↻ Refresh
          </button>
        )}
      </div>
      <div className={`status-indicator ${status.toLowerCase().replace('...', '')}`} title="Current engine daemon state">
        <span className="pulse-indicator"></span>
        {status}
        {latencyMs !== undefined && latencyMs !== null && (
          <span className="latency-badge" title="Live round-trip latency to local backend API">{latencyMs}ms</span>
        )}
      </div>
      {peerId && (
        <div className="peer-id-display" title="Cryptographic Peer ID for libp2p swarm routing">
          <label>Peer ID:</label>
          <code>{peerId.length > 20 ? `${peerId.slice(0, 10)}...${peerId.slice(-4)}` : peerId}</code>
        </div>
      )}
      <div className="action-group">
        <button className="action-button" onClick={handlePublishProfile} title="Broadcast public identity alias into Kademlia DHT">
          Publish Profile
        </button>
        <button className="action-button secondary" onClick={handleProtocol} disabled={isSyncing} title="Execute git sync, roadmap analysis, and workspace integrity build">
          {isSyncing ? 'Running...' : 'Run Autonomous Protocol'}
        </button>
      </div>
      <div className="shutdown-group">
        <button className="danger-button" onClick={handleShutdown} title="Gracefully terminate Axum API server daemon and release network ports">
          Shutdown Server Daemon
        </button>
        {shutdownStatus && <p className="shutdown-status-note">{shutdownStatus}</p>}
      </div>
      {protocolOutput && (
        <div className="sync-log" title="Real-time terminal execution log of the Autonomous Executive Protocol">
          <label>Protocol Output Log:</label>
          <pre>{protocolOutput}</pre>
        </div>
      )}
    </section>
  );
};
