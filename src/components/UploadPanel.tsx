import { useCallback, useRef, useState } from 'react'
import type { DragEvent } from 'react'
import { AlertTriangle, ImagePlus, Loader2, ScanFace, ShieldCheck, Sparkles, X } from 'lucide-react'
import { cn } from '../lib/utils'
import type { Gender, ScanStatus } from '../lib/types'

interface Props {
  photo: string | null
  gender: Gender
  status: ScanStatus
  error: string | null
  onFile: (file: File) => void
  onGender: (g: Gender) => void
  onAnalyze: () => void
  onClearError: () => void
}

const DELIVERABLES = [
  {
    icon: ScanFace,
    title: 'Your PSL score, out of 8',
    body: 'Where you land on the 1–8 scale, which tier that puts you in, and how confident the rating is.',
  },
  {
    icon: Sparkles,
    title: 'Scores for each feature',
    body: 'Harmony, angularity, dimorphism, eye area, jawline, midface, skin, hair and brows. Each scored out of 10.',
  },
  {
    icon: ShieldCheck,
    title: 'What to fix first',
    body: 'Things you can do to look better, ranked by how much they matter. Each one comes with a rough timeframe.',
  },
]

const PROTOCOL = ['front-on, camera at eye level', 'even light, no flash or ring light', 'neutral face, no filters or beauty mode']

