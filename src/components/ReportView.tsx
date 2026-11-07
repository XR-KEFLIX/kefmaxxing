import {
  AlertCircle,
  Check,
  Copy,
  Dna,
  Droplets,
  Info,
  MessageSquare,
  RotateCcw,
  Scissors,
  Sparkles,
  TrendingUp,
  UserRound,
  X,
} from 'lucide-react'
import { FRAMEWORK_GROUPS } from '../lib/content'
import { cn, formatScore, formatWeight, levelLabel, scoreHex, titleCase } from '../lib/utils'
import { useCopy } from '../lib/useCopy'
import type { RatingReport } from '../lib/types'
import {
  EvidenceTag,
  InfluenceTag,
  Meter,
  ScoreScale,
  SectionHeading,
  Stat,
  Tag,
} from './ui'

interface Props {
  report: RatingReport
  photo: string
  onReset: () => void
  onOpenChat: (seed?: string) => void
}

export function ReportView({ report, photo, onReset, onOpenChat }: Props) {
  return (
    <section id="report" className="container-page scroll-mt-20 py-16 sm:py-20">
      <SectionHeading
        index="02"
        eyebrow="Report"
        title="Your facial analysis"
        description="A weighted read from one photo. The overall is a composite of ten dimensions, with holistic appeal kept as its own input."
      />

      <div className="mt-8 space-y-6">
        <ScoreSummary report={report} photo={photo} onReset={onReset} onOpenChat={onOpenChat} />
        <ScoreMethodNote />
        <DimensionLedger report={report} />
        <InsightCards report={report} />
        <DetailedAnalysis report={report} />
        <Recommendations report={report} />
        <Plan report={report} />
        <Roadmap report={report} />
        <Genetics report={report} />
        <PhotoNotes report={report} />
        <ChatCta onOpenChat={onOpenChat} />
      </div>
    </section>
  )
}

function ScoreSummary({
  report,
  photo,
  onReset,
  onOpenChat,
}: {
  report: RatingReport
  photo: string
  onReset: () => void
  onOpenChat: (seed?: string) => void
}) {
  const { copied, copy } = useCopy()
  const confidence = Math.round(report.confidence * 100)

  const copySummary = () => {
    const lines = [
      `Kefmaxxing report: ${formatScore(report.overall)}/10 (${report.band}, ${levelLabel(report.level)})`,
      `Potential: ${formatScore(report.potential)}/10`,
      `Structural index (PSL-style, secondary): ${formatScore(report.structuralIndex)}/10`,
      `Overall appeal: ${formatScore(report.appealIndex)}/10`,
      '',
      report.summary,
      '',
      `Strengths: ${report.strengths.map((item) => item.name).join(', ')}`,
      `Improvements: ${report.improvements.map((item) => item.name).join(', ')}`,
      '',
      'Top plan:',
      ...report.plan.slice(0, 3).map((item) => `${item.rank}. ${item.action} (${item.impact} impact, ${item.timeframe})`),
      '',
      'Single-photo estimate. Not medical advice.',
    ]
    void copy(lines.join('\n'))
  }

  return (
    <div className="card overflow-hidden animate-fade-up">
      <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
        <div className="p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="eyebrow">Overall assessment</p>
            <Tag tone="neutral">Confidence {confidence}%</Tag>
          </div>

          <div className="mt-5 flex flex-wrap items-end gap-x-4 gap-y-2">
            <span className="font-mono text-[64px] leading-none tracking-[-0.06em] text-ink sm:text-[76px]">
              {formatScore(report.overall)}
            </span>
            <span className="mb-2 font-mono text-[14px] text-ink3">/ 10</span>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Tag tone="accent">{report.band}</Tag>
              <Tag tone="neutral">{levelLabel(report.level)}</Tag>
            </div>
          </div>

          <div className="mt-5">
            <ScoreScale value={report.overall} potential={report.potential} />
          </div>

          <p className="mt-4 text-[12.5px] leading-relaxed text-ink2">{report.bandNote}</p>
          <p className="mt-5 text-[14.5px] leading-relaxed text-ink">{report.summary}</p>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => onOpenChat('What should I improve first?')} className="btn btn-primary btn-sm">
              <MessageSquare className="h-3.5 w-3.5" strokeWidth={1.8} />
              Ask Kef about this report
            </button>
            <button type="button" onClick={copySummary} className="btn btn-secondary btn-sm">
              {copied ? <Check className="h-3.5 w-3.5 text-good" strokeWidth={2} /> : <Copy className="h-3.5 w-3.5" strokeWidth={1.8} />}
              {copied ? 'Copied' : 'Copy summary'}
            </button>
            <button type="button" onClick={onReset} className="btn btn-ghost btn-sm">
              <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.8} />
              New analysis
            </button>
          </div>
        </div>

        <div className="border-t border-line p-5 sm:p-7 lg:border-l lg:border-t-0">
          <dl className="grid grid-cols-2 gap-x-5 gap-y-5">
            <Stat label="Potential" value={`${formatScore(report.potential)} / 10`} hint="Realistic non-surgical range" />
            <Stat
              label="Structural index"
              value={`${formatScore(report.structuralIndex)} / 10`}
              hint="PSL-style, secondary"
            />
            <Stat label="Overall appeal" value={`${formatScore(report.appealIndex)} / 10`} hint="Holistic impression" />
            <Stat label="Confidence" value={`${confidence}%`} hint="Single-photo estimate" />
          </dl>

          <div className="mt-6 border-t border-line pt-5">
            <p className="eyebrow">Reads as</p>
            <p className="mt-1.5 font-display text-[20px] capitalize leading-tight text-ink">{report.archetype}</p>
            <p className="mt-1 text-[12px] leading-relaxed text-ink3">
              Face shape: <span className="capitalize text-ink2">{report.faceShape}</span>. Descriptive, not a label.
            </p>
          </div>

          <figure className="mt-6 flex items-center gap-3 border-t border-line pt-5">
            <img
              src={photo}
              alt="Rated photo"
              className="h-16 w-16 rounded-[4px] border border-line object-cover"
            />
            <figcaption className="text-[11.5px] leading-relaxed text-ink3">
              Rated photo
              <br />
              Processed once, not stored
            </figcaption>
          </figure>
        </div>
      </div>
    </div>
  )
}

