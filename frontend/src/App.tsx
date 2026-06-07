import { useState, useEffect } from 'react'
import './App.css'
import { SpatialViewer } from './SpatialViewer'

interface SystemStatus {
  peer_id: string;
  peers: number;
  network: string;
  version: string;
}

function App() {
  const [status, setStatus] = useState('Initializing...')
  const [version, setVersion] = useState('...')
  const [peers, setPeers] = useState(0)
  const [network, setNetwork] = useState('Standalone')
  const [peerId, setPeerId] = useState('')
  const [profiles, setProfiles] = useState<Record<string, string>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncOutput, setSyncOutput] = useState('')

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/status')
        const data: SystemStatus = await response.json()
        setPeers(data.peers)
        setNetwork(data.network)
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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery) return
    setIsSearching(true)

    try {
      // Simulate DHT search by putting a record
      await fetch('http://localhost:8080/api/dht/put', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: `search:${Date.now()}`, value: searchQuery })
      })

      setTimeout(() => {
        setIsSearching(false)
        alert(`Everything Protocol Search Result: No decentralized records found for "${searchQuery}". Query propagated to DHT.`)
      }, 1500)
    } catch (error) {
      console.error('Search failed:', error)
      setIsSearching(false)
    }
  }

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

  const handleSync = async () => {
    setIsSyncing(true)
    setSyncOutput('Syncing repository...')
    try {
      const response = await fetch('http://localhost:8080/api/system/sync', {
        method: 'POST'
      })
      const data = await response.json()
      if (data.status === 'success') {
        setSyncOutput(`Sync Successful:\n${data.stdout}\n${data.stderr}`)
        alert("Repository synchronization complete.")
      } else {
        setSyncOutput(`Sync Failed: ${data.message}`)
      }
    } catch (error) {
      console.error('Sync failed:', error)
      setSyncOutput('Sync failed. Check console for details.')
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
          <section className="status-panel">
            <h2>System Status</h2>
            <div className={`status-indicator ${status.toLowerCase().replace('...', '')}`}>
              {status}
            </div>
            {peerId && (
              <div className="peer-id-display">
                <label>Peer ID:</label>
                <code>{peerId.slice(0, 12)}...{peerId.slice(-4)}</code>
              </div>
            )}
            <div className="action-group">
              <button className="action-button" onClick={handlePublishProfile}>Publish My Profile</button>
              <button className="action-button secondary" onClick={handleSync} disabled={isSyncing}>
                {isSyncing ? 'Syncing...' : 'Sync Repository'}
              </button>
            </div>
            {syncOutput && (
              <div className="sync-log">
                <label>Sync Log:</label>
                <pre>{syncOutput}</pre>
              </div>
            )}
          </section>

          <section className="protocol-panel">
            <h2>Everything Protocol</h2>
            <div className="metric">
              <label>Peers:</label>
              <span>{peers}</span>
            </div>
            <div className="metric">
              <label>P2P Node:</label>
              <span>Active (libp2p)</span>
            </div>
            <div className="metric">
              <label>Network:</label>
              <span className={network.toLowerCase()}>{network}</span>
            </div>

            <form className="search-form" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search the DHT..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" disabled={isSearching}>
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </form>
          </section>

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
          </section>

          <section className="discovery-panel">
            <h2>Network Discovery</h2>
            <div className="profile-list">
              {Object.keys(profiles).length === 0 ? (
                <p className="empty-msg">No profiles discovered yet.</p>
              ) : (
                <ul>
                  {Object.entries(profiles).map(([key, alias]) => (
                    <li key={key}>
                      <span className="alias">{alias}</span>
                      <span className="peer-ref">{key.replace('profile:', '').slice(0, 8)}...</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      </main>

      <footer>
        <p>Decentralized Spatial Operating System</p>
      </footer>
    </div>
  )
}

export default App
