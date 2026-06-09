import { useState, useEffect } from 'react';

interface LearningModule {
  id: string;
  title: string;
  author: string;
  content: string;
}

export const LearningHub = ({ apiBaseUrl, peerId }: { apiBaseUrl: string, peerId: string }) => {
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  const fetchModules = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/profile`); // Currently sharing profiles map for DHT records
      const data = await response.json();
      const learningModules: LearningModule[] = Object.entries(data)
        .filter(([key]) => key.startsWith('learn:'))
        .map(([key, value]) => {
          const parts = (value as string).split('|');
          return {
            id: key,
            title: parts[0] || 'Untitled',
            author: key.split(':')[1] || 'Unknown',
            content: parts[1] || ''
          };
        });
      setModules(learningModules);
    } catch (err) {
      console.error('Failed to fetch learning modules:', err);
    }
  };

  useEffect(() => {
    fetchModules();
    const interval = setInterval(fetchModules, 5000);
    return () => clearInterval(interval);
  }, [apiBaseUrl]);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    setIsPublishing(true);

    try {
      await fetch(`${apiBaseUrl}/api/dht/put`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: `learn:${peerId}:${Date.now()}`,
          value: `${title}|${content}`
        })
      });
      setTitle('');
      setContent('');
      alert('Learning module published to the mesh!');
      fetchModules();
    } catch (err) {
      console.error('Publish failed:', err);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="learning-hub">
      <h3>Decentralized Learning</h3>
      <form onSubmit={handlePublish} className="publish-form">
        <input
          type="text"
          placeholder="Title (e.g. Intro to Mesh Networking)"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Content or URL to educational material..."
          value={content}
          onChange={e => setContent(e.target.value)}
        />
        <button type="submit" disabled={isPublishing}>
          {isPublishing ? 'Publishing...' : 'Contribute Knowledge'}
        </button>
      </form>

      <div className="module-list">
        {modules.length === 0 ? (
          <p className="empty-msg">No educational modules found on the mesh.</p>
        ) : (
          modules.map(mod => (
            <div key={mod.id} className="learning-card">
              <h4>{mod.title}</h4>
              <p className="author">By: {mod.author.slice(0,8)}...</p>
              <div className="content-preview">{mod.content}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
