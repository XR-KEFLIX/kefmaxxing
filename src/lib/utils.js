export function cn(...parts) {
  return parts.filter(Boolean).join(' ')
}

export function formatScore(score) {
  return score.toFixed(1)
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export function formatWeight(weight) {
  return `${Math.round(weight * 100)}%`
}

export function scoreHex(score) {
  if (score >= 7.5) return 'rgb(var(--good))'
  if (score >= 6) return 'rgb(var(--accent))'
  if (score >= 4.5) return 'rgb(var(--ink-3))'
  if (score >= 3) return 'rgb(var(--warn))'
  return 'rgb(var(--bad))'
}

export function scoreTextClass(score) {
  if (score >= 7.5) return 'text-good'
  if (score >= 6) return 'text-accent'
  if (score >= 4.5) return 'text-ink2'
  if (score >= 3) return 'text-warn'
  return 'text-bad'
}

export function influenceLabel(influence) {
  if (influence === 'structural') return 'Largely fixed'
  if (influence === 'mixed') return 'Partly changeable'
  if (influence === 'modifiable') return 'Changeable'
  return influence
}

export function levelLabel(level) {
  if (level === 'low') return 'Low'
  if (level === 'high') return 'High'
  return 'Mid'
}

export function titleCase(value) {
  if (!value) return value
  return value
    .split(' ')
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ')
}
