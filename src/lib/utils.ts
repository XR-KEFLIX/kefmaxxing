export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

export function formatScore(score: number): string {
  return score.toFixed(1)
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function formatWeight(weight: number): string {
  return `${Math.round(weight * 100)}%`
}

export function scoreHex(score: number): string {
  if (score >= 7.5) return '#27694C'
  if (score >= 6) return '#1E5C4C'
  if (score >= 4.5) return '#4C4F46'
  if (score >= 3) return '#8F611C'
  return '#99382E'
}

export function scoreTextClass(score: number): string {
  if (score >= 7.5) return 'text-good'
  if (score >= 6) return 'text-accent'
  if (score >= 4.5) return 'text-ink2'
  if (score >= 3) return 'text-warn'
  return 'text-bad'
}

export function influenceLabel(influence: string): string {
  if (influence === 'structural') return 'Largely fixed'
  if (influence === 'mixed') return 'Partly changeable'
  if (influence === 'modifiable') return 'Changeable'
  return influence
}

export function levelLabel(level: string): string {
  if (level === 'low') return 'Lower in band'
  if (level === 'high') return 'Upper in band'
  return 'Mid band'
}

export function titleCase(value: string): string {
  if (!value) return value
  return value
    .split(' ')
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ')
}
