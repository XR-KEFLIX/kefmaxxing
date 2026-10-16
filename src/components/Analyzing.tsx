import { useEffect, useState } from 'react'
import { Loader2, X } from 'lucide-react'
import { cn } from '../lib/utils'

interface Phase {
  title: string
  label: string
  region: string
  zoom: number
  origin: string
}

const PHASES: Phase[] = [
  { title: 'analysing looks...', label: 'uploading photo', region: 'whole face', zoom: 1.04, origin: '50% 42%' },
  { title: 'detecting facial landmarks...', label: 'detecting facial landmarks', region: 'landmarks', zoom: 1.18, origin: '50% 36%' },
  { title: 'calculating angularity...', label: 'measuring angles', region: 'jawline', zoom: 1.3, origin: '50% 76%' },
  { title: 'measuring midface ratios...', label: 'checking proportions', region: 'midface', zoom: 1.34, origin: '50% 56%' },
  { title: 'scoring the eye area...', label: 'grading the eight features', region: 'eye area', zoom: 1.22, origin: '50% 34%' },
  { title: 'checking it against the standards...', label: 'cross-checking the standards', region: 'whole face', zoom: 1.08, origin: '50% 50%' },
  { title: 'writing your plan...', label: 'writing your game plan', region: 'done', zoom: 1.0, origin: '50% 50%' },
]

const PHASE_SECONDS = 3

export function Analyzing({ photo, onCancel }: { photo: string; onCancel: () => void }) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const started = Date.now()
    const t = setInterval(() => setElapsed((Date.now() - started) / 1000), 200)
    return () => clearInterval(t)
  }, [])

  const phaseIndex = Math.min(PHASES.length - 1, Math.floor(elapsed / PHASE_SECONDS))
  const phase = PHASES[phaseIndex]

  return (
    <section className="animate-fade-up">
      <div className="card overflow-hidden p-6 sm:p-8">
        <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-center">
          <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-[12px] border border-border-strong bg-bg">
            <img
              src={photo}
              alt="Photo being analyzed"
              className="block max-h-[430px] w-full object-contain will-change-transform"
              style={{
                transform: `scale(${phase.zoom})`,
                transformOrigin: phase.origin,
                transition:
                  'transform 1400ms cubic-bezier(0.22, 1, 0.36, 1), transform-origin 1400ms cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            />
            <div className="pointer-events-none absolute inset-0">
              <span className="scanline" />
            </div>
            <div className="pointer-events-none absolute inset-0">
              <span className="absolute left-3 top-3 h-4 w-4 border-l border-t border-gold" />
              <span className="absolute right-3 top-3 h-4 w-4 border-r border-t border-gold" />
              <span className="absolute bottom-3 left-3 h-4 w-4 border-b border-l border-gold" />
              <span className="absolute bottom-3 right-3 h-4 w-4 border-b border-r border-gold" />
            </div>
            <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2">
              <span
                key={phase.region}
                className="animate-fade-in inline-block rounded-md border border-gold/30 bg-bg/85 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-gold"
              >
                {phase.region}
              </span>
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2.5">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-gold" strokeWidth={2} />
              <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-gold">rating in progress</p>
            </div>
            <h2 key={phase.title} className="animate-fade-up text-2xl font-semibold tracking-[-0.02em]">
              {phase.title}
            </h2>
            <p className="mt-2.5 max-w-md text-[13.5px] leading-relaxed text-secondary">
              It measures landmarks, angles and proportions, then determines what's holding your score back. It takes
              20-40 seconds. Do not refresh.
            </p>

            <ol className="mt-7 space-y-2.5">
              {PHASES.map((item, i) => (
                <li
                  key={item.label}
                  className={cn(
                    'flex items-center gap-3 text-[13px] transition-colors',
                    i < phaseIndex ? 'text-secondary' : i === phaseIndex ? 'text-primary' : 'text-faint',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-5 w-5 items-center justify-center rounded-md border font-mono text-[10px]',
                      i < phaseIndex
                        ? 'border-gold/35 bg-gold/10 text-gold'
                        : i === phaseIndex
                          ? 'border-gold text-gold'
                          : 'border-border-strong text-faint',
                    )}
                  >
                    {i < phaseIndex ? '✓' : i + 1}
                  </span>
                  {item.label}
                  {i === phaseIndex && <span className="h-1 w-1 animate-pulse-soft rounded-full bg-gold" />}
                </li>
              ))}
            </ol>

            <div className="mt-8 flex items-center justify-between">
              <span className="font-mono text-[12px] text-faint">{elapsed.toFixed(0)}s elapsed</span>
              <button type="button" onClick={onCancel} className="btn-ghost h-8 px-3.5 text-[12.5px]">
                <X className="h-3.5 w-3.5" strokeWidth={2} />
                cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
