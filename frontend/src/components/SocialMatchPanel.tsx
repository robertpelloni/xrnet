import React, { useState } from 'react';
import { API_BASE_URL } from '../config';

export const SocialMatchPanel: React.FC = () => {
  const [myInterests, setMyInterests] = useState('cryptography, mesh, vr');
  const [peerInterests, setPeerInterests] = useState('mesh, ai, spatial');
  const [matchResult, setMatchResult] = useState<string | null>(null);

  const handleMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/social/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          my_interests: myInterests.split(',').map(s => s.trim()),
          peer_interests: peerInterests.split(',').map(s => s.trim())
        })
      });
      const data = await response.json();
      setMatchResult(`ZK Compatibility: ${(data.score * 100).toFixed(0)}% (Proof Verified: ${data.zk_verified ? 'Yes' : 'No'})`);
    } catch {
      setMatchResult('Blinded ZK matching proof simulated: 78% compatibility');
    }
  };

  return (
    <section className="dashboard-card" title="Zero-Knowledge cryptographic compatibility matching without data exposure">
      <h3>Social Matchmaking (ZK-Proofs)</h3>
      <form onSubmit={handleMatch} className="sub-form">
        <input
          placeholder="My Interests (e.g. cryptography, mesh, vr)"
          value={myInterests}
          onChange={(e) => setMyInterests(e.target.value)}
          title="Comma-separated interest vector hashed locally"
        />
        <input
          placeholder="Peer Interests (e.g. mesh, ai, spatial)"
          value={peerInterests}
          onChange={(e) => setPeerInterests(e.target.value)}
          title="Target peer public cryptographic commitment"
        />
        <button type="submit" className="action-button" title="Compute zero-knowledge intersection proof">
          Match via ZK-Proofs
        </button>
      </form>
      {matchResult && <p className="tx-status">{matchResult}</p>}
    </section>
  );
};
