import React, { useState, useEffect } from 'react';

interface Job {
  id: string;
  title: string;
  description: string;
  reward: number;
  status: 'Open' | 'InProgress' | 'Completed' | 'Disputed';
}

export const JobTaskBoard: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    // Simulating DHT fetch of jobs
    const mockJobs: Job[] = [
      { id: '1', title: '3D Mesh Optimization', description: 'Optimize Gaussian Splatting for mobile', reward: 50, status: 'Open' },
      { id: '2', title: 'Neutral Arbitration', description: 'Resolve dispute #4421 in economic layer', reward: 10, status: 'Open' },
    ];
    setJobs(mockJobs);
    setLoading(false);
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <section className="job-task-board">
      <h2>Mesh Job & Task Board</h2>
      {loading ? (
        <p>Polling DHT for opportunities...</p>
      ) : (
        <div className="job-list">
          {jobs.map((job) => (
            <div key={job.id} className="job-card">
              <div className="job-header">
                <h3>{job.title}</h3>
                <span className="reward">{job.reward} BOB</span>
              </div>
              <p>{job.description}</p>
              <div className="job-footer">
                <span className={`job-status ${job.status.toLowerCase()}`}>{job.status}</span>
                <button className="action-button">Accept Task</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <button onClick={fetchJobs} className="action-button" style={{ marginTop: '1rem' }}>Refresh Board</button>
    </section>
  );
};
