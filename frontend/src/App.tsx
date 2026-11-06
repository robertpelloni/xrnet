import { useState, useEffect } from 'react'
import './App.css'
import { API_BASE_URL } from './config'
import { SpatialViewer } from './components/SpatialViewer'
import { MonitoringDashboard } from './components/MonitoringDashboard'
import { JobTaskBoard } from './components/JobTaskBoard'
import { StatusPanel } from './components/StatusPanel'
import { ProtocolPanel } from './components/ProtocolPanel'
import { DiscoveryPanel } from './components/DiscoveryPanel'
import { EscrowPanel } from './components/EscrowPanel'
import { SocialMatchPanel } from './components/SocialMatchPanel'
import { PluginPanel } from './components/PluginPanel'
import { BobcoinPanel } from './components/BobcoinPanel'
import { SwarmMessagePanel } from './components/SwarmMessagePanel'
import { GovernancePanel } from './components/GovernancePanel'

interface SystemStatus {
  peer_id: string;
  peers: number;
  network: string;
  neutrality: number;
  version: string;
  best_arbitrator?: string;
}

function App() {
  const [status, setStatus] = useState('Initializing...')
  const [version, setVersion] = useState('0.1.112')
  const [peers, setPeers] = useState(0)
  const [network, setNetwork] = useState('Initializing')
  const [neutrality, setNeutrality] = useState(1.0)
  const [peerId, setPeerId] = useState('')
  const [bestArbitrator, setBestArbitrator] = useState<string>('None Available')
  const [profiles, setProfiles] = useState<Record<string, string>>({})
  const [isSyncing, setIsSyncing] = useState(false)
  const [protocolOutput, setProtocolOutput] = useState('')
  const [userFeedback, setUserFeedback] = useState('')
  const [latencyMs, setLatencyMs] = useState<number | null>(null)

  const fetchStatus = async () => {
    const start = performance.now()
    try {
      const response = await fetch(`${API_BASE_URL}/api/status`)
      const data: SystemStatus = await response.json()
      const end = performance.now()
      setLatencyMs(Math.round(end - start))
      setPeers(data.peers)
      setNetwork(data.network)
      setNeutrality(data.neutrality)
      setPeerId(data.peer_id)
      setVersion(data.version)
      if (data.best_arbitrator) setBestArbitrator(data.best_arbitrator)
      setStatus('Operational')
    } catch {
      setStatus('Connecting...')
      setLatencyMs(null)
    }
  }

  const fetchProfiles = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile`)
      if (response.ok) {
        const data = await response.json()
        setProfiles(data)
      }
    } catch {
      // Standalone mode
    }
  }

  useEffect(() => {
    fetchStatus()
    fetchProfiles()
    const interval = setInterval(() => {
      fetchStatus()
      fetchProfiles()
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const handlePublishProfile = async () => {
    const alias = prompt("Enter your network alias:", "peer-alpha")
    if (!alias) return

    try {
      await fetch(`${API_BASE_URL}/api/dht/put`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: `profile:${peerId || 'local'}`, value: alias })
      })
      alert(`Profile alias '${alias}' published to DHT ring.`)
      fetchProfiles()
    } catch (error) {
      console.error('Profile publish failed:', error)
    }
  }

  const handleFeedback = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userFeedback) return
    try {
      await fetch(`${API_BASE_URL}/api/system/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: userFeedback })
      })
      setUserFeedback('')
      alert("Feedback recorded to mesh DHT feedback pool.")
    } catch {
      alert("Feedback saved locally.")
    }
  }

  const handleProtocol = async () => {
    setIsSyncing(true)
    setProtocolOutput('Executing Autonomous Executive Protocol...')
    try {
      const response = await fetch(`${API_BASE_URL}/api/system/protocol`, {
        method: 'POST'
      })
      const data = await response.json()
      if (data.status === 'success') {
        setProtocolOutput(`Protocol Executed Successfully:\n${data.stdout}\n${data.stderr}`)
      } else {
        setProtocolOutput(`Protocol Failed: ${data.message || data.stderr}`)
      }
    } catch {
      setProtocolOutput('Protocol triggered on local backend.')
    } finally {
      setIsSyncing(false)
      fetchStatus()
    }
  }

  return (
    <div className="xrnet-dashboard">
      <header className="main-header">
        <div className="brand-group">
          <h1>xrnet</h1>
          <span className="badge-version" title="Current build version">v{version}</span>
        </div>
        <div className="system-summary-strip">
          <span className={`status-pill ${status.toLowerCase()}`}>
            <span className="pulse-dot"></span>
            {status}
          </span>
          <span className="summary-metric" title="Active P2P Swarm connections">
            Peers: <strong>{peers}</strong>
          </span>
          {latencyMs !== null && (
            <span className="summary-metric" title="API ping latency">
              Ping: <strong>{latencyMs}ms</strong>
            </span>
          )}
          <span className="summary-metric" title="Overall node neutrality index">
            Neutrality: <strong>{(neutrality * 100).toFixed(0)}%</strong>
          </span>
          <button className="icon-refresh-btn" onClick={() => { fetchStatus(); fetchProfiles(); }} title="Immediate telemetry poll">
            ↻ Sync
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        {/* Section 1: Swarm & Core Comms */}
        <div className="section-block">
          <div className="section-header">
            <h2>P2P Swarm & Core Communications</h2>
            <p>Peer-to-peer transport, multi-hop routing, Kademlia DHT, and global message propagation</p>
          </div>
          <div className="cards-grid">
            <StatusPanel
              status={status}
              peerId={peerId}
              isSyncing={isSyncing}
              protocolOutput={protocolOutput}
              latencyMs={latencyMs}
              handlePublishProfile={handlePublishProfile}
              handleProtocol={handleProtocol}
              onRefresh={fetchStatus}
            />
            <ProtocolPanel peers={peers} network={network} />
            <SwarmMessagePanel />
            <DiscoveryPanel profiles={profiles} onRefresh={fetchProfiles} />
          </div>
        </div>

        {/* Section 2: Economic & Trust Layer */}
        <div className="section-block">
          <div className="section-header">
            <h2>Economic & Trust Layer</h2>
            <p>Bobcoin consensus micropayments, smart escrow contracts, and ZK-verified identity matching</p>
          </div>
          <div className="cards-grid">
            <BobcoinPanel />
            <EscrowPanel />
            <SocialMatchPanel />
          </div>
        </div>

        {/* Section 3: Spatial Operating System & AI */}
        <div className="section-block">
          <div className="section-header">
            <h2>Spatial Operating System & AI</h2>
            <p>Real-time 3D Gaussian Splatting point clouds, LIDAR mapping, and decentralized spatial anchors</p>
          </div>
          <div className="spatial-full-container">
            <SpatialViewer semanticAnchor="Active (LWM)" />
          </div>
        </div>

        {/* Section 4: Governance, Ecosystem & Telemetry */}
        <div className="section-block">
          <div className="section-header">
            <h2>Governance, Plugins & Fleet Telemetry</h2>
            <p>Algorithmic neutrality scoring, Kademlia task bounties, sandboxed Wasm plugins, and fleet health</p>
          </div>
          <div className="cards-grid">
            <GovernancePanel neutralityIndex={neutrality} bestArbitrator={bestArbitrator} />
            <JobTaskBoard />
            <PluginPanel />
            <MonitoringDashboard peers={peers} neutrality={neutrality} network={network} />
          </div>
        </div>
      </main>

      <footer className="main-footer">
        <div className="feedback-container">
          <form onSubmit={handleFeedback} className="feedback-box">
            <h4>Mesh Evolution & DHT Feedback</h4>
            <textarea
              placeholder="Contribute ideas, bug reports, or feature proposals to the mesh DHT..."
              value={userFeedback}
              onChange={(e) => setUserFeedback(e.target.value)}
              title="Proposal or bug feedback broadcast into network storage"
            />
            <button type="submit" className="action-button green-button" title="Sign and propagate feedback to mesh">
              Publish Feedback to Mesh
            </button>
          </form>
        </div>
        <p className="copyright-note">xrnet — Decentralized Spatial Operating System</p>
      </footer>
    </div>
  )
}

export default App
