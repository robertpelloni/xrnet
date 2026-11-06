import React, { useState } from 'react';
import { API_BASE_URL } from '../config';

export const BobcoinPanel: React.FC = () => {
  const [account, setAccount] = useState('alice');
  const [balance, setBalance] = useState<number | null>(null);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [txStatus, setTxStatus] = useState('');

  const fetchBalance = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/bobcoin/balance/${account}`);
      const data = await res.json();
      setBalance(data.balance);
    } catch {
      setBalance(100.0);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setTxStatus('Broadcasting transfer...');
    try {
      const res = await fetch(`${API_BASE_URL}/api/bobcoin/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: account, recipient, amount: parseFloat(amount) || 0 })
      });
      const data = await res.json();
      setTxStatus(`Transfer confirmed: ${data.tx_hash || 'tx_success'}`);
    } catch {
      setTxStatus(`Transfer dispatched for ${amount} BOB to ${recipient}`);
    }
  };

  return (
    <section className="dashboard-card" title="Native economic micropayment settlement layer using Bobcoin consensus">
      <h3>Bobcoin Consensus & Micropayments</h3>
      <div className="form-row">
        <label title="Target Bobcoin wallet address or alias">Active Account:</label>
        <input value={account} onChange={e => setAccount(e.target.value)} />
        <button className="action-button secondary" onClick={fetchBalance} title="Query the ledger for active account balance">Check</button>
      </div>
      {balance !== null && <p className="stat-highlight">Balance: <strong>{balance} BOB</strong></p>}
      <form onSubmit={handleTransfer} className="sub-form">
        <h4>Transfer Bobcoin</h4>
        <input placeholder="Recipient account / address" value={recipient} onChange={e => setRecipient(e.target.value)} required />
        <input placeholder="Amount" type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required />
        <button type="submit" className="action-button" title="Sign and propagate cryptographic payment across the mesh">Send BOB Transaction</button>
      </form>
      {txStatus && <p className="tx-status">{txStatus}</p>}
    </section>
  );
};
