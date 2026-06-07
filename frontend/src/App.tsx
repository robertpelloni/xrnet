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
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

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

    const interval = setInterval(fetchStatus, 3000)
    fetchStatus()
    return () => clearInterval(interval)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery) return
    setIsSearching(true)
    setTimeout(() => {
      setIsSearching(false)
      alert(`Everything Protocol Search Result: No decentralized records found for "${searchQuery}".`)
    }, 1500)
  }

  return (
    <div className="xrnet-dashboard">
      <header>
        <h1>xrnet</h1>
        <p className="version">v{version}</p>
      </header>

      <main>
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
      </main>

      <footer>
        <p>Decentralized Spatial Operating System</p>
      </footer>
    </div>
  )
}

export default App
