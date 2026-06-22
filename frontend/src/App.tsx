import { useState, useEffect } from 'react'
import './App.css'
import { SpatialViewer } from './components/SpatialViewer'
import { MonitoringDashboard } from './components/MonitoringDashboard'
import { JobTaskBoard } from './components/JobTaskBoard'
import { StatusPanel } from './components/StatusPanel'
import { ProtocolPanel } from './components/ProtocolPanel'
import { DiscoveryPanel } from './components/DiscoveryPanel'
import { EscrowPanel } from './components/EscrowPanel'
import { SocialMatchPanel } from './components/SocialMatchPanel'

interface SystemStatus {
  peer_id: string;
  peers: number;
  network: string;
  neutrality: number;
  version: string;
}

function App() {
  const [status, setStatus] = useState('Initializing...')
  const [version, setVersion] = useState('...')
  const [peers, setPeers] = useState(0)
  const [network, setNetwork] = useState('Standalone')
  const [neutrality, setNeutrality] = useState(1.0)
  const [peerId, setPeerId] = useState('')
  const [profiles, setProfiles] = useState<Record<string, string>>({})
  const [isSyncing, setIsSyncing] = useState(false)
  const [protocolOutput, setProtocolOutput] = useState('')
  const [userFeedback, setUserFeedback] = useState('')

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/status')
        const data: SystemStatus = await response.json()
        setPeers(data.peers)
        setNetwork(data.network)
        setNeutrality(data.neutrality)
        setPeerId(data.peer_id)
        setVersion(data.version)
        setStatus('Operational')
      } catch (error) {
        console.error('Failed to fetch backend status:', error)
      }
    }

    const fetchProfiles = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/profile')
        const data = await response.json()
        setProfiles(data)
      } catch (error) {
        console.error('Failed to fetch profiles:', error)
      }
    }

    const interval = setInterval(() => {
      fetchStatus()
      fetchProfiles()
    }, 3000)

    fetchStatus()
    fetchProfiles()
    return () => clearInterval(interval)
  }, [])

  const handlePublishProfile = async () => {
    const alias = prompt("Enter your network alias:")
    if (!alias) return

    try {
      await fetch('http://localhost:8080/api/dht/put', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: `profile:${peerId}`, value: alias })
      })
      alert("Profile published to DHT.")
    } catch (error) {
      console.error('Profile publish failed:', error)
    }
  }

  const handleFeedback = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userFeedback) return
    try {
        await fetch('http://localhost:8080/api/system/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ feedback: userFeedback })
        })
        setUserFeedback('')
        alert("Thank you! Your feedback has been published to the mesh DHT for system evolution.")
    } catch (e) {
        console.error("Feedback failed", e)
    }
  }

  const handleProtocol = async () => {
    setIsSyncing(true)
    setProtocolOutput('Executing Autonomous Executive Protocol...')
    try {
      const response = await fetch('http://localhost:8080/api/system/protocol', {
        method: 'POST'
      })
      const data = await response.json()
      if (data.status === 'success') {
        setProtocolOutput(`Protocol Executed Successfully:\n${data.stdout}\n${data.stderr}`)
        alert("Executive Protocol execution complete.")
      } else {
        setProtocolOutput(`Protocol Failed: ${data.message || data.stderr}`)
      }
    } catch (error) {
      console.error('Protocol failed:', error)
      setProtocolOutput('Protocol failed. Check console for details.')
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="xrnet-dashboard">
      <header>
        <h1>xrnet</h1>
        <p className="version">v{version}</p>
      </header>

      <main>
        <div className="dashboard-grid">
          <StatusPanel
            status={status}
            peerId={peerId}
            isSyncing={isSyncing}
            protocolOutput={protocolOutput}
            handlePublishProfile={handlePublishProfile}
            handleProtocol={handleProtocol}
          />

          <ProtocolPanel peers={peers} network={network} />

          <section className="spatial-panel">
            <h2>Spatial Layer</h2>
            <SpatialViewer />
            <div className="metric">
              <label>Mapping:</label>
              <span>LIDAR Ready</span>
            </div>
            <div className="metric">
              <label>AI Recognition:</label>
              <span>Active</span>
            </div>
            <button className="action-button">Enter Learning Hub</button>
          </section>

          <DiscoveryPanel profiles={profiles} />

          <JobTaskBoard />
          <EscrowPanel />
          <SocialMatchPanel />

          <MonitoringDashboard peers={peers} neutrality={neutrality} network={network} />
        </div>
      </main>

      <footer>
        <div className="feedback-form-container">
            <form onSubmit={handleFeedback} className="feedback-form">
                <h3>System Evolution Feedback</h3>
                <textarea
                    placeholder="Contribute system improvement suggestions to the mesh DHT..."
                    value={userFeedback}
                    onChange={(e) => setUserFeedback(e.target.value)}
                />
                <button type="submit">Publish to Mesh</button>
            </form>
        </div>
        <p>Decentralized Spatial Operating System</p>
      </footer>
    </div>
  )
}

export default App
