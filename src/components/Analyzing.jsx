import { useEffect, useState } from 'react'
import { Loader2, X } from 'lucide-react'
import { cn } from '../lib/utils'

const PHASES = [
  { title: 'Preparing the image', detail: 'Cleaning it up: size and compression before the model sees it.' },
  { title: 'Reading facial structure', detail: 'Harmony, proportions, eyes, midface, jawline, cheekbones.' },
  { title: 'Assessing presentation', detail: 'Skin, hair, grooming and how the features play together.' },
  { title: 'Checking photo quality', detail: 'Light, angle and clarity, and how much they limit confidence.' },
  { title: 'Writing your report', detail: 'Scores, your strengths, a plan you can follow, and the caveats.' },
]

const PHASE_SECONDS = 6

export function Analyzing({ photo, onCancel }) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const started = Date.now()
    const timer = setInterval(() => setElapsed((Date.now() - started) / 1000), 200)
    return () => clearInterval(timer)
  }, [])

  const phaseIndex = Math.min(PHASES.length - 1, Math.floor(elapsed / PHASE_SECONDS))
  const phase = PHASES[phaseIndex]

  return (
    <section className="container-page py-16 sm:py-20">
      <div className="card overflow-hidden animate-fade-up">
        <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
          <div className="border-b border-line bg-paper p-5 sm:p-7 lg:border-b-0 lg:border-r">
            <div className="flex items-center justify-between gap-3">
              <p className="eyebrow">Photo</p>
              <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-ink3">processed once</span>
            </div>
            <div className="mt-3 overflow-hidden rounded-[6px] border border-line bg-sunken">
              <img src={photo} alt="Photo being analyzed" className="block max-h-[480px] w-full object-contain" />
            </div>
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-sunken">
              <div className="h-full w-1/3 animate-indeterminate rounded-full bg-accent" />
            </div>
            <p className="mt-3 text-[11.5px] leading-relaxed text-ink3">
              The image is sent to the analysis endpoint and is not saved by the app.
            </p>
          </div>

          <div className="p-5 sm:p-7">
            <div className="flex items-center gap-2.5">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" strokeWidth={2} />
              <p className="eyebrow text-accent">Analyzing your photo</p>
            </div>

            <h2 aria-live="polite" className="mt-4 text-[clamp(1.7rem,3vw,2.3rem)] leading-[1.08] tracking-[-0.03em] text-ink">
              {phase.title}
            </h2>
            <p className="mt-2 max-w-lg text-[13.5px] leading-relaxed text-ink2">{phase.detail}</p>

            <ol className="mt-7 space-y-2.5">
              {PHASES.map((item, index) => {
                const done = index < phaseIndex
                const active = index === phaseIndex
                return (
                  <li key={item.title} className={cn('flex items-center gap-3 text-[13px] transition-colors', done ? 'text-ink2' : active ? 'text-ink' : 'text-ink3')}>
                    <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] border font-mono text-[10px]', done ? 'border-accent/30 bg-accentSoft text-accent' : active ? 'border-accent text-accent' : 'border-lineStrong text-ink3')}>
                      {done ? String(index + 1) : index + 1}
                    </span>
                    {item.title}
                    {active && <span className="h-1 w-1 rounded-full bg-accent" aria-hidden="true" />}
                  </li>
                )
              })}
            </ol>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
              <div>
                <p className="font-mono text-[12px] text-ink2">{elapsed.toFixed(0)}s elapsed</p>
                <p className="mt-0.5 text-[11px] text-ink3">Usually 20-60 seconds.</p>
              </div>
              <button type="button" onClick={onCancel} className="btn btn-secondary btn-sm">
                <X className="h-3.5 w-3.5" strokeWidth={2} />
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
