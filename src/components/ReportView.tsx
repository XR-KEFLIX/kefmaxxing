import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Check, Copy, Info, RotateCcw } from 'lucide-react'
import { cn, formatScore, pslColor, scoreColor } from '../lib/utils'
import type { RatingReport } from '../lib/types'

interface Props {
  report: RatingReport
  photo: string
  onReset: () => void
}

export function ReportView({ report, photo, onReset }: Props) {
  return (
    <section id="report" className="scroll-mt-20 animate-fade-up">
      <ScoreHeader report={report} photo={photo} onReset={onReset} />
      <CategoryGrid report={report} />
      <HaloFalo report={report} />
      <Plan report={report} />
      <Roadmap report={report} />
      {report.photoNotes && (
        <div className="mt-6 flex items-start gap-3 rounded-[10px] border border-border bg-bg/60 px-5 py-4 animate-fade-up">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.7} />
          <p className="text-[12.5px] leading-relaxed text-secondary">
            <span className="font-medium text-primary">about your photo: </span>
            {report.photoNotes}
          </p>
        </div>
      )}
    </section>
  )
}

function ScoreHeader({ report, photo, onReset }: Props) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    const lines = [
      `kefmaxxing: PSL ${formatScore(report.overall)}/8, ${report.subTier || report.tier} (${report.tierLabel})`,
      `your potential: PSL ${formatScore(report.potential)}/8`,
      report.percentile ? `percentile: ${report.percentile}` : '',
      '',
      report.summary,
      report.ascension ? `\nhow to close the gap:\n${report.ascension}` : '',
      '',
      'top moves:',
      ...report.plan
        .slice(0, 3)
        .map((p) => `${p.rank}. ${p.action} (${p.impact} impact, ${p.evidence} evidence${p.timeframe ? `, ${p.timeframe}` : ''})`),
    ].filter(Boolean)
    try {
      await navigator.clipboard.writeText(lines.join('\n'))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard denied, nothing to do */
    }
  }

  return (
    <div className="card overflow-hidden">
      <div className="grid gap-8 p-6 sm:p-8 md:grid-cols-[auto_1fr]">
        <div className="flex items-center gap-7 md:flex-col md:items-start">
          <ScoreRing score={report.overall} />
          <figure className="flex items-center gap-3">
            <img
              src={photo}
              alt="Rated photo"
              className="h-16 w-16 rounded-[10px] border border-border object-cover md:h-20 md:w-20"
            />
            <figcaption className="label leading-[1.6]">
              rated
              <br />
              photo
            </figcaption>
          </figure>
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-gold px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-black">
              {report.subTier || report.tier}
            </span>
            <span className="chip">{report.tierLabel}</span>
            {report.archetype && <span className="chip">reads: {report.archetype}</span>}
            {report.percentile && <span className="chip">{report.percentile}</span>}
            <span className="chip">confidence {Math.round(report.confidence * 100)}%</span>
          </div>

          <p className="mt-5 text-[15px] leading-relaxed text-primary">{report.summary}</p>

          <div className="mt-6 rounded-[10px] border border-border bg-bg/60 p-5">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
              <div>
                <p className="label">now</p>
                <p className="mt-1 font-mono text-[22px] font-semibold leading-none" style={{ color: pslColor(report.overall) }}>
                  {formatScore(report.overall)}
                  <span className="ml-1 text-[12px] font-normal text-faint">/8</span>
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-faint" />
              <div>
                <p className="label">potential</p>
                <p className="mt-1 font-mono text-[22px] font-semibold leading-none text-gold">
                  {formatScore(report.potential)}
                  <span className="ml-1 text-[12px] font-normal text-faint">/8</span>
                </p>
              </div>
              <p className="max-w-[220px] text-[11px] leading-relaxed text-faint">
                potential = what you can realistically reach without surgery.
              </p>
            </div>
            {report.ascension && (
              <p className="mt-4 border-t border-border pt-4 text-[13px] leading-relaxed text-secondary">
                {report.ascension}
              </p>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button type="button" onClick={copy} className="btn-ghost h-9 px-4 text-[12.5px]">
              {copied ? (
                <Check className="h-3.5 w-3.5 text-good" strokeWidth={2} />
              ) : (
                <Copy className="h-3.5 w-3.5" strokeWidth={1.7} />
              )}
              {copied ? 'copied' : 'copy result'}
            </button>
            <button type="button" onClick={onReset} className="btn-primary h-9 px-4 text-[12.5px] font-semibold">
              <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} />
              rate another photo
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ScoreRing({ score }: { score: number }) {
  const size = 152
  const stroke = 9
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const [offset, setOffset] = useState(circumference)
  const color = useMemo(() => pslColor(score), [score])

  useEffect(() => {
    const t = setTimeout(() => setOffset(circumference * (1 - score / 8)), 120)
    return () => clearTimeout(t)
  }, [circumference, score])

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 1.4s cubic-bezier(0.2, 0.8, 0.2, 1), stroke 600ms ease',
            filter: `drop-shadow(0 0 12px ${color}33)`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-[34px] font-semibold tracking-[-0.02em]" style={{ color }}>
          {formatScore(score)}
        </span>
        <span className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-faint">psl /8</span>
      </div>
    </div>
  )
}

function CategoryGrid({ report }: { report: RatingReport }) {
  return (
    <div className="card mt-6 overflow-hidden animate-fade-up">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <h2 className="label text-secondary">feature grades</h2>
        <span className="label hidden sm:block">5.0 = average</span>
      </div>
      <ul className="divide-y divide-border">
        {report.categories.map((cat, i) => (
          <li
            key={cat.key}
            className="animate-fade-up px-6 py-4"
            style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'backwards' }}
          >
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-[13.5px] font-medium">{cat.name}</span>
              <span className="font-mono text-[14px] font-semibold" style={{ color: scoreColor(cat.score) }}>
                {formatScore(cat.score)}
              </span>
            </div>
            <div className="mt-2.5 flex items-center gap-5">
              <Meter score={cat.score} className="w-32 shrink-0 sm:w-52" />
              <p className="min-w-0 flex-1 text-[12.5px] leading-relaxed text-secondary">{cat.note}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Meter({ score, className }: { score: number; className?: string }) {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setWidth(score * 10), 150)
    return () => clearTimeout(t)
  }, [score])

  return (
    <div className={cn('relative h-[5px] overflow-hidden rounded-full bg-white/[0.06]', className)}>
      <div
        className="meter h-full rounded-full"
        style={{ width: `${width}%`, backgroundColor: scoreColor(score), opacity: 0.9 }}
      />
      <span className="absolute inset-y-0 left-1/2 w-px bg-white/20" />
    </div>
  )
}

function HaloFalo({ report }: { report: RatingReport }) {
  return (
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      <div className="card p-6 animate-fade-up">
        <div className="mb-5 flex items-center gap-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-good" />
          <h3 className="label text-secondary">what's working</h3>
        </div>
        <ul className="space-y-4">
          {report.halos.map((item) => (
            <li key={item.name}>
              <p className="text-[13.5px] font-medium text-primary">{item.name}</p>
              <p className="mt-0.5 text-[12.5px] leading-relaxed text-secondary">{item.note}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="card p-6 animate-fade-up">
        <div className="mb-5 flex items-center gap-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-warn" />
          <h3 className="label text-secondary">what's costing you</h3>
        </div>
        <ul className="space-y-4">
          {report.failos.map((item) => (
            <li key={item.name}>
              <p className="text-[13.5px] font-medium text-primary">{item.name}</p>
              <p className="mt-0.5 text-[12.5px] leading-relaxed text-secondary">{item.note}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

const EVIDENCE_STYLE: Record<string, string> = {
  strong: 'border-good/25 bg-good/[0.08] text-good',
  moderate: 'border-warn/25 bg-warn/[0.08] text-warn',
  anecdotal: 'border-border-strong bg-elevated text-faint',
}

function Plan({ report }: { report: RatingReport }) {
  return (
    <div className="card mt-6 overflow-hidden animate-fade-up">
      <div className="border-b border-border px-6 py-5">
        <h2 className="text-[14.5px] font-semibold">what to fix first</h2>
        <p className="mt-1 text-[12.5px] leading-relaxed text-secondary">
          Ranked by impact, top to bottom. The tags show how solid the evidence is. Work down the list.
        </p>
      </div>
      <ol className="divide-y divide-border">
        {report.plan.map((item) => (
          <li key={item.rank} className="flex gap-5 px-6 py-5">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-gold/30 bg-gold/10 font-mono text-[11px] font-semibold text-gold">
              {item.rank}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[14px] font-medium">{item.action}</p>
                <span
                  className={cn(
                    'rounded-md border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em]',
                    item.impact === 'High'
                      ? 'border-gold/35 bg-gold/[0.08] text-gold'
                      : 'border-border-strong bg-elevated text-faint',
                  )}
                >
                  {item.impact} impact
                </span>
                <span
                  className={cn(
                    'rounded-md border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em]',
                    EVIDENCE_STYLE[item.evidence] ?? EVIDENCE_STYLE.moderate,
                  )}
                >
                  {item.evidence} evidence
                </span>
                {item.timeframe && (
                  <span className="rounded-md border border-border-strong bg-elevated px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-faint">
                    {item.timeframe}
                  </span>
                )}
              </div>
              {item.detail && <p className="mt-1.5 text-[12.5px] leading-relaxed text-secondary">{item.detail}</p>}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

function Roadmap({ report }: { report: RatingReport }) {
  if (!report.roadmap || report.roadmap.length === 0) return null

  return (
    <div className="card mt-6 overflow-hidden animate-fade-up">
      <div className="border-b border-border px-6 py-5">
        <h2 className="text-[14.5px] font-semibold">how you get there</h2>
        <p className="mt-1 text-[12.5px] leading-relaxed text-secondary">
          Phase by phase, in order. This is the path from your score today to your potential.
        </p>
      </div>
      <ol className="divide-y divide-border">
        {report.roadmap.map((phase, i) => (
          <li key={`${phase.phase}-${i}`} className="px-6 py-5">
            <div className="flex items-center gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-gold/30 bg-gold/10 font-mono text-[11px] font-semibold text-gold">
                {i + 1}
              </span>
              <p className="text-[14px] font-medium">{phase.phase}</p>
            </div>
            {phase.focus && <p className="mt-2.5 text-[12.5px] leading-relaxed text-secondary">{phase.focus}</p>}
            {phase.actions.length > 0 && (
              <ul className="mt-3 space-y-2">
                {phase.actions.map((action) => (
                  <li key={action} className="flex gap-2.5 text-[12.5px] leading-relaxed text-secondary">
                    <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-gold/70" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </div>
  )
}
