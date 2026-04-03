import { NextResponse } from 'next/server';

const UPWORK_CLIENT_ID = process.env.UPWORK_CLIENT_ID;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export async function POST(request) {
  try {
    const { skills, bio, keywords } = await request.json();

    if (!keywords) {
      return NextResponse.json({ error: 'Keywords required' }, { status: 400 });
    }

    const upworkResponse = await fetch('https://api.upwork.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${UPWORK_CLIENT_ID}:`).toString('base64')}`,
      },
      body: JSON.stringify({
        query: `query { publicMarketplaceJobPostingsSearch(marketPlaceJobFilter: { searchExpression: "${keywords}" sortAttribute: RECENCY }) { jobs { title description budget { displayValue } client { totalFeedback totalReviews paymentVerificationStatus } publishedOn url skills { prettyName } } } }`
      })
    });

    const upworkData = await upworkResponse.json();
    const jobs = upworkData?.data?.publicMarketplaceJobPostingsSearch?.jobs || [];

    if (jobs.length === 0) {
      return NextResponse.json({ jobs: [], message: 'No jobs found' });
    }

    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: `Score these Upwork jobs for a freelancer with skills: ${skills} and background: ${bio}. Jobs: ${jobs.map((job, i) => `Job ${i}: ${job.title} - ${job.description?.slice(0, 200)}`).join(' | ')}. Return ONLY a JSON array: [{"index":0,"score":8,"reason":"...","redFlags":"..."}]`
        }]
      })
    });

    const claudeData = await claudeResponse.json();
    const claudeText = claudeData.content[0].text;
    
    let scores = [];
    try {
      scores = JSON.parse(claudeText);
    } catch {
      scores = jobs.map((_, i) => ({ index: i, score: 5, reason: 'Unable to score', redFlags: 'None' }));
    }

    const scoredJobs = jobs.map((job, i) => {
      const scoreData = scores.find(s => s.index === i) || { score: 5, reason: '', redFlags: '' };
      return { ...job, score: scoreData.score, reason: scoreData.reason, redFlags: scoreData.redFlags };
    }).sort((a, b) => b.score - a.score);

    return NextResponse.json({ jobs: scoredJobs });

  } catch (error) {
    console.error('GigWinner API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}