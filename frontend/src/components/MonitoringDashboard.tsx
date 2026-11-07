import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

interface MonitoringDashboardProps {
  peers: number;
  neutrality: number;
  network: string;
}

export const MonitoringDashboard: React.FC<MonitoringDashboardProps> = ({
  peers,
  neutrality,
  network
}) => {
  const [routeCount, setRouteCount] = useState<number>(peers);
  const [activeRoutesCount, setActiveRoutesCount] = useState<number>(0);
  const [packetRate, setPacketRate] = useState<number>(12);
  const [totalRouted, setTotalRouted] = useState<number>(1250);
  const [jitterMs, setJitterMs] = useState<number>(0.8);
  const [packetLoss, setPacketLoss] = useState<number>(0.0);
  const [activeJobsCount, setActiveJobsCount] = useState<number>(0);
  const [activePluginsCount, setActivePluginsCount] = useState<number>(1);
  const [uptimeSeconds, setUptimeSeconds] = useState<number>(0);
  const [sparklineHistory, setSparklineHistory] = useState<number[]>([15, 22, 18, 30, 25, 34, 28, 40, 36, 42]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [pollIntervalMs, setPollIntervalMs] = useState<number>(3000);

  const [peerLatencies, setPeerLatencies] = useState<{ peer: string; rtt_ms: number; status?: string }[]>([]);

  const fetchTelemetry = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/telemetry`);
      if (res.ok) {
        const data = await res.json();
        setRouteCount(data.peers ?? peers);
        if (data.active_routes !== undefined) setActiveRoutesCount(data.active_routes);
        if (data.packet_rate) {
          setPacketRate(data.packet_rate);
          setSparklineHistory(prev => [...prev.slice(1), data.packet_rate]);
        }
        if (data.total_packets_routed) setTotalRouted(data.total_packets_routed);
        if (data.jitter_ms !== undefined) setJitterMs(data.jitter_ms);
        if (data.packet_loss_percent !== undefined) setPacketLoss(data.packet_loss_percent);
        if (data.active_jobs !== undefined) setActiveJobsCount(data.active_jobs);
        if (data.active_plugins !== undefined) setActivePluginsCount(data.active_plugins);
        if (data.uptime_seconds !== undefined) setUptimeSeconds(data.uptime_seconds);
        if (data.peer_latencies) {
          setPeerLatencies(data.peer_latencies);
        }
      }
    } catch {
      // Fallback to initial status
      setRouteCount(peers);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    if (pollIntervalMs > 0) {
      const interval = setInterval(fetchTelemetry, pollIntervalMs);
      return () => clearInterval(interval);
    }
  }, [peers, pollIntervalMs]);

  return (
    <section className="dashboard-card" title="Cluster-wide routing topology, latency telemetry, and neutrality index">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h3 style={{ margin: 0 }}>Fleet Telemetry & Observability</h3>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <select
            value={pollIntervalMs}
            onChange={(e) => setPollIntervalMs(Number(e.target.value))}
            style={{ fontSize: '0.75rem', padding: '2px 4px', background: '#1e293b', color: '#94a3b8', border: '1px solid #334155', borderRadius: '4px' }}
            title="Configure real-time telemetry polling frequency"
          >
            <option value={1000}>1s poll</option>
            <option value={3000}>3s poll</option>
            <option value={10000}>10s poll</option>
            <option value={0}>Paused</option>
          </select>
          <button
            className="button secondary"
            style={{ fontSize: '0.75rem', padding: '2px 8px' }}
            onClick={fetchTelemetry}
            disabled={isRefreshing}
            title="Query telemetry API for immediate node statistics"
          >
            {isRefreshing ? '...' : '↻ Probe'}
          </button>
        </div>
      </div>

      <div className="status-grid">
        <div className="status-item">
          <label title="Distance-Vector routes currently active in local routing table">DV Routes / Peers:</label>
          <span className="stat-count">{activeRoutesCount} / {routeCount}</span>
        </div>
        <div className="status-item">
          <label title="Peer mesh clustering topology mode">Network State:</label>
          <span className="badge-highlight">{network}</span>
        </div>
        <div className="status-item">
          <label title="Cumulative packets forwarded across the decentralized mesh overlay">Total Routed Pkts:</label>
          <span className="stat-count" style={{ fontSize: '0.95rem' }}>{totalRouted.toLocaleString()}</span>
        </div>
        <div className="status-item">
          <label title="Active sandboxed Wasm plugins loaded in node runtime">Plugins / Bounties:</label>
          <span className="badge-highlight" style={{ fontSize: '0.8rem' }}>{activePluginsCount} Wasm / {activeJobsCount} Tasks</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '6px', margin: '8px 0', fontSize: '0.8rem' }}>
        <div title="Packet transit delay jitter across current mesh paths">
          <span style={{ color: '#94a3b8' }}>Transit Jitter: </span>
          <span style={{ color: '#38bdf8', fontWeight: 600 }}>{jitterMs.toFixed(2)} ms</span>
        </div>
        <div title="Percentage of dropped or expired packets across mesh hops">
          <span style={{ color: '#94a3b8' }}>Packet Loss: </span>
          <span style={{ color: packetLoss > 0 ? '#ef4444' : '#10b981', fontWeight: 600 }}>{packetLoss.toFixed(1)}%</span>
        </div>
      </div>

      <div className="telemetry-bar-container">
        <div className="telemetry-label-row">
          <label title="Throughput in packets/sec routed through mesh overlay">Mesh Routing Rate:</label>
          <span>{packetRate} pkts/s</span>
        </div>
        <div className="sparkline-bar-chart" title="Real-time packet throughput history">
          {sparklineHistory.map((val, idx) => (
            <div
              key={idx}
              className="sparkline-bar"
              style={{ height: `${Math.min(100, (val / 50) * 100)}%` }}
              title={`Interval ${idx + 1}: ${val} pkts/s`}
            />
          ))}
        </div>
      </div>

      <div className="telemetry-bar-container">
        <div className="telemetry-label-row">
          <label title="Weighted neutrality index guaranteeing censorship resistance">Global Neutrality Index:</label>
          <span style={{ color: '#4ade80', fontWeight: 'bold' }}>{(neutrality * 100).toFixed(1)}%</span>
        </div>
        <div className="meter-track">
          <div className="meter-fill" style={{ width: `${Math.min(100, neutrality * 100)}%` }} />
        </div>
      </div>

      <div className="fleet-grid">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4>Peer Telemetry & Latency</h4>
          {uptimeSeconds > 0 && (
            <span style={{ fontSize: '0.75rem', color: '#64748b' }} title="Node uptime in current process lifecycle">
              Up: {Math.floor(uptimeSeconds / 60)}m {uptimeSeconds % 60}s
            </span>
          )}
        </div>
        {peerLatencies.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' }}>
            {peerLatencies.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', background: '#1e293b', padding: '4px 8px', borderRadius: '4px' }}>
                <span style={{ color: '#94a3b8' }}>{item.peer}</span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {item.status && (
                    <span style={{ fontSize: '0.7rem', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '1px 5px', borderRadius: '3px' }}>
                      {item.status}
                    </span>
                  )}
                  <span style={{ color: '#38bdf8', fontWeight: 600 }}>{item.rtt_ms.toFixed(1)} ms</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-notice">Local node operating in standalone swarm (fleet telemetry active on loopback).</p>
        )}
      </div>
    </section>
  );
};
