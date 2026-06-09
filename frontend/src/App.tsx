import { useState, useEffect } from 'react'
import './App.css'
import { SpatialViewer } from './SpatialViewer'
import { MonitoringDashboard } from './MonitoringDashboard'
import { LearningHub } from './components/LearningHub'

interface SystemStatus {
  peer_id: string;
  peers: number;
  network: string;
  version: string;
}

function App() {
  const [apiBaseUrl] = useState(() => {
    // In a production environment, this would be configured via env or window location
    // For local mesh simulation, we check if a port is specified in the URL or default to 8080
    const urlParams = new URLSearchParams(window.location.search);
    const port = urlParams.get('api_port') || '8080';
    return `http://localhost:${port}`;
  });
  const [status, setStatus] = useState('Initializing...')
  const [version, setVersion] = useState('...')
  const [peers, setPeers] = useState(0)
  const [network, setNetwork] = useState('Standalone')
  const [peerId, setPeerId] = useState('')
  const [profiles, setProfiles] = useState<Record<string, string>>({})
  const [marketItems, setMarketItems] = useState<Record<string, string>>({})
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [protocolOutput, setProtocolOutput] = useState('')
  const [proposals, setProposals] = useState<any[]>([])
  const [newPropTitle, setNewPropTitle] = useState('')
  const [newPropDesc, setNewPropDesc] = useState('')

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/status`)
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
        const response = await fetch(`${apiBaseUrl}/api/profile`)
        const data = await response.json()
        setProfiles(data)
      } catch (error) {
        console.error('Failed to fetch profiles:', error)
      }
    }

    const fetchMarketItems = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/market/list`)
        const data = await response.json()
        setMarketItems(data)
      } catch (error) {
        console.error('Failed to fetch market items:', error)
      }
    }

    const fetchMessages = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/messages/list`)
        const data = await response.json()
        setMessages(data)
      } catch (error) {
        console.error('Failed to fetch messages:', error)
      }
    }

    const fetchProposals = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/governance/list`)
        const data = await response.json()
        setProposals(data)
      } catch (error) {
        console.error('Failed to fetch proposals:', error)
      }
    }

    const interval = setInterval(() => {
      fetchStatus()
      fetchProfiles()
      fetchMarketItems()
      fetchMessages()
      fetchProposals()
    }, 3000)

    fetchStatus()
    fetchProfiles()
    fetchMarketItems()
    fetchMessages()
    fetchProposals()
    return () => clearInterval(interval)
  }, [])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery) return
    setIsSearching(true)

    try {
      // Simulate DHT search by putting a record
      await fetch(`${apiBaseUrl}/api/dht/put`, {
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
      await fetch(`${apiBaseUrl}/api/dht/put`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: `profile:${peerId}`, value: alias })
      })
      alert("Profile published to DHT.")
    } catch (error) {
      console.error('Profile publish failed:', error)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage) return

    try {
      await fetch(`${apiBaseUrl}/api/messages/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage })
      })
      setNewMessage('')
    } catch (error) {
      console.error('Message send failed:', error)
    }
  }

  const handleListMarketItem = async () => {
    const item = prompt("What are you selling/offering?")
    if (!item) return
    const price = prompt("Enter price in Bobcoin:")
    if (!price) return

    try {
      await fetch(`${apiBaseUrl}/api/dht/put`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: `market:${peerId}:${Date.now()}`, value: `${item}|${price}` })
      })
      alert("Item listed in marketplace DHT.")
    } catch (error) {
      console.error('Marketplace list failed:', error)
    }
  }

  const handleBuyItem = async (itemKey: string, itemName: string, price: string) => {
    const sellerPeerId = itemKey.split(':')[1];
    if (sellerPeerId === peerId) {
      alert("You cannot buy your own item.");
      return;
    }

    const confirmBuy = window.confirm(`Buy "${itemName}" for ${price} Bobcoin?`);
    if (!confirmBuy) return;

    try {
      const response = await fetch(`${apiBaseUrl}/api/bobcoin/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: peerId,
          destination: sellerPeerId,
          amount: parseFloat(price)
        })
      });
      const data = await response.json();
      if (data.error) {
        alert(`Transaction failed: ${data.error}`);
      } else {
        alert(`Transaction successful! ${price} Bobcoin sent to ${sellerPeerId.slice(0, 8)}...`);
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      alert("Purchase failed. Check network connection.");
    }
  }

  const handlePropose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPropTitle) return;
    try {
      await fetch(`${apiBaseUrl}/api/governance/propose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newPropTitle, description: newPropDesc })
      });
      setNewPropTitle('');
      setNewPropDesc('');
      alert("Proposal submitted to mesh governance.");
    } catch (err) {
      console.error('Proposal failed:', err);
    }
  }

  const handleVote = async (id: string, approve: boolean) => {
    try {
      await fetch(`${apiBaseUrl}/api/governance/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, approve })
      });
    } catch (err) {
      console.error('Vote failed:', err);
    }
  }

  const handleProtocol = async () => {
    setIsSyncing(true)
    setProtocolOutput('Executing Autonomous Executive Protocol...')
    try {
      const response = await fetch(`${apiBaseUrl}/api/system/protocol`, {
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
              <button className="action-button secondary" onClick={handleProtocol} disabled={isSyncing}>
                {isSyncing ? 'Executing...' : 'Run Autonomous Protocol'}
              </button>
            </div>
            {protocolOutput && (
              <div className="sync-log">
                <label>Protocol Log:</label>
                <pre>{protocolOutput}</pre>
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

          <section className="communications-panel">
            <h2>Communicate</h2>
            <div className="chat-window">
              {messages.length === 0 ? (
                <p className="empty-msg">No messages yet.</p>
              ) : (
                <div className="message-list">
                  {messages.map((msg, idx) => (
                    <div key={idx} className="message-item">
                      <span className="sender">{msg.sender.slice(0, 8)}:</span>
                      <span className="content">{msg.content}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <form onSubmit={handleSendMessage} className="chat-form">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Message mesh..."
              />
              <button type="submit">Send</button>
            </form>
          </section>

          <section className="marketplace-panel">
            <h2>Shop & Sell</h2>
            <button className="action-button" onClick={handleListMarketItem}>List Item for Sale</button>
            <div className="market-list">
              {Object.keys(marketItems).length === 0 ? (
                <p className="empty-msg">No items listed yet.</p>
              ) : (
                <ul>
                  {Object.entries(marketItems).map(([key, value]) => {
                    const [name, price] = (value as string).split('|');
                    return (
                      <li key={key} className="market-item-card">
                        <div className="item-info">
                          <span className="market-item-name">{name}</span>
                          <span className="market-item-price">{price} BC</span>
                        </div>
                        <div className="item-meta">
                          <span className="peer-ref">{key.split(':')[1].slice(0, 8)}...</span>
                          <button
                            className="buy-btn"
                            onClick={() => handleBuyItem(key, name, price)}
                            disabled={key.split(':')[1] === peerId}
                          >
                            Buy
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>

          <section className="governance-panel">
            <h2>Governance</h2>
            <form onSubmit={handlePropose} className="propose-form">
              <input type="text" placeholder="Task or Rule Title" value={newPropTitle} onChange={e => setNewPropTitle(e.target.value)} />
              <textarea placeholder="Description of the task or management rule..." value={newPropDesc} onChange={e => setNewPropDesc(e.target.value)} />
              <button type="submit">Propose Task</button>
            </form>
            <div className="proposal-list">
              {proposals.length === 0 ? <p className="empty-msg">No active governance proposals.</p> : (
                proposals.map(p => (
                  <div key={p.id} className="proposal-card">
                    <h4>{p.title}</h4>
                    <p>{p.description}</p>
                    <div className="votes">
                      <span>FOR: {p.votes_for.length}</span>
                      <span>AGAINST: {p.votes_against.length}</span>
                    </div>
                    <div className="vote-actions">
                      <button onClick={() => handleVote(p.id, true)}>Vote For</button>
                      <button onClick={() => handleVote(p.id, false)}>Vote Against</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="learning-panel">
            <LearningHub apiBaseUrl={apiBaseUrl} peerId={peerId} />
          </section>

          <section className="telemetry-panel">
            <h2>Network Health</h2>
            <MonitoringDashboard apiBaseUrl={apiBaseUrl} />
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
