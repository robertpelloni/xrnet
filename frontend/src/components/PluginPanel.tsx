import React, { useState, useEffect } from 'react';

interface PluginManifest {
    id: string;
    name: string;
    version: string;
    entry_point: string;
    permissions: string[];
}

export const PluginPanel: React.FC = () => {
    const [plugins, setPlugins] = useState<PluginManifest[]>([]);
    const [statusMsg, setStatusMsg] = useState('');

    useEffect(() => {
        const fetchPlugins = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/plugins');
                const data = await response.json();
                setPlugins(data.plugins);
            } catch (err) {
                console.error("Error fetching plugins:", err);
            }
        };
        fetchPlugins();
    }, []);

    const handleRegister = async () => {
        const manifest: PluginManifest = {
            id: 'plugin_' + Math.random().toString(36).substr(2, 9),
            name: 'Test Plugin',
            version: '1.0.0',
            entry_point: 'main.wasm',
            permissions: ['network', 'storage']
        };

        try {
            const response = await fetch('http://localhost:8080/api/plugins/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(manifest)
            });
            const data = await response.json();
            if (data.success) {
                setStatusMsg('Plugin registered successfully!');
                setPlugins([...plugins, manifest]);
            } else {
                setStatusMsg('Failed to register plugin.');
            }
        } catch (err) {
            console.error("Error registering plugin:", err);
            setStatusMsg('Error registering plugin.');
        }
    };

    const handleExecute = async (id: string) => {
        try {
            const response = await fetch(`http://localhost:8080/api/plugins/${id}/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: "test" })
            });
            const data = await response.json();
            if (data.success) {
                setStatusMsg(`Executed: ${data.result}`);
            } else {
                setStatusMsg(`Execution failed: ${data.error}`);
            }
        } catch (err) {
            console.error("Error executing plugin:", err);
            setStatusMsg('Error executing plugin.');
        }
    };

    return (
        <section className="plugin-panel" style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '1rem', borderRadius: '5px' }}>
            <h2>Plugin Manager</h2>
            <button onClick={handleRegister}>Register Test Plugin</button>
            <p>{statusMsg}</p>
            <ul>
                {plugins.map((plugin) => (
                    <li key={plugin.id}>
                        <strong>{plugin.name}</strong> ({plugin.version})
                        <button onClick={() => handleExecute(plugin.id)} style={{ marginLeft: '10px' }}>Execute</button>
                    </li>
                ))}
            </ul>
        </section>
    );
};
