import { NextResponse } from 'next/server';

const UPWORK_CLIENT_ID = process.env.UPWORK_CLIENT_ID;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export async function POST(request) {
  try {
    const { skills, bio, keywords } = await request.json();

    if (!keywords) {
      return NextResponse.json({ error: 'Keywords required' }, { status: 400 });
    }

    const jobs = [
  { title: "Google Apps Script Automation Specialist", description: "We need someone to automate our Google Sheets workflows, send automated emails, and connect our CRM to Sheets.", budget: { displayValue: "$500" }, client: { paymentVerificationStatus: "VERIFIED", totalReviews: 12 }, url: "https://upwork.com", skills: [{ prettyName: "Google Apps Script" }, { prettyName: "Google Sheets" }] },
  { title: "AI Chatbot Developer for Small Business", description: "Build a custom AI chatbot using Claude API for our customer service team. Must have production experience.", budget: { displayValue: "$1,200" }, client: { paymentVerificationStatus: "VERIFIED", totalReviews: 8 }, url: "https://upwork.com", skills: [{ prettyName: "Claude API" }, { prettyName: "JavaScript" }] },
  { title: "Node.js Backend Developer", description: "Need a Node.js developer to build REST APIs and connect to Google Sheets as a database backend.", budget: { displayValue: "$800" }, client: { paymentVerificationStatus: "VERIFIED", totalReviews: 25 }, url: "https://upwork.com", skills: [{ prettyName: "Node.js" }, { prettyName: "REST API" }] },
  { title: "WordPress Designer Needed", description: "Looking for a WordPress designer to build a new theme. No coding needed just design.", budget: { displayValue: "$200" }, client: { paymentVerificationStatus: "UNVERIFIED", totalReviews: 0 }, url: "https://upwork.com", skills: [{ prettyName: "WordPress" }, { prettyName: "PHP" }] }
];
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
 a }
}