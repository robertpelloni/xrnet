import React from 'react';

interface StatusPanelProps {
  status: string;
  peerId: string;
  isSyncing: boolean;
  protocolOutput: string;
  handlePublishProfile: () => void;
  handleProtocol: () => void;
}

export const StatusPanel: React.FC<StatusPanelProps> = ({
  status,
  peerId,
  isSyncing,
  protocolOutput,
  handlePublishProfile,
  handleProtocol
}) => {
  return (
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
  );
};
