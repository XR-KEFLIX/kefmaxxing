import { useCallback, useRef, useState } from 'react'
import { AlertTriangle, Check, ImagePlus, Loader2, ScanFace, ShieldCheck, X } from 'lucide-react'
import { DELIVERABLES, PHOTO_PROTOCOL, PRIVACY_POINTS } from '../lib/content'
import { cn } from '../lib/utils'
import { SectionHeading } from './ui'

export function AnalyzerSection({ photo, gender, status, error, onFile, onGender, onAnalyze, onClearError, onClearPhoto }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  const pick = useCallback(() => inputRef.current?.click(), [])

  const handleDrop = useCallback((event) => {
    event.preventDefault()
    setDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (file) onFile(file)
  }, [onFile])

  return (
    <section id="analysis" className="container-page scroll-mt-20 py-16 sm:py-20">
      <SectionHeading eyebrow="Analysis" title="Upload a front-facing photo" description="Front-facing, even light, neutral expression. It reads what is visible in the photo, nothing else." />

      <div className="card mt-8 grid overflow-hidden lg:grid-cols-[1.05fr_0.95fr]">
        <div className="border-b border-line p-5 sm:p-7 lg:border-b-0 lg:border-r">
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) onFile(file); event.target.value = '' }} />

          <div className="mb-3 flex items-center justify-between gap-4">
            <p className="eyebrow">Photo</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.06em] text-ink3">JPEG - PNG - WEBP - 15 MB</p>
          </div>

          <div role="button" tabIndex={0} aria-label={photo ? 'Replace your photo' : 'Upload a front-facing photo'} onClick={pick} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); pick() } }} onDragOver={(event) => { event.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={handleDrop} className={cn('relative flex min-h-[340px] cursor-pointer items-center justify-center overflow-hidden rounded-[6px] border border-dashed transition-colors', dragging ? 'border-accent bg-accentSoft' : 'border-lineStrong bg-paper hover:border-accent/60 hover:bg-sunken/60')}>
            {photo ? (
              <div className="relative w-full">
                <img src={photo} alt="Your uploaded photo" className="max-h-[430px] w-full object-contain" />
                <span className="absolute bottom-3 left-3 rounded-[4px] border border-line bg-raised/95 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.06em] text-ink2">ready to analyze</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-[6px] border border-lineStrong bg-raised"><ImagePlus className="h-5 w-5 text-accent" strokeWidth={1.7} /></div>
                <div>
                  <p className="text-[14px] font-medium text-ink">Drop a front-facing photo</p>
                  <p className="mt-1 text-[12.5px] text-ink3">or click to browse</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button type="button" onClick={pick} className="btn btn-secondary btn-sm"><ImagePlus className="h-3.5 w-3.5" strokeWidth={1.8} />{photo ? 'Replace' : 'Choose photo'}</button>
              {photo && (<button type="button" onClick={onClearPhoto} className="btn btn-ghost btn-sm"><X className="h-3.5 w-3.5" strokeWidth={1.8} />Remove</button>)}
            </div>
          </div>

          <div className="mt-7">
            <p className="eyebrow mb-3">Reference standard</p>
            <div className="inline-flex rounded-[6px] border border-line bg-paper p-0.5" role="group" aria-label="Reference standard">
              {['male', 'female'].map((option) => (
                <button key={option} type="button" onClick={() => onGender(option)} aria-pressed={gender === option} className={cn('rounded-[4px] px-4 py-1.5 text-[13px] font-medium capitalize transition-colors', gender === option ? 'bg-accent text-onAccent' : 'text-ink2 hover:text-ink')}>{option}</button>
              ))}
            </div>
            <p className="mt-2.5 max-w-sm text-[12px] leading-relaxed text-ink3">Male and female faces are judged against different references. Pick the one you want.</p>
          </div>

          {error && (
            <div className="mt-6 flex items-start justify-between gap-3 rounded-[6px] border border-bad/25 bg-badSoft px-4 py-3 animate-fade-in">
              <div className="flex items-start gap-2.5"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-bad" strokeWidth={1.8} /><span className="text-[13px] leading-relaxed text-bad">{error}</span></div>
              <button type="button" onClick={onClearError} aria-label="Dismiss error" className="shrink-0 text-bad/60 transition-colors hover:text-bad"><X className="h-4 w-4" strokeWidth={1.8} /></button>
            </div>
          )}

          <button type="button" disabled={!photo || status === 'analyzing'} onClick={onAnalyze} className="btn btn-primary mt-7 h-12 w-full text-[14px]">
            {status === 'analyzing' ? (<><Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />Analyzing...</>) : (<><ScanFace className="h-4 w-4" strokeWidth={1.9} />Analyze my photo</>)}
          </button>
        </div>

        <div className="flex flex-col p-5 sm:p-7">
          <div>
            <p className="eyebrow">What you receive</p>
            <ul className="mt-3 divide-y divide-line">
              {DELIVERABLES.map((item, index) => (
                <li key={item.title} className="flex gap-4 py-3.5 first:pt-1">
                  <span className="mt-0.5 font-mono text-[10px] text-accent">{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <p className="text-[13.5px] font-medium text-ink">{item.title}</p>
                    <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink2">{item.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 border-t border-line pt-5">
            <p className="eyebrow mb-3">Photo protocol</p>
            <ul className="space-y-2.5">
              {PHOTO_PROTOCOL.map((item) => (
                <li key={item.title} className="flex gap-2.5"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" strokeWidth={2} /><p className="text-[12.5px] leading-relaxed text-ink2"><span className="font-medium text-ink">{item.title}.</span> {item.detail}</p></li>
              ))}
            </ul>
          </div>

          <div className="mt-auto pt-6">
            <div className="rounded-[6px] border border-line bg-paper p-4">
              <p className="flex items-center gap-2 text-[12px] font-medium text-ink"><ShieldCheck className="h-3.5 w-3.5 text-accent" strokeWidth={1.8} />Privacy</p>
              <ul className="mt-2.5 space-y-1.5">
                {PRIVACY_POINTS.map((point) => (<li key={point} className="text-[11.5px] leading-relaxed text-ink2">{point}</li>))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
