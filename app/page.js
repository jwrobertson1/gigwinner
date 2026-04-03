'use client';
import { useState } from 'react';

export default function Home() {
  const [keywords, setKeywords] = useState('');
  const [skills, setSkills] = useState('');
  const [bio, setBio] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const search = async () => {
    if (!keywords) return;
    setLoading(true);
    setError('');
    setJobs([]);

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords, skills, bio })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setJobs(data.jobs || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (score) => {
    if (score >= 8) return '#22c55e';
    if (score >= 6) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: '#0a0a0a', minHeight: '100vh', color: '#f5f4f0' }}>
      
      {/* Header */}
      <div style={{ background: '#111', borderBottom: '1px solid #222', padding: '20px 40px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#22c55e' }}>⚡ GigWinner</div>
        <div style={{ fontSize: '0.85rem', color: '#666' }}>AI-powered Upwork job matching</div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
        
        {/* Search Form */}
        <div style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '32px', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '24px', color: '#fff' }}>Find Your Next Gig</h2>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#888', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Search Keywords *
            </label>
            <input
              value={keywords}
              onChange={e => setKeywords(e.target.value)}
              placeholder="e.g. Google Apps Script, AI automation, Node.js"
              style={{ width: '100%', padding: '12px 16px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '0.95rem', boxSizing: 'border-box' }}
              onKeyDown={e => e.key === 'Enter' && search()}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#888', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Your Skills
            </label>
            <input
              value={skills}
              onChange={e => setSkills(e.target.value)}
              placeholder="e.g. JavaScript, Google Apps Script, Claude API, Node.js, Vercel"
              style={{ width: '100%', padding: '12px 16px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '0.95rem', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#888', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Your Background (optional)
            </label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="e.g. 17 years ops experience, built 4 AI SaaS products, strong in automation and workflow systems"
              rows={3}
              style={{ width: '100%', padding: '12px 16px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '0.95rem', boxSizing: 'border-box', resize: 'vertical' }}
            />
          </div>

          <button
            onClick={search}
            disabled={loading || !keywords}
            style={{ background: loading ? '#333' : '#22c55e', color: loading ? '#666' : '#000', border: 'none', padding: '14px 32px', borderRadius: '8px', fontWeight: 700, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', width: '100%' }}
          >
            {loading ? '🔍 Scanning Upwork...' : '⚡ Find Matching Gigs'}
          </button>

          {error && (
            <div style={{ marginTop: '16px', background: '#fee2e2', border: '1px solid #ef4444', borderRadius: '8px', padding: '12px 16px', color: '#991b1b', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}
        </div>

        {/* Results */}
        {jobs.length > 0 && (
          <div>
            <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '16px' }}>
              Found {jobs.length} jobs — sorted by AI match score
            </div>
            {jobs.map((job, i) => (
              <div key={i} style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '24px', marginBottom: '16px', borderLeft: `4px solid ${scoreColor(job.score)}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: '#fff', flex: 1, marginRight: '16px' }}>{job.title}</div>
                  <div style={{ background: scoreColor(job.score), color: '#000', fontWeight: 800, fontSize: '1.1rem', padding: '4px 12px', borderRadius: '20px', whiteSpace: 'nowrap' }}>
                    {job.score}/10
                  </div>
                </div>

                <div style={{ fontSize: '0.82rem', color: '#22c55e', marginBottom: '8px' }}>{job.reason}</div>
                
                {job.redFlags && job.redFlags !== 'None' && (
                  <div style={{ fontSize: '0.82rem', color: '#f59e0b', marginBottom: '8px' }}>⚠️ {job.redFlags}</div>
                )}

                <div style={{ fontSize: '0.82rem', color: '#555', marginBottom: '12px' }}>
                  {job.description?.slice(0, 200)}...
                </div>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {job.budget?.displayValue && (
                    <span style={{ fontSize: '0.8rem', color: '#888' }}>💰 {job.budget.displayValue}</span>
                  )}
                  {job.client?.paymentVerificationStatus === 'VERIFIED' && (
                    <span style={{ fontSize: '0.8rem', color: '#22c55e' }}>✓ Payment verified</span>
                  )}
                  {job.skills?.slice(0, 4).map((s, si) => (
                    <span key={si} style={{ fontSize: '0.75rem', padding: '2px 8px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '4px', color: '#888' }}>{s.prettyName}</span>
                  ))}
                  {job.url && (
                    <a href={job.url} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 'auto', background: '#22c55e', color: '#000', padding: '6px 16px', borderRadius: '6px', fontWeight: 700, fontSize: '0.8rem', textDecoration: 'none' }}>
                      Apply →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && jobs.length === 0 && keywords && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#444' }}>
            No results yet — hit Find Matching Gigs to search
          </div>
        )}
      </div>
    </div>
  );
}