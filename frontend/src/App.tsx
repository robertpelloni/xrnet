import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [status, setStatus] = useState('Initializing...')
  const [peers, setPeers] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setStatus('Operational')
      setPeers(42)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

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
