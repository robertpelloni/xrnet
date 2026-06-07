import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [status, setStatus] = useState('Initializing...')
  const [peers, setPeers] = useState(0)
  const [network, setNetwork] = useState('Standalone')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setStatus('Operational')
      setPeers(43)
      setNetwork('Integrated')
    }, 2000)
    return () => clearTimeout(timer)
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
        <p className="version">v0.1.0</p>
      </header>

      <main>
        <section className="status-panel">
          <h2>System Status</h2>
          <div className={`status-indicator ${status.toLowerCase().replace('...', '')}`}>
            {status}
          </div>
        </section>

        <section className="protocol-panel">
          <h2>Everything Protocol</h2>
          <div className="metric">
            <label>Peers:</label>
            <span>{peers}</span>
          </div>
          <div className="metric">
            <label>P2P Node:</label>
            <span>Active (Veilid)</span>
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
