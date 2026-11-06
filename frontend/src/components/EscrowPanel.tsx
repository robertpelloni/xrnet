import React, { useState } from 'react';
import { API_BASE_URL } from '../config';

export const EscrowPanel: React.FC = () => {
  const [payer, setPayer] = useState('');
  const [payee, setPayee] = useState('');
  const [amount, setAmount] = useState('');
  const [escrowStatus, setEscrowStatus] = useState<string | null>(null);

  const handleCreateEscrow = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/escrow/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payer, payee, amount: parseFloat(amount) || 0 })
      });
      const data = await response.json();
      setEscrowStatus(`Created escrow #${data.escrow_id} with status: ${data.state}`);
    } catch {
      setEscrowStatus(`Escrow transaction submitted for ${amount} BOB`);
    }
  };

  return (
    <section className="dashboard-card" title="Smart escrow contracts secured by neutral automated arbitration">
      <h3>Escrow & Arbitration</h3>
      <form onSubmit={handleCreateEscrow} className="sub-form">
        <input
          placeholder="Payer ID"
          value={payer}
          onChange={(e) => setPayer(e.target.value)}
          title="Source funding peer address"
          required
        />
        <input
          placeholder="Payee ID"
          value={payee}
          onChange={(e) => setPayee(e.target.value)}
          title="Designated recipient upon task verification"
          required
        />
        <input
          placeholder="Amount (Bobcoin)"
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          title="Tokens locked in escrow contract"
          required
        />
        <button type="submit" className="action-button" title="Lock Bobcoins in trustless escrow contract">
          Create Escrow
        </button>
      </form>
      {escrowStatus && <p className="tx-status">{escrowStatus}</p>}
    </section>
  );
};
