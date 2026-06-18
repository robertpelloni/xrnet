import React from 'react';

interface DiscoveryPanelProps {
  profiles: Record<string, string>;
}

export const DiscoveryPanel: React.FC<DiscoveryPanelProps> = ({ profiles }) => {
  return (
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
  );
};
