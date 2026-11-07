import type { ChatMessage, Gender, RateResponse, RatingReport } from './types'

export async function requestRating(
  image: string,
  gender: Gender,
  signal?: AbortSignal,
): Promise<RateResponse> {
  const res = await fetch('/api/rate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image, gender }),
    signal,
  })

  let payload: {
    ok?: boolean
    model?: string
    provider?: string
    report?: RateResponse['report']
    error?: string
    message?: string
  } = {}
  try {
    payload = await res.json()
  } catch {
    throw new Error('The server returned an unreadable response. Try again.')
  }

  if (!res.ok) {
    throw new Error(payload.message || payload.error || `Analysis failed (${res.status}). Try again.`)
  }
  if (!payload.ok || !payload.report) {
    throw new Error('The analysis came back incomplete. Try again.')
  }

  return {
    ok: true,
    model: payload.model || 'model',
    provider: payload.provider || 'unknown',
    report: payload.report,
  }
}

export async function askCoach(
  question: string,
  report: RatingReport | null,
  gender: Gender,
  history: ChatMessage[],
  signal?: AbortSignal,
): Promise<string> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question,
      gender,
      report,
      history: history.map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content })),
    }),
    signal,
  })

  let payload: { ok?: boolean; answer?: string; error?: string; message?: string } = {}
  try {
    payload = await res.json()
  } catch {
    throw new Error('The server returned an unreadable response. Try again.')
  }

  if (!res.ok) {
    throw new Error(payload.message || payload.error || `That did not go through (${res.status}). Try again.`)
  }
  if (!payload.ok || !payload.answer) {
    throw new Error('The answer came back empty. Try again.')
  }

  return payload.answer
}
