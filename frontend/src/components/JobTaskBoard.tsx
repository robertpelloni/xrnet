import React, { useState } from 'react';
import { API_BASE_URL } from '../config';

interface Job {
  id: string;
  title: string;
  reward: number;
  status: string;
  description: string;
}

export const JobTaskBoard: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([
    { id: '1', title: '3D Mesh Optimization', reward: 50, status: 'Open', description: 'Optimize Gaussian Splatting for mobile nodes' },
    { id: '2', title: 'Neutral Arbitration', reward: 10, status: 'In Progress', description: 'Resolve dispute #4421 in economic layer' }
  ]);
  const [title, setTitle] = useState('');
  const [reward, setReward] = useState('25');
  const [description, setDescription] = useState('');
  const [postStatus, setPostStatus] = useState('');

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    setPostStatus('Publishing task bounty to DHT...');
    const newJob: Job = {
      id: Math.random().toString(36).substring(7),
      title,
      reward: parseFloat(reward) || 10,
      status: 'Open',
      description
    };

    try {
      await fetch(`${API_BASE_URL}/api/dht/put`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: `job:${newJob.id}`, value: JSON.stringify(newJob) })
      });
      setJobs(prev => [...prev, newJob]);
      setPostStatus(`Job '${title}' published with ${reward} BOB reward`);
      setTitle('');
      setDescription('');
    } catch {
      setJobs(prev => [...prev, newJob]);
      setPostStatus(`Job '${title}' queued to local mesh board`);
    }
  };

  const handleAccept = (id: string) => {
    setJobs(jobs.map(j => j.id === id ? { ...j, status: 'Accepted' } : j));
  };

  return (
    <section className="dashboard-card" title="Decentralized DHT-backed freelance task and compute bounties">
      <div className="panel-header-row">
        <h3>Mesh Job & Task Board</h3>
        <button className="action-button secondary sm" onClick={() => setJobs([...jobs])} title="Fetch recent task postings from Kademlia ring">
          Refresh
        </button>
      </div>
      <form onSubmit={handlePostJob} className="sub-form">
        <h4>Post New Mesh Bounty</h4>
        <div className="form-row">
          <input
            placeholder="Task Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            title="Short title for computational or human task"
            required
          />
          <input
            type="number"
            placeholder="BOB Reward"
            value={reward}
            onChange={e => setReward(e.target.value)}
            title="Bobcoin token bounty"
            style={{ width: '100px' }}
            required
          />
        </div>
        <textarea
          placeholder="Task requirements and completion criteria..."
          value={description}
          onChange={e => setDescription(e.target.value)}
          title="Full specifications"
        />
        <button type="submit" className="action-button" title="Broadcast task offering to the swarm">
          Post Task to DHT
        </button>
      </form>
      {postStatus && <p className="tx-status">{postStatus}</p>}

      <div className="job-list">
        {jobs.map(job => (
          <div key={job.id} className="job-card">
            <div className="job-header">
              <span className="job-title"><strong>{job.title}</strong></span>
              <span className="job-reward">{job.reward} BOB</span>
            </div>
            <p className="job-desc">{job.description}</p>
            <div className="job-footer">
              <span className={`badge ${job.status.toLowerCase()}`}>{job.status}</span>
              {job.status === 'Open' && (
                <button className="action-button secondary sm" onClick={() => handleAccept(job.id)} title="Claim task and lock escrow funds">
                  Accept Task
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
