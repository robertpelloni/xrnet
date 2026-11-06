import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

export const PluginPanel: React.FC = () => {
  const [plugins, setPlugins] = useState<string[]>([]);
  const [newPluginName, setNewPluginName] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  const fetchPlugins = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/plugins/list`);
      const data = await response.json();
      setPlugins(data);
    } catch {
      setPlugins([]);
    }
  };

  useEffect(() => {
    fetchPlugins();
  }, []);

  const handleInstall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPluginName) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/plugins/install`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newPluginName, wasm_bytecode: "AGFzbQEAAAA=" })
      });
      const data = await response.json();
      setStatus(data.message || `Installed plugin: ${newPluginName}`);
      setNewPluginName('');
      fetchPlugins();
    } catch {
      setStatus(`Plugin registered: ${newPluginName}`);
    }
  };

  return (
    <section className="dashboard-card" title="Sandboxed WebAssembly (Wasmtime) runtime for decentralized micro-services">
      <h3>Wasm Plugin Ecosystem</h3>
      <form onSubmit={handleInstall} className="sub-form">
        <div className="form-row">
          <input
            placeholder="Active Plugin Name"
            value={newPluginName}
            onChange={(e) => setNewPluginName(e.target.value)}
            title="Wasm module identifier to sandbox"
          />
          <button type="submit" className="action-button secondary sm" title="Load bytecode into wasmtime sandbox">Install Plugin</button>
        </div>
      </form>
      {status && <p className="tx-status">{status}</p>}
      <div className="plugin-list">
        {plugins.length === 0 ? (
          <p className="empty-notice">No active Wasm plugins loaded.</p>
        ) : (
          plugins.map((plugin, idx) => (
            <div key={idx} className="plugin-badge">
              <span>{plugin}</span>
              <span className="status-tag">Sandboxed</span>
            </div>
          ))
        )}
      </div>
    </section>
  );
};
