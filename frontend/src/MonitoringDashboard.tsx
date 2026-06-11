import { useState, useEffect } from 'react'

interface PeerStats {
  cpu: number;
  memory: number;
  messages_sent: number;
  messages_received: number;
  api_port: number;
  timestamp: number;
}

export function MonitoringDashboard({ apiBaseUrl }: { apiBaseUrl: string }) {
  const [peers, setPeers] = useState<Record<string, PeerStats[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMeshStatus = async () => {
      try {
        // We poll the central control server (mock_peer.py) which aggregates telemetry
        // The mock peer usually runs on port 9001
        const response = await fetch(`http://${window.location.hostname}:9001/api/mesh/status`)
        const data = await response.json()
        setPeers(data.peers || {})
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch mesh monitoring data:', error)
      }
    }

    const interval = setInterval(fetchMeshStatus, 5000)
    fetchMeshStatus()
    return () => clearInterval(interval)
  }, [apiBaseUrl])

  if (loading) return <div className="loading">Loading Mesh Telemetry...</div>

  return (
    <div className="monitoring-dashboard">
      <div className="peer-grid">
        {Object.entries(peers).map(([peerId, history]) => {
          const latest = history[history.length - 1]
          return (
            <div key={peerId} className="peer-card">
              <div className="peer-card-header">
                <span className="peer-card-id">{peerId.slice(0, 12)}...</span>
                <div className="status-dot online"></div>
              </div>
              <div className="peer-card-body">
                <div className="mini-metric">
                  <label>CPU:</label>
                  <span>{latest.cpu.toFixed(1)}%</span>
                </div>
                <div className="mini-metric">
                  <label>MEM:</label>
                  <span>{latest.memory.toFixed(1)}%</span>
                </div>
                <div className="mini-metric">
                  <label>TRAFFIC:</label>
                  <span>{latest.messages_sent}S / {latest.messages_received}R</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
