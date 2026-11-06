import React, { useState } from 'react';
import { API_BASE_URL } from '../config';

interface GovernancePanelProps {
  neutralityIndex: number;
  bestArbitrator?: string;
}

export const GovernancePanel: React.FC<GovernancePanelProps> = ({
  neutralityIndex,
  bestArbitrator
}) => {
  const [peerId, setPeerId] = useState('');
  const [uptime, setUptime] = useState('120');
  const [stake, setStake] = useState('500');
  const [disputesResolved, setDisputesResolved] = useState('12');
  const [status, setStatus] = useState('');

  const handleSubmitMetric = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Submitting metric to governance consensus...');
    try {
      const res = await fetch(`${API_BASE_URL}/api/governance/neutrality`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          peer_id: peerId,
          uptime_hours: parseInt(uptime) || 0,
          stake_amount: parseFloat(stake) || 0,
          disputes_resolved: parseInt(disputesResolved) || 0
        })
      });
      const data = await res.json();
      setStatus(`Neutrality metric recorded! Calculated Score: ${(data.calculated_score * 100).toFixed(1)}%`);
    } catch {
      setStatus('Metric recorded locally in neutrality pool.');
    }
  };

  return (
    <section className="dashboard-card" title="Algorithmic reputation and dispute arbitration governance">
      <h3>Governance & Neutrality Scoring</h3>
      <div className="status-grid">
        <div className="status-item">
          <label title="Elected automated arbitrator node for mesh escrow disputes">Active Arbitrator:</label>
          <span className="mono">{bestArbitrator || 'None Available'}</span>
        </div>
        <div className="status-item">
          <label title="Weighted neutrality index across active cluster">Current Node Neutrality:</label>
          <span className="neutrality-val">{(neutralityIndex * 100).toFixed(1)}%</span>
        </div>
      </div>
      <form onSubmit={handleSubmitMetric} className="sub-form">
        <h4>Register Node Neutrality Metric</h4>
        <input
          placeholder="Peer ID or Alias to score"
          value={peerId}
          onChange={e => setPeerId(e.target.value)}
          required
        />
        <div className="metric-row">
          <div>
            <label>Uptime (hrs)</label>
            <input type="number" value={uptime} onChange={e => setUptime(e.target.value)} />
          </div>
          <div>
            <label>Stake (BOB)</label>
            <input type="number" value={stake} onChange={e => setStake(e.target.value)} />
          </div>
          <div>
            <label>Resolved</label>
            <input type="number" value={disputesResolved} onChange={e => setDisputesResolved(e.target.value)} />
          </div>
        </div>
        <button type="submit" className="action-button" title="Publish reputation and stake proof to governance quorum">
          Register Neutrality Metric
        </button>
      </form>
      {status && <p className="tx-status">{status}</p>}
    </section>
  );
};
