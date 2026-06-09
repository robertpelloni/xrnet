import { useState, useEffect } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface TelemetryData {
  peer_id: string;
  cpu_usage: number;
  memory_usage: number;
  messages_sent: number;
  messages_received: number;
  uptime_secs: number;
  peers: number;
  dht_records: number;
}

interface PeerReport {
  peer_id: string;
  cpu: number;
  memory: number;
  peers: number;
  timestamp: number;
}

export const MonitoringDashboard = ({ apiBaseUrl }: { apiBaseUrl: string }) => {
  const [history, setHistory] = useState<any[]>([]);
  const [current, setCurrent] = useState<TelemetryData | null>(null);
  const [globalMesh, setGlobalMesh] = useState<Record<string, PeerReport[]> | null>(null);

  useEffect(() => {
    const fetchGlobalMesh = async () => {
      try {
        const response = await fetch(`http://localhost:9001/api/mesh/status`);
        if (response.ok) {
          const data = await response.json();
          setGlobalMesh(data);
        } else {
          setGlobalMesh(null);
        }
      } catch (err) {
        setGlobalMesh(null);
      }
    };

    const fetchTelemetry = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/status`);
        const data = await response.json();
        setCurrent(data);

        setHistory(prev => {
          const newHistory = [...prev, {
            time: new Date().toLocaleTimeString(),
            cpu: data.cpu_usage,
            mem: data.memory_usage,
            sent: data.messages_sent,
            recv: data.messages_received,
            dht: data.dht_records || 0,
            peers: data.peers
          }];
          return newHistory.slice(-20);
        });
        fetchGlobalMesh();
      } catch (error) {
        console.error('Telemetry fetch failed:', error);
      }
    };

    const interval = setInterval(fetchTelemetry, 3000);
    fetchTelemetry();
    return () => clearInterval(interval);
  }, [apiBaseUrl]);

  if (!current) return <div>Loading Telemetry...</div>;

  const meshPeers = globalMesh ? Object.entries(globalMesh) : [];

  return (
    <div className="monitoring-dashboard">
      <div className="telemetry-section local-stats">
        <h3>Local Node Performance</h3>
        <div className="telemetry-metrics">
          <div className="metric-box">
            <label>CPU</label>
            <div className="value">{current.cpu_usage.toFixed(1)}%</div>
          </div>
          <div className="metric-box">
            <label>Memory</label>
            <div className="value">{current.memory_usage.toFixed(1)}%</div>
          </div>
          <div className="metric-box">
            <label>DHT Records</label>
            <div className="value">{current.dht_records}</div>
          </div>
          <div className="metric-box">
            <label>Connections</label>
            <div className="value">{current.peers}</div>
          </div>
        </div>

        <div className="charts-container">
          <div className="chart-wrapper">
            <h4>System Resources</h4>
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="time" hide />
                <YAxis domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #444' }} />
                <Area type="monotone" dataKey="cpu" stroke="#00ffcc" fill="#00ffcc22" name="CPU" />
                <Area type="monotone" dataKey="mem" stroke="#ff00cc" fill="#ff00cc22" name="Mem" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="telemetry-section mesh-fleet">
        <h3>Mesh Fleet Monitor</h3>
        {meshPeers.length === 0 ? (
          <p className="empty-msg">No remote peers reporting telemetry.</p>
        ) : (
          <div className="peer-grid">
            {meshPeers.map(([peerId, history]) => {
              const latest = history[history.length - 1];
              const isLocal = peerId === current.peer_id;
              return (
                <div key={peerId} className={`peer-card ${isLocal ? 'local-peer' : ''}`}>
                  <div className="peer-card-header">
                    <span className="peer-card-id">{peerId.slice(0, 8)}...{peerId.slice(-4)}</span>
                    {isLocal && <span className="local-tag">YOU</span>}
                    <span className="status-dot online"></span>
                  </div>
                  <div className="peer-card-body">
                    <div className="mini-metric">
                      <label>CPU</label>
                      <span>{latest.cpu.toFixed(1)}%</span>
                    </div>
                    <div className="mini-metric">
                      <label>MEM</label>
                      <span>{latest.memory.toFixed(1)}%</span>
                    </div>
                    <div className="mini-metric">
                      <label>Peers</label>
                      <span>{latest.peers}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mesh-link-container">
        <a href="http://localhost:9001" target="_blank" rel="noopener noreferrer" className="mesh-monitor-link">
          Launch Mesh Fleet Dashboard (Full View)
        </a>
      </div>
    </div>
  );
};
