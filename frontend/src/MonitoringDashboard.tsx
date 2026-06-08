import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface TelemetryData {
  cpu_usage: number;
  memory_usage: number;
  messages_sent: number;
  messages_received: number;
  uptime_secs: number;
  peers: number;
  dht_records: number;
}

export const MonitoringDashboard = ({ apiBaseUrl }: { apiBaseUrl: string }) => {
  const [history, setHistory] = useState<any[]>([]);
  const [current, setCurrent] = useState<TelemetryData | null>(null);
  const [globalMesh, setGlobalMesh] = useState<any>(null);

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
            dht: data.dht_records || 0
          }];
          // Keep last 20 data points
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

  const totalMeshNodes = globalMesh ? Object.keys(globalMesh).length : 0;

  return (
    <div className="monitoring-dashboard">
      {totalMeshNodes > 0 && (
        <div className="global-mesh-info">
          <label>Global Mesh Intelligence</label>
          <div className="mesh-summary">
            <span>Nodes: <strong>{totalMeshNodes}</strong></span>
            <span>Network: <strong>Healthy</strong></span>
          </div>
        </div>
      )}

      <div className="telemetry-metrics">
        <div className="metric-box">
          <label>Local CPU</label>
          <div className="value">{current.cpu_usage.toFixed(1)}%</div>
        </div>
        <div className="metric-box">
          <label>Local MEM</label>
          <div className="value">{current.memory_usage.toFixed(1)}%</div>
        </div>
        <div className="metric-box">
          <label>DHT Records</label>
          <div className="value">{current.dht_records}</div>
        </div>
        <div className="metric-box">
          <label>Active Peers</label>
          <div className="value">{current.peers}</div>
        </div>
      </div>

      <div className="charts-container">
        <div className="chart-wrapper">
          <h4>System Performance</h4>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="time" hide />
              <YAxis domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#222', border: '1px solid #444' }} />
              <Area type="monotone" dataKey="cpu" stroke="#00ffcc" fill="#00ffcc44" name="CPU %" />
              <Area type="monotone" dataKey="mem" stroke="#ff00cc" fill="#ff00cc44" name="Memory %" />
              <Area type="monotone" dataKey="dht" stroke="#ffff00" fill="#ffff0022" name="DHT Records" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-wrapper">
          <h4>Mesh Traffic (S/R)</h4>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="time" hide />
              <YAxis />
              <Tooltip contentStyle={{ backgroundColor: '#222', border: '1px solid #444' }} />
              <Line type="monotone" dataKey="sent" stroke="#646cff" dot={false} name="Sent" />
              <Line type="monotone" dataKey="recv" stroke="#ff9800" dot={false} name="Received" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mesh-link-container">
        <a href="http://localhost:9001" target="_blank" rel="noopener noreferrer" className="mesh-monitor-link">
          Open Central Mesh Monitor
        </a>
      </div>
    </div>
  );
};
