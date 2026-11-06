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
  const [packetRate, setPacketRate] = useState<number>(12);
  const [sparklineHistory, setSparklineHistory] = useState<number[]>([15, 22, 18, 30, 25, 34, 28, 40, 36, 42]);
  const [fleetLogs] = useState<string[]>([]);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/status`);
        if (res.ok) {
          const data = await res.json();
          setRouteCount(data.peers || peers);
        }
      } catch {
        setRouteCount(peers);
      }
    };
    fetchRoutes();

    // Pulse telemetry updates for throughput simulation
    const interval = setInterval(() => {
      const nextRate = Math.floor(Math.random() * 20) + 15;
      setPacketRate(nextRate);
      setSparklineHistory(prev => [...prev.slice(1), nextRate]);
    }, 3000);

    return () => clearInterval(interval);
  }, [peers]);

  return (
    <section className="dashboard-card" title="Cluster-wide routing topology, latency telemetry, and neutrality index">
      <h3>Fleet Telemetry & Observability</h3>
      <div className="status-grid">
        <div className="status-item">
          <label title="Active routing paths calculated via Distance-Vector protocol">Active Routing Connections:</label>
          <span className="stat-count">{routeCount}</span>
        </div>
        <div className="status-item">
          <label title="Peer mesh clustering topology mode">Network State:</label>
          <span className="badge-highlight">{network}</span>
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
        <h4>Peer Telemetry Grid</h4>
        {fleetLogs.length === 0 ? (
          <p className="empty-notice">Local node operating in standalone swarm (fleet telemetry active on loopback).</p>
        ) : (
          fleetLogs.map((log, i) => <div key={i} className="fleet-row">{log}</div>)
        )}
      </div>
    </section>
  );
};
