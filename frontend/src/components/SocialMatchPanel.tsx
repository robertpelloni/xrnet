import React, { useState } from 'react';

interface SocialMatchPanelProps { }

export const SocialMatchPanel: React.FC<SocialMatchPanelProps> = () => {
  const [myInterests, setMyInterests] = useState('');
  const [otherInterests, setOtherInterests] = useState('');
  const [matches, setMatches] = useState<string[]>([]);
  const [zkVerified, setZkVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setMatches([]);
    setZkVerified(false);

    try {
      const myIntList = myInterests.split(',').map(i => i.trim()).filter(i => i);
      const otherIntList = otherInterests.split(',').map(i => i.trim()).filter(i => i);

      const res = await fetch('http://localhost:8080/api/social/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interests: myIntList, other_interests: otherIntList })
      });
      const data = await res.json();
      setMatches(data.matches || []);
      setZkVerified(data.zk_verified || false);
    } catch (err) {
      setErrorMsg('Failed to process matchmaking.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="social-match-panel" style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '1rem', borderRadius: '5px' }}>
      <h2>Privacy-Preserving Social Matchmaking (ZK-Proofs)</h2>
      <form onSubmit={handleMatch} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
        <input type="text" placeholder="My Interests (comma separated)" value={myInterests} onChange={e => setMyInterests(e.target.value)} required />
        <input type="text" placeholder="Other Profile Interests (comma separated)" value={otherInterests} onChange={e => setOtherInterests(e.target.value)} required />
        <button type="submit" disabled={loading}>{loading ? 'Generating ZK-Proofs...' : 'Match via ZK-Proofs'}</button>
      </form>

      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}

      {matches.length > 0 && (
        <div>
          <h3>Matches Found:</h3>
          <ul>
            {matches.map((m, idx) => (
              <li key={idx}>Hash: {m}</li>
            ))}
          </ul>
          {zkVerified && <p style={{ color: 'green', fontWeight: 'bold' }}>✓ Zero-Knowledge Proof Verified!</p>}
        </div>
      )}
      {matches.length === 0 && !loading && zkVerified && (
          <p>No matches found.</p>
      )}
    </section>
  );
};
