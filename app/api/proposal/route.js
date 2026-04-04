import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { job, skills, bio } = await request.json();

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `Write a winning Upwork proposal for this job. Sound human, confident, and specific. Do NOT use generic openers like "I am writing to apply". Lead with the most relevant experience immediately.

Job Title: ${job.title}
Job Description: ${job.description}
Budget: ${job.budget?.displayValue || 'Not specified'}

Freelancer Profile:
Skills: ${skills}
Background: ${bio}

Write a proposal of 150-200 words. Be specific to THIS job. End with a clear call to action.`
        }]
      })
    });

    const data = await res.json();
    const proposal = data.content[0].text;
    return NextResponse.json({ proposal });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}