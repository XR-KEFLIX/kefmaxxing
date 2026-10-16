import { callAgnes } from './_agnes.js';

const MAX_QUESTION = 500;
const MAX_HISTORY = 10;
const MAX_REPORT_JSON = 4000;

function stripDashes(value) {
  return String(value)
    .replace(/\s*—\s*/g, ', ')
    .replace(/\s+-\s+/g, ', ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function buildSystem(report, gender) {
  const context = report ? JSON.stringify(report).slice(0, MAX_REPORT_JSON) : 'no rating on file';
  return [
    `You are KEFMAXX, the rater behind kefmaxxing. You just rated this user's face.`,
    `Their rating as JSON: ${context}`,
    `Their reference: ${gender} standards.`,
    ``,
    `Answer their follow-up questions about their face, their plan and looksmaxxing. Rules:`,
    `- Blunt, but on their side. Every criticism comes attached to the fix.`,
    `- Use their real features and scores from the rating above. No generic advice.`,
    `- Under 120 words unless they ask for a full routine or a full plan.`,
    `- Plain words, short sentences. Never use em dashes or hyphens as punctuation.`,
    `- No hype, no motivational fluff, no moralizing. Never insult.`,
    `- Never suggest surgery first. No medical claims. Never mention race or ethnicity. No slurs.`,
    `- If they ask about something unrelated to looks, redirect in one line.`,
  ].join('\n');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed', message: 'POST only.' });
  }

  if (!process.env.RATE_API_KEY) {
    return res.status(500).json({
      error: 'Server configuration error',
      message: 'RATE_API_KEY is not set. Add it as an environment variable in Vercel.',
    });
  }

  const body = req.body || {};
  const question = typeof body.question === 'string' ? body.question.trim() : '';
  if (!question || question.length > MAX_QUESTION) {
    return res.status(400).json({ error: 'Bad request', message: 'Ask one question under 500 characters.' });
  }

  const report = body.report && typeof body.report === 'object' ? body.report : null;
  const gender = body.gender === 'female' ? 'female' : 'male';

  const messages = [{ role: 'system', content: buildSystem(report, gender) }];

  const history = Array.isArray(body.history) ? body.history : [];
  for (const turn of history.slice(-MAX_HISTORY)) {
    if (!turn || typeof turn.content !== 'string') continue;
    const role = turn.role === 'assistant' || turn.role === 'coach' ? 'assistant' : 'user';
    const content = turn.content.slice(0, 1000).trim();
    if (content) messages.push({ role, content });
  }

  messages.push({ role: 'user', content: question });

  const result = await callAgnes(messages, { maxTokens: 500, temperature: 0.6 });
  if (!result.ok) {
    return res.status(502).json({
      error: 'Upstream error',
      message: 'The coach is unavailable right now. Try again in a moment.',
    });
  }

  return res.status(200).json({ ok: true, answer: stripDashes(result.text) });
}