export function UploadPanel({ photo, gender, status, error, onFile, onGender, onAnalyze, onClearError }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const pick = useCallback(() => inputRef.current?.click(), [])

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setDragging(false)
      const file = e.dataTransfer.files?.[0]
      if (file) onFile(file)
    },
    [onFile],
  )

  return (
    <section id="scan" className="scroll-mt-20">
      <div className="mb-12 text-center animate-fade-up">
        <h1 className="mx-auto max-w-3xl text-balance text-[40px] font-semibold leading-[1.04] tracking-[-0.035em] sm:text-[56px]">
          Get your face <span className="text-gold">rated</span>.
        </h1>
        <p className="mx-auto mt-6 max-w-[560px] text-pretty text-[15px] leading-relaxed text-secondary">
          Upload a photograph. It tells you how attractive you are according to a number of factors: canthal tilt,
          gonial angle, midfacial ratios, appeal, etc. It provides you with a PSL score.
        </p>
        <p className="mt-5 text-[12.5px] text-faint">This is updated to current looksmaxxing standards.</p>
      </div>

      <div className="card grid gap-0 overflow-hidden md:grid-cols-[1.08fr_0.92fr]">
        <div className="border-b border-border p-6 sm:p-8 md:border-b-0 md:border-r">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onFile(file)
              e.target.value = ''
            }}
          />

          <div className="mb-3 flex items-center justify-between">
            <p className="label text-secondary">drop a photo</p>
            <p className="label">jpeg, png, webp, max 15 mb</p>
          </div>

          <div
            role="button"
            tabIndex={0}
            aria-label="Upload a front-facing photo"
            onClick={pick}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') pick()
            }}
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={cn(
              'group relative flex min-h-[320px] cursor-pointer items-center justify-center overflow-hidden rounded-[12px] border border-dashed transition-colors',
              dragging
                ? 'border-gold/70 bg-gold/5'
                : 'border-border-strong bg-bg/60 hover:border-gold/40 hover:bg-bg/40',
            )}
          >
            {photo ? (
              <div className="relative h-full w-full">
                <img src={photo} alt="Your uploaded photo" className="max-h-[430px] w-full object-contain" />
                <div className="pointer-events-none absolute inset-0">
                  <span className="absolute left-3 top-3 h-4 w-4 border-l border-t border-gold/70" />
                  <span className="absolute right-3 top-3 h-4 w-4 border-r border-t border-gold/70" />
                  <span className="absolute bottom-3 left-3 h-4 w-4 border-b border-l border-gold/70" />
                  <span className="absolute bottom-3 right-3 h-4 w-4 border-b border-r border-gold/70" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-[10px] border border-border-strong bg-elevated transition-colors group-hover:border-gold/50">
                  <ImagePlus className="h-5 w-5 text-gold" strokeWidth={1.6} />
                </div>
                <div>
                  <p className="text-[14px] font-medium">Drop a front-facing photo</p>
                  <p className="mt-1 text-[12.5px] text-faint">or click to browse</p>
                </div>
              </div>
            )}
          </div>

          {photo && (
            <div className="mt-3 flex items-center justify-between gap-3">
              <button type="button" onClick={pick} className="btn-ghost h-8 px-3 text-[12.5px]">
                <ImagePlus className="h-3.5 w-3.5" strokeWidth={1.7} />
                swap photo
              </button>
              <span className="label">never stored</span>
            </div>
          )}

          <div className="mt-7">
            <p className="label mb-3 text-secondary">pick your reference</p>
            <div className="inline-flex rounded-[10px] border border-border bg-bg p-0.5">
              {(['male', 'female'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => onGender(g)}
                  className={cn(
                    'rounded-[8px] px-4 py-1.5 text-[13px] font-medium transition-colors',
                    gender === g ? 'bg-gold text-black' : 'text-secondary hover:text-primary',
                  )}
                >
                  {g} standards
                </button>
              ))}
            </div>
            <p className="mt-2.5 max-w-sm text-[12px] leading-relaxed text-faint">
              Male and female ideals aren't the same. Pick the one you want to be read against.
            </p>
          </div>

          {error && (
            <div className="mt-6 flex items-start justify-between gap-3 rounded-[10px] border border-bad/25 bg-bad/[0.07] px-4 py-3 animate-fade-in">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-bad" strokeWidth={1.7} />
                <span className="text-[13px] leading-relaxed text-bad">{error}</span>
              </div>
              <button
                type="button"
                onClick={onClearError}
                aria-label="Dismiss error"
                className="shrink-0 text-bad/60 transition-colors hover:text-bad"
              >
                <X className="h-4 w-4" strokeWidth={1.8} />
              </button>
            </div>
          )}

          <button
            type="button"
            disabled={!photo || status === 'analyzing'}
            onClick={onAnalyze}
            className="btn-primary mt-7 h-12 w-full rounded-[12px] text-[14.5px] font-semibold"
          >
            {status === 'analyzing' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
                rating…
              </>
            ) : (
              <>
                <ScanFace className="h-4 w-4" strokeWidth={1.9} />
                get my rating
              </>
            )}
          </button>
        </div>

        <div className="flex flex-col p-6 sm:p-8">
          <p className="label mb-1 text-secondary">what you get</p>
          <ul className="divide-y divide-border">
            {DELIVERABLES.map((item) => (
              <li key={item.title} className="flex gap-4 py-4 first:pt-2">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] border border-border bg-bg">
                  <item.icon className="h-[15px] w-[15px] text-gold" strokeWidth={1.6} />
                </div>
                <div>
                  <p className="text-[13.5px] font-medium">{item.title}</p>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-secondary">{item.body}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 border-t border-border pt-5">
            <p className="label mb-3 text-secondary">how to take the photo</p>
            <ol className="space-y-2">
              {PROTOCOL.map((line, i) => (
                <li key={line} className="flex items-baseline gap-3 font-mono text-[11.5px] text-faint">
                  <span className="text-gold/70">{String(i + 1).padStart(2, '0')}</span>
                  {line}
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-auto pt-6">
            <div className="rounded-[10px] border border-border bg-bg/60 p-4">
              <p className="flex items-center gap-2 text-[12px] font-medium text-secondary">
                <ShieldCheck className="h-3.5 w-3.5 text-gold" strokeWidth={1.7} />
                privacy
              </p>
              <p className="mt-1.5 text-[12px] leading-relaxed text-faint">
                The picture that you upload goes through the rating algorithm just one time, is processed, and is then
                discarded. Nothing gets written or saved. There is no account, no profile, no gallery.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
