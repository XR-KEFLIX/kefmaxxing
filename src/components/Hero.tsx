import { useState, lazy, Suspense, type FormEvent } from 'react'
import { ArrowRight, ArrowUp, Lock, MessageSquare } from 'lucide-react'
import { DIMENSIONS, FRAMEWORK_GROUPS } from '../lib/content'

const BlackPill3D = lazy(() =>
  import('./BlackPill3D').then((module) => ({ default: module.BlackPill3D })),
)

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
      <div className="container-page grid gap-10 py-10 sm:py-14 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-12 lg:py-16 xl:gap-16">
        <div className="min-w-0">
          <Suspense fallback={<div className="h-28 w-28 sm:h-32 sm:w-32 lg:h-36 lg:w-36" />}>
            <BlackPill3D className="-ml-2 h-28 w-28 select-none sm:h-32 sm:w-32 lg:h-36 lg:w-36" />
          </Suspense>

          <div className="mt-4 flex items-center gap-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
            <p className="eyebrow">An honest assessment of your facial features</p>
          </div>

          <h1 className="mt-4 max-w-2xl text-balance font-display text-[clamp(2.4rem,7.5vw,4.4rem)] leading-[1.02] tracking-[-0.035em] text-ink">
            See how your features compare,{' '}
            <span className="italic text-accent">and where to improve.</span>
          </h1>

          <p className="mt-5 max-w-xl text-pretty text-[15px] leading-relaxed text-ink2 sm:text-[16px]">
            One photo in, and you get a 10-point read across structure, skin, hair and grooming, plus a clear plan
            for the parts you can actually change.
          </p>

          <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            <button type="button" onClick={onStart} className="btn btn-primary btn-md h-12 sm:h-11">
              Analyze my photo
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </button>
            <button type="button" onClick={onOpenChat} className="btn btn-secondary btn-md h-12 sm:h-11">
              <MessageSquare className="h-4 w-4" strokeWidth={1.8} />
              Ask Kef
            </button>
          </div>

          <p className="mt-4 flex items-center gap-2 text-[11.5px] leading-relaxed text-ink3">
            <Lock className="h-3.5 w-3.5 text-accent" strokeWidth={1.8} />
            Analysed once. Never stored.
          </p>

          <dl className="mt-8 grid max-w-lg grid-cols-3 gap-3 border-t border-line pt-5">
            <div>
              <dt className="eyebrow">Scores</dt>
              <dd className="mt-1 font-mono text-[13px] font-medium text-ink sm:text-[15px]">10</dd>
            </div>
            <div>
              <dt className="eyebrow">Scale</dt>
              <dd className="mt-1 font-mono text-[13px] font-medium text-ink sm:text-[15px]">1.0-10.0</dd>
            </div>
            <div>
              <dt className="eyebrow">Photo storage</dt>
              <dd className="mt-1 font-mono text-[13px] font-medium text-ink sm:text-[15px]">None</dd>
            </div>
          </dl>
        </div>

        <div className="min-w-0">
          <div className="card overflow-hidden">
            <div className="border-b border-line p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="eyebrow">How we score you</p>
                <span className="chip">Fixed weights</span>
              </div>
              <h2 className="mt-2 text-[17px] leading-snug tracking-[-0.01em] text-ink sm:text-[19px]">
                How your results are calculated
              </h2>
            </div>

            <div className="p-4 sm:p-5">
              {FRAMEWORK_GROUPS.map((group) => (
                <div key={group.key} className="border-b border-line py-3 first:pt-0 last:border-b-0 sm:py-3.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-[12.5px] font-semibold text-ink">{group.label}</p>
                    <span className="font-mono text-[11px] tabular text-ink2">
                      {Math.round(group.weight * 100)}%
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11.5px] leading-snug text-ink2">{group.description}</p>
                  <div className="mt-1.5 h-[3px] overflow-hidden rounded-full bg-sunken">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${group.weight * 100}%` }}
                    />
                  </div>
                  <p className="mt-1.5 font-mono text-[9px] uppercase leading-relaxed tracking-[0.06em] text-ink3">
                    {group.keys
                      .map((key) => DIMENSIONS.find((dimension) => dimension.key === key)?.name)
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
              ))}
            </div>

            <form onSubmit={submit} className="border-t border-line p-4 sm:p-5">
              <label htmlFor="hero-ask" className="eyebrow">
                Ask Kef
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id="hero-ask"
                  value={ask}
                  onChange={(event) => setAsk(event.target.value)}
                  placeholder="Ask about haircuts, skin, your score..."
                  maxLength={500}
                  className="field h-11 text-[13px] sm:h-10"
                  autoComplete="off"
                />
                <button
                  type="submit"
                  disabled={!ask.trim()}
                  className="btn btn-primary h-11 w-11 shrink-0 p-0 sm:h-10 sm:w-10"
                  aria-label="Send question to Kef"
                >
                  <ArrowUp className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-ink3">
                General answers until you analyze. Personal answers after.
              </p>
            </form>
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 px-1 font-mono text-[9px] uppercase tracking-[0.08em] text-ink3">
            <span>PSL-style index shown separately</span>
            <span>Not medical advice</span>
          </div>
        </div>
      </div>
    </section>
  )
}
