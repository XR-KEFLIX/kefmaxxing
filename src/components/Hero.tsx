import { useState, type FormEvent } from 'react'
import { ArrowRight, ArrowUp, Lock, MessageSquare } from 'lucide-react'
import { DIMENSIONS, FRAMEWORK_GROUPS } from '../lib/content'

export function Hero({
  onStart,
  onOpenChat,
  onAsk,
}: {
  onStart: () => void
  onOpenChat: () => void
  onAsk: (question: string) => void
}) {
  const [ask, setAsk] = useState('')

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const question = ask.trim()
    if (!question) return
    onAsk(question)
    setAsk('')
  }

  return (
    <section className="border-b border-line">
      <div className="container-page grid gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-16 lg:py-24">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2.5">
            <span className="h-1.5 w-1.5 bg-accent" aria-hidden="true" />
            <p className="eyebrow">Facial aesthetics, measured honestly</p>
          </div>

          <h1 className="mt-6 text-balance font-display text-[clamp(2.8rem,6vw,5rem)] leading-[0.98] tracking-[-0.045em] text-ink">
            Understand your face.{' '}
            <span className="italic text-accent">Improve what you can.</span>
          </h1>

          <p className="mt-6 max-w-xl text-pretty text-[16px] leading-relaxed text-ink2">
            A multi-dimensional facial aesthetics analysis. One photo in, a transparent 10-point read across
            structure, presentation and overall appeal, plus a realistic plan for what you can actually change.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button type="button" onClick={onStart} className="btn btn-primary btn-md">
              Start free analysis
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </button>
            <button type="button" onClick={onOpenChat} className="btn btn-secondary btn-md">
              <MessageSquare className="h-4 w-4" strokeWidth={1.8} />
              Ask Kef
            </button>
          </div>

          <p className="mt-4 flex items-center gap-2 text-[11.5px] leading-relaxed text-ink3">
            <Lock className="h-3.5 w-3.5 text-accent" strokeWidth={1.8} />
            Private by design. Photos are processed once and not stored by this app.
          </p>

          <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-line pt-5">
            <div>
              <dt className="eyebrow">Dimensions</dt>
              <dd className="mt-1 font-mono text-[15px] font-medium text-ink">10</dd>
            </div>
            <div>
              <dt className="eyebrow">Scale</dt>
              <dd className="mt-1 font-mono text-[15px] font-medium text-ink">1.0-10.0</dd>
            </div>
            <div>
              <dt className="eyebrow">Photo storage</dt>
              <dd className="mt-1 font-mono text-[15px] font-medium text-ink">None</dd>
            </div>
          </dl>
        </div>

        <div>
          <div className="card p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
              <div>
                <p className="eyebrow">The assessment</p>
                <h2 className="mt-2 max-w-sm text-[21px] leading-[1.18] tracking-[-0.02em] text-ink">
                  Ten dimensions. Three groups. One transparent score.
                </h2>
              </div>
              <span className="chip shrink-0">weighted</span>
            </div>

            <div>
              {FRAMEWORK_GROUPS.map((group) => (
                <div key={group.key} className="border-b border-line py-4 last:border-b-0">
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="text-[13.5px] font-medium text-ink">{group.label}</p>
                    <span className="font-mono text-[12px] text-ink3">{Math.round(group.weight * 100)}%</span>
                  </div>
                  <p className="mt-1 text-[12px] leading-relaxed text-ink2">{group.description}</p>
                  <div className="mt-2 h-1 bg-sunken">
                    <div className="h-full bg-accent" style={{ width: `${group.weight * 100}%` }} />
                  </div>
                  <p className="mt-2 font-mono text-[10px] uppercase leading-relaxed tracking-[0.07em] text-ink3">
                    {group.keys
                      .map((key) => DIMENSIONS.find((dimension) => dimension.key === key)?.name)
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
              ))}
            </div>

            <form onSubmit={submit} className="pt-5">
              <label htmlFor="hero-ask" className="eyebrow">
                Ask Kef
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id="hero-ask"
                  value={ask}
                  onChange={(event) => setAsk(event.target.value)}
                  placeholder="Ask about facial aesthetics..."
                  maxLength={500}
                  className="field h-10 text-[13px]"
                  autoComplete="off"
                />
                <button
                  type="submit"
                  disabled={!ask.trim()}
                  className="btn btn-primary h-10 w-10 shrink-0 p-0"
                  aria-label="Send question to Kef"
                >
                  <ArrowUp className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-ink3">
                General questions now. Personal answers after a rating.
              </p>
            </form>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1 font-mono text-[10px] uppercase tracking-[0.08em] text-ink3">
            <span>PSL-style index shown separately</span>
            <span>Not medical advice</span>
          </div>
        </div>
      </div>
    </section>
  )
}
