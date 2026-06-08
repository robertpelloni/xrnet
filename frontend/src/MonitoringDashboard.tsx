import { useState, useEffect } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface TelemetryData {
  cpu_usage: number;
  memory_usage: number;
  messages_sent: number;
  messages_received: number;
  uptime_secs: number;
  peers: number;
}

export const MonitoringDashboard = ({ apiBaseUrl }: { apiBaseUrl: string }) => {
  const [history, setHistory] = useState<any[]>([]);
  const [current, setCurrent] = useState<TelemetryData | null>(null);

  useEffect(() => {
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
            recv: data.messages_received
          }];
          // Keep last 20 data points
          return newHistory.slice(-20);
        });
      } catch (error) {
        console.error('Telemetry fetch failed:', error);
      }
    };

    const interval = setInterval(fetchTelemetry, 3000);
    fetchTelemetry();
    return () => clearInterval(interval);
  }, [apiBaseUrl]);

  if (!current) return <div>Loading Telemetry...</div>;

  return (
    <div className="monitoring-dashboard">
      <div className="telemetry-metrics">
        <div className="metric-box">
          <label>CPU Usage</label>
          <div className="value">{current.cpu_usage.toFixed(1)}%</div>
        </div>
        <div className="metric-box">
          <label>Memory Usage</label>
          <div className="value">{current.memory_usage.toFixed(1)}%</div>
        </div>
        <div className="metric-box">
          <label>Uptime</label>
          <div className="value">{Math.floor(current.uptime_secs / 60)}m {current.uptime_secs % 60}s</div>
        </div>
        <div className="metric-box">
          <label>Traffic (S/R)</label>
          <div className="value">{current.messages_sent} / {current.messages_received}</div>
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
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