function ScoreMethodNote() {
  return (
    <div className="card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">How the score is built</p>
          <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-ink2">
            The overall is a weighted composite, not an equal average. Structure carries 59%, presentation 23%, and
            the holistic appeal score 18%. The PSL-style structural index is shown separately and does not drive the
            headline score.
          </p>
        </div>
        <a href="#method" className="btn btn-ghost btn-sm shrink-0">
          Read the method
        </a>
      </div>

      <div className="mt-5 flex h-2 overflow-hidden rounded-full bg-sunken">
        {FRAMEWORK_GROUPS.map((group) => (
          <div
            key={group.key}
            className={cn(
              'h-full',
              group.key === 'structure' ? 'bg-accent' : group.key === 'presentation' ? 'bg-clay' : 'bg-ink3',
            )}
            style={{ width: `${group.weight * 100}%` }}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
        {FRAMEWORK_GROUPS.map((group) => (
          <span key={group.key} className="inline-flex items-center gap-2 font-mono text-[10.5px] text-ink3">
            <span
              className={cn(
                'h-2 w-2 rounded-full',
                group.key === 'structure' ? 'bg-accent' : group.key === 'presentation' ? 'bg-clay' : 'bg-ink3',
              )}
            />
            {group.label} {formatWeight(group.weight)}
          </span>
        ))}
      </div>
    </div>
  )
}

function DimensionLedger({ report }: { report: RatingReport }) {
  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
        <div>
          <h3 className="text-[15px] font-medium text-ink">Dimension ledger</h3>
          <p className="mt-0.5 text-[12px] text-ink2">Every score, its weight, and the note behind it.</p>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink3">5.0 = population average</span>
      </div>

      {FRAMEWORK_GROUPS.map((group) => {
        const items = report.categories.filter((category) => category.group === group.key)
        if (!items.length) return null
        return (
          <div key={group.key}>
            <div className="border-b border-line bg-paper px-5 py-3 sm:px-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-[12px] font-medium text-ink">{group.label}</p>
                <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-ink3">
                  {formatWeight(group.weight)} of overall
                </span>
              </div>
              <p className="mt-0.5 text-[11.5px] leading-relaxed text-ink2">{group.description}</p>
            </div>
            <ul className="divide-y divide-line">
              {items.map((category) => (
                <li key={category.key} className="px-5 py-5 sm:px-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[14px] font-medium text-ink">{category.name}</p>
                        <InfluenceTag influence={category.influence} />
                      </div>
                      <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-ink3">
                        Weight {formatWeight(category.weight)} · contributes {formatScore(category.score * category.weight)} pts
                      </p>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-mono text-[22px] font-semibold" style={{ color: scoreHex(category.score) }}>
                        {formatScore(category.score)}
                      </span>
                      <span className="font-mono text-[10px] text-ink3">/10</span>
                    </div>
                  </div>
                  <Meter score={category.score} className="mt-3" />
                  <p className="mt-2 text-[12.5px] leading-relaxed text-ink2">
                    {category.note || 'No note was returned for this dimension.'}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}

function InsightCards({ report }: { report: RatingReport }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="card p-5 sm:p-6">
        <div className="flex items-center gap-2.5">
          <TrendingUp className="h-4 w-4 text-good" strokeWidth={1.8} />
          <h3 className="text-[15px] font-medium text-ink">What is working</h3>
        </div>
        <ul className="mt-4 space-y-4">
          {report.strengths.map((item) => (
            <li key={`${item.category}-${item.name}`}>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[13.5px] font-medium text-ink">{item.name}</p>
                <InfluenceTag influence={item.influence} />
              </div>
              <p className="mt-1 text-[12.5px] leading-relaxed text-ink2">{item.note}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="card p-5 sm:p-6">
        <div className="flex items-center gap-2.5">
          <AlertCircle className="h-4 w-4 text-clay" strokeWidth={1.8} />
          <h3 className="text-[15px] font-medium text-ink">What is holding the read back</h3>
        </div>
        <ul className="mt-4 space-y-4">
          {report.improvements.map((item) => (
            <li key={`${item.category}-${item.name}`}>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[13.5px] font-medium text-ink">{item.name}</p>
                <InfluenceTag influence={item.influence} />
              </div>
              <p className="mt-1 text-[12.5px] leading-relaxed text-ink2">{item.note}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function DetailedAnalysis({ report }: { report: RatingReport }) {
  return (
    <div className="card p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-[15px] font-medium text-ink">The detailed read</h3>
        <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink3">
          {titleCase(report.band)} · {levelLabel(report.level)}
        </span>
      </div>
      <p className="mt-4 text-[14px] leading-[1.75] text-ink2 first-letter:float-left first-letter:mr-2 first-letter:font-display first-letter:text-[44px] first-letter:leading-[0.78] first-letter:text-accent">
        {report.analysis}
      </p>
    </div>
  )
}

function Recommendations({ report }: { report: RatingReport }) {
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Recommendations</p>
          <h3 className="mt-1 text-[22px] leading-tight tracking-[-0.02em] text-ink">What to do with the read</h3>
        </div>
        <p className="max-w-md text-[12px] leading-relaxed text-ink3">
          General cosmetic guidance, not medical advice. Hair type, skin condition and personal preference matter.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <HairCard report={report} />
        <SkincareCard report={report} />
        <GroomingCard report={report} />
      </div>
    </div>
  )
}

function HairCard({ report }: { report: RatingReport }) {
  return (
    <div className="card p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-[5px] border border-line bg-paper">
            <Scissors className="h-4 w-4 text-accent" strokeWidth={1.8} />
          </span>
          <h4 className="text-[14px] font-medium text-ink">Hair</h4>
        </div>
        <Tag tone="neutral">Face shape: {report.hair.faceShape}</Tag>
      </div>

      <p className="mt-4 text-[12.5px] leading-relaxed text-ink2">{report.hair.direction}</p>

      <div className="mt-4">
        <p className="eyebrow">Try</p>
        <ul className="mt-2 space-y-1.5">
          {report.hair.styles.map((style) => (
            <li key={style} className="flex gap-2 text-[12.5px] leading-relaxed text-ink2">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-good" strokeWidth={2} />
              {style}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <p className="eyebrow">Avoid</p>
        <ul className="mt-2 space-y-1.5">
          {report.hair.avoid.map((style) => (
            <li key={style} className="flex gap-2 text-[12.5px] leading-relaxed text-ink2">
              <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-clay" strokeWidth={2} />
              {style}
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-4 border-t border-line pt-3 text-[11px] leading-relaxed text-ink3">{report.hair.note}</p>
    </div>
  )
}

function SkincareCard({ report }: { report: RatingReport }) {
  return (
    <div className="card p-5 sm:p-6">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-[5px] border border-line bg-paper">
          <Droplets className="h-4 w-4 text-accent" strokeWidth={1.8} />
        </span>
        <h4 className="text-[14px] font-medium text-ink">Skin</h4>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="eyebrow">AM</p>
          <ul className="mt-2 space-y-1.5">
            {report.skincare.am.map((step) => (
              <li key={step} className="text-[12px] leading-relaxed text-ink2">
                {step}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow">PM</p>
          <ul className="mt-2 space-y-1.5">
            {report.skincare.pm.map((step) => (
              <li key={step} className="text-[12px] leading-relaxed text-ink2">
                {step}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {report.skincare.ingredients.map((ingredient) => (
          <Tag key={ingredient} tone="accent">
            {ingredient}
          </Tag>
        ))}
      </div>

      <p className="mt-4 border-t border-line pt-3 text-[11px] leading-relaxed text-ink3">{report.skincare.note}</p>
    </div>
  )
}

function GroomingCard({ report }: { report: RatingReport }) {
  return (
    <div className="card p-5 sm:p-6">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-[5px] border border-line bg-paper">
          <UserRound className="h-4 w-4 text-accent" strokeWidth={1.8} />
        </span>
        <h4 className="text-[14px] font-medium text-ink">Grooming</h4>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <p className="eyebrow">Brows</p>
          <p className="mt-1 text-[12px] leading-relaxed text-ink2">{report.grooming.brows}</p>
        </div>
        <div>
          <p className="eyebrow">Facial hair</p>
          <p className="mt-1 text-[12px] leading-relaxed text-ink2">{report.grooming.facialHair}</p>
        </div>
      </div>

      <ul className="mt-4 space-y-1.5">
        {report.grooming.general.map((item) => (
          <li key={item} className="flex gap-2 text-[12px] leading-relaxed text-ink2">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-good" strokeWidth={2} />
            {item}
          </li>
        ))}
      </ul>

      <p className="mt-4 border-t border-line pt-3 text-[11px] leading-relaxed text-ink3">{report.grooming.note}</p>
    </div>
  )
}

function Plan({ report }: { report: RatingReport }) {
  const { copied, copy } = useCopy()

  const copyPlan = () => {
    const text = report.plan
      .map(
        (item) =>
          `${item.rank}. ${item.action} (${item.impact} impact, ${item.effort} effort, ${item.timeframe || 'no timeframe'}): ${item.detail}`,
      )
      .join('\n')
    void copy(text)
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
        <div>
          <h3 className="text-[15px] font-medium text-ink">Prioritised plan</h3>
          <p className="mt-1 max-w-2xl text-[12px] leading-relaxed text-ink2">
            Ranked by realistic impact. Every step is a presentation or lifestyle lever. None of it changes bone
            structure.
          </p>
        </div>
        <button type="button" onClick={copyPlan} className="btn btn-secondary btn-sm shrink-0">
          {copied ? <Check className="h-3.5 w-3.5 text-good" strokeWidth={2} /> : <Copy className="h-3.5 w-3.5" strokeWidth={1.8} />}
          {copied ? 'Copied' : 'Copy plan'}
        </button>
      </div>

      <ol className="divide-y divide-line">
        {report.plan.map((item) => (
          <li key={item.rank} className="px-5 py-5 sm:px-6">
            <div className="flex gap-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[4px] border border-accent/30 bg-accentSoft font-mono text-[11px] font-semibold text-accent">
                {item.rank}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[14px] font-medium text-ink">{item.action}</p>
                  <Tag tone="clay">{titleCase(item.category)}</Tag>
                  <Tag tone={item.impact === 'High' ? 'accent' : 'neutral'}>{item.impact} impact</Tag>
                  <Tag tone="neutral">{item.effort} effort</Tag>
                  <EvidenceTag evidence={item.evidence} />
                  {item.timeframe && <Tag tone="neutral">{item.timeframe}</Tag>}
                </div>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink2">{item.detail}</p>
                {item.addresses && (
                  <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.06em] text-ink3">
                    Addresses: {item.addresses}
                  </p>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

function Roadmap({ report }: { report: RatingReport }) {
  if (!report.roadmap.length) return null

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-line px-5 py-4 sm:px-6">
        <h3 className="text-[15px] font-medium text-ink">Roadmap</h3>
        <p className="mt-1 text-[12px] leading-relaxed text-ink2">The order to work through it. Keep the phases sequential.</p>
      </div>
      <div className="grid divide-y divide-line md:grid-cols-3 md:divide-x md:divide-y-0">
        {report.roadmap.map((phase, index) => (
          <div key={`${phase.phase}-${index}`} className="border-t-2 border-accent px-5 py-5 sm:px-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink3">Phase {index + 1}</p>
            <p className="mt-1 text-[14px] font-medium text-ink">{phase.phase}</p>
            {phase.focus && <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink2">{phase.focus}</p>}
            {phase.actions.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {phase.actions.map((action) => (
                  <li key={action} className="flex gap-2 text-[12px] leading-relaxed text-ink2">
                    <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent" />
                    {action}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function Genetics({ report }: { report: RatingReport }) {
  return (
    <div className="card p-5 sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Genetics vs changeable</p>
          <h3 className="mt-1 text-[22px] leading-tight tracking-[-0.02em] text-ink">What you can change, and what you cannot</h3>
        </div>
        <p className="max-w-md text-[12px] leading-relaxed text-ink3">
          Bone structure is largely fixed after growth. Presentation is where most realistic change happens.
        </p>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div className="rounded-[6px] border border-line bg-paper p-4">
          <div className="flex items-center gap-2">
            <Dna className="h-4 w-4 text-ink2" strokeWidth={1.8} />
            <p className="text-[13px] font-medium text-ink">Largely fixed</p>
          </div>
          <ul className="mt-3 space-y-2">
            {report.geneticVsModifiable.genetic.map((item) => (
              <li key={item} className="flex gap-2 text-[12.5px] leading-relaxed text-ink2">
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-ink3" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[6px] border border-accent/20 bg-accentSoft p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" strokeWidth={1.8} />
            <p className="text-[13px] font-medium text-ink">Realistically changeable</p>
          </div>
          <ul className="mt-3 space-y-2">
            {report.geneticVsModifiable.modifiable.map((item) => (
              <li key={item} className="flex gap-2 text-[12.5px] leading-relaxed text-ink2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" strokeWidth={2} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="mt-4 text-[12px] leading-relaxed text-ink2">{report.geneticVsModifiable.note}</p>
    </div>
  )
}

function PhotoNotes({ report }: { report: RatingReport }) {
  return (
    <div className="card p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={1.8} />
        <div>
          <p className="text-[13px] font-medium text-ink">About this photo and this score</p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-ink2">{report.photoNotes}</p>
          <p className="mt-2 text-[12px] leading-relaxed text-ink3">
            Single-photo estimate. Lighting, lens, angle and filters can shift the read. No percentile is shown because
            a single photo cannot establish a true population percentile. Not medical advice.
          </p>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-1.5 w-32 overflow-hidden rounded-full bg-sunken">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${Math.round(report.confidence * 100)}%` }}
              />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-ink3">
              Confidence {Math.round(report.confidence * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ChatCta({ onOpenChat }: { onOpenChat: (seed?: string) => void }) {
  return (
    <div className="rounded-card bg-accent p-6 sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-onAccent/80">Ask Kef</p>
          <h3 className="mt-2 font-display text-[26px] leading-tight tracking-[-0.02em] text-onAccent">
            Have a question about your report?
          </h3>
          <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-onAccent/80">
            Ask about a score, your plan, hair, skin, grooming or what is genetic. The assistant has this report in
            front of it.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onOpenChat()}
          className="btn btn-md shrink-0 bg-white text-accent hover:bg-accentSoft"
        >
          <MessageSquare className="h-4 w-4" strokeWidth={1.8} />
          Ask Kef
        </button>
      </div>
    </div>
  )
}
