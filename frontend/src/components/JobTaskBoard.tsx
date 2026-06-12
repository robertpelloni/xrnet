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
    try {
      const response = await fetch('http://localhost:8080/api/jobs');
      const data: Record<string, string> = await response.json();

      const parsedJobs: Job[] = Object.entries(data).map(([key, value]) => {
        try {
          const parsed = JSON.parse(value);
          return {
            id: key,
            title: parsed.title || 'Untitled Task',
            description: parsed.description || 'No description provided.',
            reward: parsed.reward || 0,
            status: parsed.status || 'Open'
          };
        } catch {
          return {
            id: key,
            title: 'Legacy Task',
            description: value,
            reward: 0,
            status: 'Open'
          };
        }
      });

      // If no jobs in DHT, show seed data for demonstration
      if (parsedJobs.length === 0) {
        setJobs([
          { id: 'job:seed:1', title: '3D Mesh Optimization', description: 'Optimize Gaussian Splatting for mobile', reward: 50, status: 'Open' },
          { id: 'job:seed:2', title: 'Neutral Arbitration', description: 'Resolve dispute #4421 in economic layer', reward: 10, status: 'Open' },
        ]);
      } else {
        setJobs(parsedJobs);
      }
    } catch (error) {
      console.error('Failed to fetch jobs from DHT:', error);
    } finally {
      setLoading(false);
    }
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
