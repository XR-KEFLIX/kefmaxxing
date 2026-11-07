import { useEffect, useState, type ReactNode } from 'react'
import { cn, formatScore, influenceLabel, scoreHex } from '../lib/utils'
import type { EvidenceLevel, Influence } from '../lib/types'

export function SectionHeading({
  index,
  eyebrow,
  title,
  description,
  className,
}: {
  index?: string
  eyebrow: string
  title: string
  description?: string
  className?: string
}) {
  return (
    <div className={cn('max-w-3xl', className)}>
      <div className="flex items-center gap-3">
        {index && <span className="eyebrow">{index}</span>}
        <span className="h-px w-8 bg-lineStrong" aria-hidden="true" />
        <span className="eyebrow">{eyebrow}</span>
      </div>
      <h2 className="mt-4 text-balance text-[clamp(2rem,4vw,3rem)] leading-[1.04] tracking-[-0.03em] text-ink">
        {title}
      </h2>
      {description && <p className="mt-4 text-pretty text-[15px] leading-relaxed text-ink2">{description}</p>}
    </div>
  )
}

export function Meter({ score, className }: { score: number; className?: string }) {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setWidth(score * 10), 120)
    return () => clearTimeout(timer)
  }, [score])

  return (
    <div className={cn('relative h-1.5 overflow-hidden rounded-full bg-sunken', className)}>
      <div
        className="meter h-full rounded-full"
        style={{ width: `${width}%`, backgroundColor: scoreHex(score) }}
      />
      <span className="absolute inset-y-0 left-1/2 w-px bg-lineStrong/80" aria-hidden="true" />
    </div>
  )
}

const SCALE_TICKS = [
  { value: 1, label: '1' },
  { value: 3, label: '3' },
  { value: 5, label: '5 average' },
  { value: 7, label: '7' },
  { value: 10, label: '10' },
]

export function ScoreScale({ value, potential }: { value: number; potential?: number }) {
  const position = (score: number) => ((score - 1) / 9) * 100

  return (
    <div>
      <div className="relative h-2 rounded-full bg-sunken">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-accent/15"
          style={{ width: `${position(value)}%` }}
        />
        <div
          className="absolute top-1/2 h-4 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent"
          style={{ left: `${position(value)}%` }}
          title={`Current: ${formatScore(value)} / 10`}
        />
        {typeof potential === 'number' && (
          <div
            className="absolute top-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2 bg-clay"
            style={{ left: `${position(potential)}%` }}
            title={`Potential: ${formatScore(potential)} / 10`}
          />
        )}
      </div>
      <div className="relative mt-2 h-4 font-mono text-[10px] text-ink3">
        {SCALE_TICKS.map((tick) => {
          const left = position(tick.value)
          return (
            <span
              key={tick.value}
              className="absolute top-0 whitespace-nowrap"
              style={{
                left: `${left}%`,
                transform: left === 0 ? 'translateX(0)' : left === 100 ? 'translateX(-100%)' : 'translateX(-50%)',
              }}
            >
              {tick.label}
            </span>
          )
        })}
      </div>
    </div>
  )
}

export type TagTone = 'neutral' | 'accent' | 'good' | 'warn' | 'bad' | 'clay'

const TAG_TONE: Record<TagTone, string> = {
  neutral: 'border-line bg-paper text-ink2',
  accent: 'border-accent/25 bg-accentSoft text-accent',
  good: 'border-good/25 bg-goodSoft text-good',
  warn: 'border-warn/25 bg-warnSoft text-warn',
  bad: 'border-bad/25 bg-badSoft text-bad',
  clay: 'border-clay/25 bg-claySoft text-clay',
}

export function Tag({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode
  tone?: TagTone
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-[4px] border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.06em]',
        TAG_TONE[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

export function InfluenceTag({ influence }: { influence: Influence }) {
  const tone: TagTone = influence === 'modifiable' ? 'accent' : influence === 'mixed' ? 'clay' : 'neutral'
  return <Tag tone={tone}>{influenceLabel(influence)}</Tag>
}

const EVIDENCE_TONE: Record<EvidenceLevel, TagTone> = {
  strong: 'good',
  moderate: 'warn',
  limited: 'neutral',
}

const EVIDENCE_LABEL: Record<EvidenceLevel, string> = {
  strong: 'Strong evidence',
  moderate: 'Moderate evidence',
  limited: 'Limited evidence',
}

export function EvidenceTag({ evidence }: { evidence: EvidenceLevel }) {
  return <Tag tone={EVIDENCE_TONE[evidence]}>{EVIDENCE_LABEL[evidence]}</Tag>
}

export function Stat({
  label,
  value,
  hint,
  className,
}: {
  label: string
  value: ReactNode
  hint?: string
  className?: string
}) {
  return (
    <div className={className}>
      <p className="eyebrow">{label}</p>
      <p className="mt-1 font-mono text-[15px] font-medium text-ink">{value}</p>
      {hint && <p className="mt-1 text-[11px] leading-relaxed text-ink3">{hint}</p>}
    </div>
  )
}
