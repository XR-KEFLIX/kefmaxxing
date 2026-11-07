import { askCoach } from './chat.js'

const MAX_QUESTION = 500
const MAX_HISTORY = 10
const MAX_REPORT_JSON = 14000

function stripDashes(value) {
  return String(value)
    .replace(/\s*[--]\s*/g, ', ')
    .replace(/\s+-\s+/g, ', ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function buildSystem(report, gender) {
  const context = report ? JSON.stringify(report).slice(0, MAX_REPORT_JSON) : 'no rating on file'
  const lines = [
    `You are KEF, the analyst behind Kefmaxxing. You give careful, evidence-aware guidance on facial aesthetics, grooming and presentation.`,
    `The user chose ${gender} reference standards.`,
  ]

  if (report) {
    lines.push(
      `You just produced this report for the user. The report as JSON: ${context}`,
      ``,
      `Use their real features and scores from the report. Do not invent details that are not in it.`,
    )
  } else {
    lines.push(
      `There is no rating on file yet. Answer general questions about facial aesthetics, the method, photo quality and what can realistically change. Do not invent a score or pretend to have seen a photo. Invite the user to upload a photo for a personalised read.`,
      ``,
      `When you describe the method, name the ten dimensions accurately: facial harmony, proportions and symmetry, eye area, midface, jawline and chin, cheekbones and definition, skin quality, hair, grooming, and overall appeal. They are grouped as structure (59%), presentation (23%) and overall appeal (18%). The headline score is a weighted composite out of 10. The PSL-style structural index is a separate, secondary readout.`,
    )
  }

  lines.push(
    ``,
    `Rules:`,
    `- Talk like a person, not an essay. Contractions are fine.`,
    `- Be blunt but on their side. Every criticism comes attached to a fix.`,
    `- Keep answers under 160 words unless they ask for a full routine or a full plan.`,
    `- Plain words, short sentences. Never use em dashes.`,
    `- No hype, no motivational fluff, no moralizing. Never insult.`,
    `- Never suggest surgery first. No medical claims or diagnosis. Never mention race or ethnicity. No slurs.`,
    `- Distinguish genetic structure from modifiable presentation. Do not imply that bone structure can be changed without surgery.`,
    `- Do not describe the method as judging masculinity, femininity or dimorphism. Compare visible features to the reference standard the user chose, neutrally.`,
    `- Do not claim the analysis measures body fat, neck thickness, health, hormones or anything not visible in the photo.`,
    `- Do not claim to measure angles or ratios precisely. Do not invent studies, statistics or certainty. If you cite evidence, keep it general and honest.`,
    `- If they ask about bone smashing, tell them not to do it and explain the risk. If they ask about extreme dieting, discourage it.`,
    `- If they ask about something unrelated to looks, redirect in one line.`,
    `- If they ask for a rating and there is no report, explain that you need a photo and point them to the analysis section.`,
  )

  return lines.join('\n')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed', message: 'POST only.' })
  }

  const body = req.body || {}
  const question = typeof body.question === 'string' ? body.question.trim() : ''
  if (!question || question.length > MAX_QUESTION) {
    return res.status(400).json({ error: 'Bad request', message: 'Ask one question under 500 characters.' })
  }

  const report = body.report && typeof body.report === 'object' ? body.report : null
  const gender = body.gender === 'female' ? 'female' : 'male'

  const messages = [{ role: 'system', content: buildSystem(report, gender) }]

  const history = Array.isArray(body.history) ? body.history : []
  for (const turn of history.slice(-MAX_HISTORY)) {
    if (!turn || typeof turn.content !== 'string') continue
    const role = turn.role === 'assistant' || turn.role === 'coach' ? 'assistant' : 'user'
    const content = turn.content.slice(0, 1000).trim()
    if (content) messages.push({ role, content })
  }

  messages.push({ role: 'user', content: question })

  const result = await askCoach(messages, { maxTokens: 600, temperature: 0.5 })
  if (!result.ok) {
    return res.status(502).json({
      error: 'Upstream error',
      message: 'The assistant is unavailable right now. Try again in a moment.',
    })
  }

  return res.status(200).json({ ok: true, answer: stripDashes(result.text) })
}
