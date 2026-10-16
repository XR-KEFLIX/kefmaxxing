export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

export function scoreColor(score: number): string {
  if (score < 4) return '#f87171'
  if (score < 6) return '#fbbf24'
  if (score < 7.5) return '#4ade80'
  return '#d8b878'
}

export function pslColor(psl: number): string {
  if (psl < 3) return '#f87171'
  if (psl < 4) return '#fbbf24'
  if (psl < 6) return '#4ade80'
  return '#d8b878'
}

export function formatScore(score: number): string {
  return score.toFixed(1)
}
