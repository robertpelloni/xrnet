import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

interface PluginManifest {
  id: string;
  name: string;
  version: string;
  entry_point: string;
  permissions: string[];
}

export const PluginPanel: React.FC = () => {
  const [plugins, setPlugins] = useState<PluginManifest[]>([]);
  const [newPluginName, setNewPluginName] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [selectedPluginId, setSelectedPluginId] = useState<string>('');
  const [payloadInput, setPayloadInput] = useState('{"action": "ping", "data": "xrnet"}');
  const [execResult, setExecResult] = useState<string | null>(null);

  const fetchPlugins = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/plugins`);
      if (response.ok) {
        const data = await response.json();
        const list: PluginManifest[] = data.plugins || [];
        setPlugins(list);
        if (list.length > 0 && !selectedPluginId) {
          setSelectedPluginId(list[0].id);
        }
      }
    } catch {
      // Standalone mode default list
      setPlugins([
        {
          id: 'spatial-sync',
          name: 'Spatial Mesh Synchronizer',
          version: '1.0.0',
          entry_point: 'spatial_sync.wasm',
          permissions: ['network', 'dht']
        }
      ]);
      setSelectedPluginId('spatial-sync');
    }
  };

  useEffect(() => {
    fetchPlugins();
  }, []);

  const handleInstall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPluginName) return;
    const manifest: PluginManifest = {
      id: newPluginName.toLowerCase().replace(/\s+/g, '-'),
      name: newPluginName,
      version: '1.0.0',
      entry_point: `${newPluginName.toLowerCase().replace(/\s+/g, '_')}.wasm`,
      permissions: ['dht', 'storage']
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/plugins/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(manifest)
      });
      const data = await response.json();
      if (data.success) {
        setStatus(`Registered Wasm plugin: ${manifest.name}`);
        setNewPluginName('');
        fetchPlugins();
      } else {
        setStatus(`Registration returned false (already exists)`);
      }
    } catch {
      setStatus(`Plugin registered locally: ${manifest.name}`);
      setPlugins(prev => [...prev, manifest]);
      setSelectedPluginId(manifest.id);
      setNewPluginName('');
    }
  };

  const handleExecute = async () => {
    if (!selectedPluginId) return;
    setStatus(`Executing ${selectedPluginId} in Wasmtime sandbox...`);
    try {
      let parsedPayload: Record<string, unknown> = {};
      try {
        parsedPayload = JSON.parse(payloadInput);
      } catch {
        parsedPayload = { raw: payloadInput };
      }

      const res = await fetch(`${API_BASE_URL}/api/plugins/${selectedPluginId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedPayload)
      });
      const data = await res.json();
      if (data.success) {
        setExecResult(data.result);
        setStatus(`Execution successful`);
      } else {
        setExecResult(`Error: ${data.error}`);
        setStatus(`Execution failed`);
      }
    } catch {
      setExecResult(`[Simulation] Wasm sandbox executed ${selectedPluginId} with payload: ${payloadInput} -> result: 42`);
      setStatus(`Execution simulation complete`);
    }
  };

  return (
    <section className="dashboard-card" title="Sandboxed WebAssembly (Wasmtime) runtime for decentralized micro-services">
      <h3>Wasm Plugin Ecosystem</h3>
      <form onSubmit={handleInstall} className="sub-form">
        <div className="form-row">
          <input
            placeholder="Register Plugin Name"
            value={newPluginName}
            onChange={(e) => setNewPluginName(e.target.value)}
            title="Wasm module identifier to register in sandbox"
          />
          <button type="submit" className="action-button secondary sm" title="Register plugin manifest into wasmtime sandbox">
            Register
          </button>
        </div>
      </form>

      <div className="plugin-list" style={{ marginTop: '0.75rem' }}>
        {plugins.length === 0 ? (
          <p className="empty-notice">No active Wasm plugins loaded.</p>
        ) : (
          plugins.map((plugin) => (
            <div
              key={plugin.id}
              className={`plugin-badge ${selectedPluginId === plugin.id ? 'active' : ''}`}
              onClick={() => setSelectedPluginId(plugin.id)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.4rem 0.6rem',
                background: selectedPluginId === plugin.id ? '#1e293b' : 'var(--bg-input)',
                borderRadius: '4px',
                marginBottom: '0.35rem',
                cursor: 'pointer',
                border: selectedPluginId === plugin.id ? '1px solid var(--accent-blue)' : '1px solid transparent'
              }}
              title={`Click to select ${plugin.name} for execution`}
            >
              <span>{plugin.name} <code style={{ fontSize: '0.75rem', color: '#94a3b8' }}>v{plugin.version}</code></span>
              <span className="status-tag" style={{ color: '#38bdf8', fontSize: '0.75rem' }}>Sandboxed</span>
            </div>
          ))
        )}
      </div>

      {plugins.length > 0 && (
        <div className="plugin-execution-box" style={{ marginTop: '0.75rem', background: '#0a0e17', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
            Execute Sandbox: <strong>{selectedPluginId}</strong>
          </label>
          <input
            value={payloadInput}
            onChange={(e) => setPayloadInput(e.target.value)}
            placeholder='Payload JSON e.g. {"action": "sync"}'
            title="JSON input payload passed into WebAssembly instance memory"
            style={{ marginBottom: '0.4rem', fontSize: '0.8rem' }}
          />
          <button
            type="button"
            className="action-button sm"
            onClick={handleExecute}
            title="Invoke exported Wasm typed function inside Wasmtime sandbox"
          >
            Invoke Wasm Function
          </button>
          {execResult && (
            <pre style={{ margin: '0.5rem 0 0', padding: '0.4rem', background: '#030712', borderRadius: '4px', fontSize: '0.75rem', color: '#34d399', whiteSpace: 'pre-wrap' }}>
              {execResult}
            </pre>
          )}
        </div>
      )}

      {status && <p className="tx-status">{status}</p>}
    </section>
  );
};
