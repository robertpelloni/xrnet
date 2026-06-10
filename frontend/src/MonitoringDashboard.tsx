import { useState, useEffect } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, LineChart, Line } from 'recharts';

interface TelemetryData {
  peer_id: string;
  cpu_usage: number;
  memory_usage: number;
  messages_sent: number;
  messages_received: number;
  uptime_secs: number;
  peers: number;
  dht_records: number;
  trusted_peers?: string[];
  reputation?: number;
  bandwidth_in?: number;
  bandwidth_out?: number;
  e2e_latencies?: number[];
  messages_delivered?: number;
  fairness_score?: number;
  completion_rate?: number;
}

interface PeerReport {
  peer_id: string;
  cpu: number;
  memory: number;
  peers: number;
  bandwidth_in?: number;
  bandwidth_out?: number;
  e2e_latencies?: number[];
  messages_delivered?: number;
  fairness_score?: number;
  completion_rate?: number;
  messages_sent: number;
  messages_received: number;
  peer_latencies?: Record<string, number>;
  timestamp: number;
}

export const MonitoringDashboard = ({ apiBaseUrl }: { apiBaseUrl: string }) => {
  const [history, setHistory] = useState<any[]>([]);
  const [current, setCurrent] = useState<TelemetryData | null>(null);
  const [globalMesh, setGlobalMesh] = useState<Record<string, PeerReport[]> | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [governanceStats, setGovernanceStats] = useState<any>(null);

  const toggleTrust = async (target: string, isTrusted: boolean) => {
    try {
      await fetch(`${apiBaseUrl}/api/social/trust`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, action: isTrusted ? 'untrust' : 'trust' })
      });
      // Force refresh telemetry to update trusted list
      const response = await fetch(`${apiBaseUrl}/api/status`);
      const data = await response.json();
      setCurrent(data);
    } catch (err) {
      console.error('Failed to toggle trust:', err);
    }
  };

  useEffect(() => {
    const fetchGlobalMesh = async () => {
      try {
        // Use the same hostname as the API but port 9001 for mesh telemetry
        const monitorUrl = apiBaseUrl.includes('localhost') || apiBaseUrl.includes('127.0.0.1')
          ? 'http://localhost:9001'
          : `http://${window.location.hostname}:9001`;

        const response = await fetch(`${monitorUrl}/api/mesh/status`);
        if (response.ok) {
          const data = await response.json();
          setGlobalMesh(data.peers);
          setAlerts(data.alerts || []);
        } else {
          setGlobalMesh(null);
          setAlerts([]);
        }
      } catch (err) {
        setGlobalMesh(null);
        setAlerts([]);
      }
    };

    const fetchTelemetry = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/status`);
        const data = await response.json();
        setCurrent(data);

        const govResp = await fetch(`${apiBaseUrl}/api/governance/list`);
        const govData = await govResp.json();
        setGovernanceStats({
          active_proposals: govData.length,
          total_votes: govData.reduce((acc: number, p: any) => acc + p.votes_for.length + p.votes_against.length, 0),
          total_weight: govData.reduce((acc: number, p: any) => acc + p.weight_for + p.weight_against, 0),
        });

        setHistory(prev => {
          const newHistory = [...prev, {
            time: new Date().toLocaleTimeString(),
            cpu: data.cpu_usage,
            mem: data.memory_usage,
            sent: data.messages_sent,
            recv: data.messages_received,
            dht: data.dht_records || 0,
            peers: data.peers,
            bw_in: (data.bandwidth_in || 0) / 1024, // KB
            bw_out: (data.bandwidth_out || 0) / 1024, // KB
            e2e: data.e2e_latencies && data.e2e_latencies.length > 0
              ? data.e2e_latencies.reduce((a: number, b: number) => a + b, 0) / data.e2e_latencies.length
              : 0
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
      {alerts.length > 0 && (
        <div className="mesh-alerts-container">
          {alerts.map((alert, idx) => (
            <div key={idx} className={`mesh-alert alert-${alert.type.toLowerCase()}`}>
              <span className="alert-badge">{alert.type}</span>
              <span className="alert-msg"><strong>{alert.peer_id.slice(0, 8)}</strong>: {alert.message}</span>
            </div>
          ))}
        </div>
      )}

      <div className="telemetry-section local-stats">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Local Node Performance</h3>
          <div className="reputation-badge">Reputation: {current.reputation || 1}</div>
        </div>
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
            <label>Traffic (S/R)</label>
            <div className="value">{current.messages_sent} / {current.messages_received}</div>
          </div>
          <div className="metric-box">
            <label>Connections</label>
            <div className="value">{current.peers}</div>
          </div>
          <div className="metric-box">
            <label>Fairness</label>
            <div className="value">{((current.fairness_score || 1.0) * 100).toFixed(0)}%</div>
          </div>
          <div className="metric-box">
            <label>Completion</label>
            <div className="value">{((current.completion_rate || 1.0) * 100).toFixed(0)}%</div>
          </div>
        </div>

        <div className="charts-container">
          <div className="chart-wrapper">
            <h4>System Resources</h4>
            <ResponsiveContainer width="100%" height={120}>
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

          <div className="chart-wrapper">
            <h4>Mesh Traffic</h4>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="time" hide />
                <YAxis />
                <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #444' }} />
                <Line type="monotone" dataKey="sent" stroke="#646cff" dot={false} name="Sent" />
                <Line type="monotone" dataKey="recv" stroke="#ff9800" dot={false} name="Received" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-wrapper">
            <h4>Bandwidth (KB)</h4>
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="time" hide />
                <YAxis />
                <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #444' }} />
                <Area type="monotone" dataKey="bw_in" stroke="#00bcd4" fill="#00bcd422" name="In" />
                <Area type="monotone" dataKey="bw_out" stroke="#f44336" fill="#f4433622" name="Out" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-wrapper">
            <h4>E2E Latency (ms)</h4>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="time" hide />
                <YAxis />
                <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #444' }} />
                <Line type="monotone" dataKey="e2e" stroke="#ffeb3b" dot={false} name="Latency" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {governanceStats && (
        <div className="telemetry-section mesh-governance">
          <h3>Mesh Governance Health</h3>
          <div className="telemetry-metrics">
            <div className="metric-box">
              <label>Active Proposals</label>
              <div className="value">{governanceStats.active_proposals}</div>
            </div>
            <div className="metric-box">
              <label>Total Votes</label>
              <div className="value">{governanceStats.total_votes}</div>
            </div>
            <div className="metric-box">
              <label>Governance Weight</label>
              <div className="value">{governanceStats.total_weight}</div>
            </div>
          </div>
        </div>
      )}

      <div className="telemetry-section network-topology">
        <h3>Network Topology</h3>
        <div className="topology-map" style={{ height: '200px', background: '#111', borderRadius: '8px', position: 'relative', overflow: 'hidden', border: '1px solid #333' }}>
          <div className="center-node" style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: '20px', height: '20px', background: '#646cff', borderRadius: '50%', boxShadow: '0 0 15px #646cff' }}>
            <span style={{ position: 'absolute', top: '25px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.6rem', whiteSpace: 'nowrap' }}>YOU</span>
          </div>
          {meshPeers.filter(([pid]) => pid !== current.peer_id).map(([peerId], idx) => {
            const angle = (idx / (meshPeers.length - 1)) * 2 * Math.PI;
            const x = 50 + 35 * Math.cos(angle);
            const y = 50 + 35 * Math.sin(angle);
            return (
              <div key={peerId} className="topology-node" style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)', width: '12px', height: '12px', background: '#00ffcc', borderRadius: '50%' }}>
                <div style={{ position: 'absolute', width: '2px', height: '70px', background: 'linear-gradient(to top, #00ffcc44, transparent)', left: '5px', top: '6px', transformOrigin: 'top center', transform: `rotate(${angle + Math.PI/2}rad)`, opacity: 0.3 }}></div>
                <span style={{ position: 'absolute', top: '15px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.5rem', opacity: 0.7 }}>{peerId.slice(0, 4)}</span>
              </div>
            );
          })}
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
              const isTrusted = current.trusted_peers?.includes(peerId);

              return (
                <div key={peerId} className={`peer-card ${isLocal ? 'local-peer' : ''} ${isTrusted ? 'trusted-peer' : ''}`}>
                  <div className="peer-card-header">
                    <span className="peer-card-id">{peerId.slice(0, 8)}...{peerId.slice(-4)}</span>
                    {isLocal && <span className="local-tag">YOU</span>}
                    <span className="status-dot online"></span>
                  </div>
                  <div className="peer-card-body">
                    <div className="mini-metric">
                      <label>CPU/MEM</label>
                      <span>{latest.cpu.toFixed(0)}% / {latest.memory.toFixed(0)}%</span>
                    </div>
                    <div className="mini-metric">
                      <label>TRAFFIC</label>
                      <span>{latest.messages_sent || 0}S / {latest.messages_received || 0}R</span>
                    </div>
                    <div className="mini-metric">
                      <label>PEERS</label>
                      <span>{latest.peers}</span>
                    </div>
                    <div className="mini-metric">
                      <label>FAIRNESS</label>
                      <span>{((latest.fairness_score || 1.0) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="mini-metric">
                      <label>LATENCY</label>
                      <span>{latest.e2e_latencies && latest.e2e_latencies.length > 0
                        ? (latest.e2e_latencies.reduce((a, b) => a + b, 0) / latest.e2e_latencies.length).toFixed(0)
                        : '0'}ms</span>
                    </div>
                    {!isLocal && (
                      <button
                        className={`trust-btn ${isTrusted ? 'untrust' : 'trust'}`}
                        onClick={() => toggleTrust(peerId, !!isTrusted)}
                      >
                        {isTrusted ? 'Untrust' : 'Trust Peer'}
                      </button>
                    )}
                    {latest.peer_latencies && Object.keys(latest.peer_latencies).length > 0 && (
                      <div className="mini-metric">
                        <label>AVG LATENCY</label>
                        <span>
                          {(Object.values(latest.peer_latencies).reduce((a, b) => a + b, 0) / Object.values(latest.peer_latencies).length).toFixed(0)}ms
                        </span>
                      </div>
                    )}
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
