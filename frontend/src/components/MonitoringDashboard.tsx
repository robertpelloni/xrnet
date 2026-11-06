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
  const [fleetLogs] = useState<string[]>([]);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/routes`);
        if (res.ok) {
          const data = await res.json();
          setRouteCount(Array.isArray(data) ? data.length : peers);
        }
      } catch {
        setRouteCount(peers);
      }
    };
    fetchRoutes();
  }, [peers]);

  return (
    <section className="dashboard-card" title="Cluster-wide routing topology, latency telemetry, and neutrality index">
      <h3>Fleet Telemetry & Metrics</h3>
      <div className="status-grid">
        <div className="status-item">
          <label title="Active routing paths calculated via Distance-Vector protocol">Active Routing Connections:</label>
          <span className="stat-count">{routeCount}</span>
        </div>
        <div className="status-item">
          <label title="Peer mesh clustering topology mode">Network State:</label>
          <span>{network}</span>
        </div>
      </div>
      <div className="telemetry-bar-container">
        <div className="telemetry-label-row">
          <label title="Weighted neutrality index guaranteeing censorship resistance">Global Neutrality Index:</label>
          <span>{(neutrality * 100).toFixed(1)}%</span>
        </div>
        <div className="meter-track">
          <div className="meter-fill" style={{ width: `${Math.min(100, neutrality * 100)}%` }} />
        </div>
      </div>
      <div className="fleet-grid">
        <h4>Peer Telemetry Grid</h4>
        {fleetLogs.length === 0 ? (
          <p className="empty-notice">Local node operating in standalone swarm (fleet monitor port 9001 idle).</p>
        ) : (
          fleetLogs.map((log, i) => <div key={i} className="fleet-row">{log}</div>)
        )}
      </div>
    </section>
  );
};
