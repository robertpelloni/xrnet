import React, { useState } from 'react';

interface EscrowPanelProps { }

export const EscrowPanel: React.FC<EscrowPanelProps> = () => {
  const [payer, setPayer] = useState('');
  const [payee, setPayee] = useState('');
  const [amount, setAmount] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [escrowId, setEscrowId] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8080/api/escrow/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payer, payee, amount: parseFloat(amount) })
      });
      const data = await res.json();
      setEscrowId(data.escrow_id);
      setStatusMsg(`Escrow created with ID: ${data.escrow_id}`);
    } catch (err) {
      setStatusMsg('Failed to create escrow');
    }
  };

  const handleFund = async () => {
    if (!escrowId) return;
    try {
      const res = await fetch(`http://localhost:8080/api/escrow/fund/${escrowId}`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setStatusMsg(`Escrow ${escrowId} funded successfully.`);
      } else {
        setStatusMsg(`Failed to fund escrow.`);
      }
    } catch (err) {
      setStatusMsg('Failed to fund escrow');
    }
  };

  const handleRelease = async () => {
    if (!escrowId) return;
    try {
      const res = await fetch(`http://localhost:8080/api/escrow/release/${escrowId}`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setStatusMsg(`Escrow ${escrowId} released successfully.`);
      } else {
        setStatusMsg(`Failed to release escrow.`);
      }
    } catch (err) {
      setStatusMsg('Failed to release escrow');
    }
  };

  const handleDispute = async () => {
    if (!escrowId) return;
    try {
      const res = await fetch(`http://localhost:8080/api/escrow/dispute/${escrowId}`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setStatusMsg(`Escrow ${escrowId} disputed. Arbitrator assigned: ${data.arbitrator}`);
      } else {
        setStatusMsg(`Failed to dispute escrow: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      setStatusMsg('Failed to dispute escrow');
    }
  };

  return (
    <section className="escrow-panel" style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '1rem', borderRadius: '5px' }}>
      <h2>Escrow & Arbitration</h2>
      <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
        <input type="text" placeholder="Payer ID" value={payer} onChange={e => setPayer(e.target.value)} required />
        <input type="text" placeholder="Payee ID" value={payee} onChange={e => setPayee(e.target.value)} required />
        <input type="number" placeholder="Amount (Bobcoin)" value={amount} onChange={e => setAmount(e.target.value)} required />
        <button type="submit">Create Escrow</button>
      </form>

      {escrowId && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button onClick={handleFund}>Fund Escrow</button>
          <button onClick={handleRelease}>Release Escrow</button>
          <button onClick={handleDispute} style={{ background: '#d9534f', color: 'white' }}>Dispute (Assign Arbitrator)</button>
        </div>
      )}

      {statusMsg && <p style={{ marginTop: '1rem', fontStyle: 'italic' }}>{statusMsg}</p>}
    </section>
  );
};
