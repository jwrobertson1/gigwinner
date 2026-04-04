'use client';
import { useState, useEffect } from 'react';

const FREE_LIMIT = 1;

export default function Home() {
  const [keywords, setKeywords] = useState('');
  const [skills, setSkills] = useState('');
  const [bio, setBio] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchCount, setSearchCount] = useState(0);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [proposals, setProposals] = useState({});
  const [generatingProposal, setGeneratingProposal] = useState(null);
  const [isPro, setIsPro] = useState(() => {
  if (typeof window === 'undefined') return false;
  return document.cookie.includes('gigwinner_pro=true');
});

  useEffect(() => {
    const today = new Date().toDateString();
    const stored = JSON.parse(localStorage.getItem('gw_usage') || '{}');
    if (stored.date === today) {
      setSearchCount(stored.count || 0);
    } else {
      localStorage.setItem('gw_usage', JSON.stringify({ date: today, count: 0 }));
    }
  }, []);

  const incrementSearch = () => {
    const today = new Date().toDateString();
    const newCount = searchCount + 1;
    setSearchCount(newCount);
    localStorage.setItem('gw_usage', JSON.stringify({ date: today, count: newCount }));
  };

  const search = async () => {
    if (!keywords) return;
    if (!isPro && searchCount >= FREE_LIMIT) {
      setShowUpgrade(true);
      return;
    }
    setLoading(true);
    setError('');
    setJobs([]);
    setProposals({});

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords, skills, bio })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setJobs(data.jobs || []);
      incrementSearch();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateProposal = async (job, index) => {
    if (!isPro) {
      setShowUpgrade(true);
      return;
    }
    setGeneratingProposal(index);
    try {
      const res = await fetch('/api/proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job, skills, bio })
      });
      const data = await res.json();
      setProposals(prev => ({ ...prev, [index]: data.proposal }));
    } catch (err) {
      setProposals(prev => ({ ...prev, [index]: 'Error generating proposal.' }));
    } finally {
      setGeneratingProposal(null);
    }
  };

  const scoreColor = (score) => {
    if (score >= 8) return '#22c55e';
    if (score >= 6) return '#f59e0b';
    return '#ef4444';
  };

  const searchesLeft = Math.max(0, FREE_LIMIT - searchCount);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: '#0a0a0a', minHeight: '100vh', color: '#f5f4f0' }}>

      {/* Header */}
      <div style={{ background: '#111', borderBottom: '1px solid #222', padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#22c55e' }}>⚡ GigWinner</div>
          <div style={{ fontSize: '0.85rem', color: '#666' }}>AI-powered Upwork job matching</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {!isPro && (
            <div style={{ fontSize: '0.8rem', color: '#666' }}>
              {searchesLeft} free search{searchesLeft !== 1 ? 'es' : ''} left today
            </div>
          )}
          {isPro ? (
            <div style={{ background: '#22c55e', color: '#000', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>
              ⚡ Pro
            </div>
          ) : (
            <button
              onClick={() => setShowUpgrade(true)}
              style={{ background: '#22c55e', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
            >
              Upgrade $9.99/mo
            </button>
          )}
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgrade && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ background: '#111', border: '1px solid #333', borderRadius: '16px', padding: '40px', maxWidth: '480px', width: '100%' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#22c55e', marginBottom: '8px' }}>⚡ Upgrade to Pro</div>
            <div style={{ fontSize: '0.9rem', color: '#888', marginBottom: '32px' }}>Stop missing the best gigs. Let AI do the work.</div>

            <div style={{ marginBottom: '32px' }}>
              {[
                ['Unlimited daily searches', true],
                ['AI proposal drafting — in your voice', true],
                ['Smart job scoring with red flag detection', true],
                ['Daily top matches email digest', true],
                ['Profile learning — gets smarter over time', true],
              ].map(([feature, included], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <span style={{ color: '#22c55e', fontWeight: 700 }}>✓</span>
                  <span style={{ fontSize: '0.9rem', color: '#ccc' }}>{feature}</span>
                </div>
              ))}
            </div>

            <div style={{ background: '#0a0a0a', borderRadius: '10px', padding: '20px', marginBottom: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#22c55e' }}>$9.99</div>
              <div style={{ fontSize: '0.85rem', color: '#666' }}>per month — cancel anytime</div>
              <div style={{ fontSize: '0.75rem', color: '#444', marginTop: '8px' }}>One landed gig pays for years of GigWinner</div>
            </div>

            <button
              onClick={async () => {
  const res = await fetch('/api/checkout', { method: 'POST' });
  const data = await res.json();
  if (data.url) window.location.href = data.url;
}}
              style={{ width: '100%', background: '#22c55e', color: '#000', border: 'none', padding: '16px', borderRadius: '8px', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer', marginBottom: '12px' }}
            >
              Start Pro — $9.99/month
            </button>
            <button
              onClick={() => setShowUpgrade(false)}
              style={{ width: '100%', background: 'transparent', color: '#666', border: '1px solid #333', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' }}
            >
              Maybe later
            </button>
          </div>
        </div>
      )}

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
              Your Background
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

          {!isPro && searchCount >= FREE_LIMIT && (
            <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '0.85rem', color: '#f59e0b' }}>
              You've used your free search for today.{' '}
              <span onClick={() => setShowUpgrade(true)} style={{ color: '#22c55e', cursor: 'pointer', fontWeight: 700 }}>Upgrade for unlimited →</span>
            </div>
          )}

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

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {job.budget?.displayValue && (
                    <span style={{ fontSize: '0.8rem', color: '#888' }}>💰 {job.budget.displayValue}</span>
                  )}
                  {job.client?.paymentVerificationStatus === 'VERIFIED' && (
                    <span style={{ fontSize: '0.8rem', color: '#22c55e' }}>✓ Verified</span>
                  )}
                  {job.skills?.slice(0, 3).map((s, si) => (
                    <span key={si} style={{ fontSize: '0.75rem', padding: '2px 8px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '4px', color: '#888' }}>{s.prettyName}</span>
                  ))}
                  <button
                    onClick={() => generateProposal(job, i)}
                    disabled={generatingProposal === i}
                    style={{ background: isPro ? '#1a1a1a' : '#0d1a0d', color: isPro ? '#22c55e' : '#2a5c2a', border: `1px solid ${isPro ? '#22c55e' : '#2a5c2a'}`, padding: '6px 14px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    {generatingProposal === i ? '✍️ Writing...' : isPro ? '✍️ Draft Proposal' : '🔒 Draft Proposal'}
                  </button>
                  {job.url && (
                    <a href={job.url} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 'auto', background: '#22c55e', color: '#000', padding: '6px 16px', borderRadius: '6px', fontWeight: 700, fontSize: '0.8rem', textDecoration: 'none' }}>
                      Apply →
                    </a>
                  )}
                </div>

                {/* Proposal Output */}
                {proposals[i] && (
                  <div style={{ marginTop: '16px', background: '#0d1a0d', border: '1px solid #1a3d1a', borderRadius: '8px', padding: '16px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#22c55e', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      ✍️ AI-Generated Proposal
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#ccc', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>{proposals[i]}</div>
                    <button
                      onClick={() => navigator.clipboard.writeText(proposals[i])}
                      style={{ marginTop: '12px', background: 'transparent', color: '#22c55e', border: '1px solid #22c55e', padding: '6px 14px', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}
                    >
                      Copy to clipboard
                    </button>
                  </div>
                )}
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