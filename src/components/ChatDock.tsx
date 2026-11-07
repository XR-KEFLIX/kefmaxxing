import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowUp, MessageSquare, X } from 'lucide-react'
import { askCoach } from '../lib/api'
import { CHAT_STARTERS_GENERAL, CHAT_STARTERS_WITH_REPORT } from '../lib/content'
import { cn } from '../lib/utils'
import type { ChatMessage, Gender, RatingReport } from '../lib/types'

interface Props {
  open: boolean
  onOpen: () => void
  onClose: () => void
  report: RatingReport | null
  gender: Gender
  seed: string | null
  onSeedConsumed: () => void
}

function greeting(report: RatingReport | null): ChatMessage {
  return {
    role: 'coach',
    content: report
      ? 'Your report is right in front of me. Ask about a score, your plan, hair, skin, grooming or what is just genetic.'
      : 'Ask me about facial aesthetics, the method, photo quality or what can realistically change. Upload a photo for a personalised read.',
  }
}

export function ChatDock({ open, onOpen, onClose, report, gender, seed, onSeedConsumed }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([greeting(report)])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastQuestion, setLastQuestion] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const lastSeedRef = useRef<string | null>(null)
  const lastHistoryRef = useRef<ChatMessage[]>([])

  useEffect(() => {
    setMessages([greeting(report)])
    setError(null)
    setInput('')
  }, [report])

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      const dialog = dialogRef.current
      if (!dialog) return
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), textarea:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.offsetParent !== null)
      if (!focusable.length) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)

    const timer = window.setTimeout(() => inputRef.current?.focus(), 80)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
      window.clearTimeout(timer)
      previouslyFocused?.focus()
    }
  }, [open, onClose])

  useEffect(() => {
    const element = scrollRef.current
    if (element) element.scrollTop = element.scrollHeight
  }, [messages, loading, error])

  const send = useCallback(
    async (raw: string, options?: { append?: boolean; history?: ChatMessage[] }) => {
      const question = raw.trim()
      if (!question || loading) return

      setError(null)
      setLastQuestion(question)
      const history = options?.history ?? messages
      lastHistoryRef.current = history

      if (options?.append !== false) {
        setMessages((previous) => [...previous, { role: 'user', content: question }])
      }

      setInput('')
      setLoading(true)

      try {
        const answer = await askCoach(question, report, gender, history)
        setMessages((previous) => [...previous, { role: 'coach', content: answer }])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'That did not go through. Try again.')
      } finally {
        setLoading(false)
        inputRef.current?.focus()
      }
    },
    [gender, loading, messages, report],
  )

  useEffect(() => {
    if (!seed) {
      lastSeedRef.current = null
      return
    }
    if (!open) return
    if (lastSeedRef.current === seed) return
    lastSeedRef.current = seed
    void send(seed)
    onSeedConsumed()
  }, [open, seed, send, onSeedConsumed])

  const retry = () => {
    if (!lastQuestion || loading) return
    void send(lastQuestion, { append: false, history: lastHistoryRef.current })
  }

  const starters = report ? CHAT_STARTERS_WITH_REPORT : CHAT_STARTERS_GENERAL
  const showStarters = messages.length === 1

  if (!open) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] right-[max(0.75rem,env(safe-area-inset-right))] z-40 flex h-11 w-11 items-center justify-center gap-2 rounded-button bg-accent text-[13px] font-medium text-onAccent shadow-lift transition-colors hover:bg-accentStrong sm:bottom-[max(1.5rem,env(safe-area-inset-bottom))] sm:right-[max(1.5rem,env(safe-area-inset-right))] sm:h-11 sm:w-auto sm:px-4"
        aria-label="Open the Kef chat"
      >
        <MessageSquare className="h-4 w-4" strokeWidth={1.8} />
        <span className="hidden sm:inline">Ask Kef</span>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-ink/20" onClick={onClose} aria-hidden="true" />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Ask Kef"
        className="absolute inset-y-0 right-0 flex w-full max-w-[460px] animate-drawer-in flex-col border-l border-line bg-raised shadow-lift"
      >
        <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-4">
          <div className="flex items-center gap-2.5">
            <img src="/blackpill.svg" alt="" width={32} height={32} className="h-8 w-8 shrink-0" />
            <div>
              <p className="text-[14px] font-medium text-ink">Kef</p>
              <p className="flex items-center gap-1.5 text-[11px] text-ink3">
                <span className="h-1.5 w-1.5 rounded-full bg-good" aria-hidden="true" />
                {report ? 'Your report is loaded' : 'General questions'}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-sm px-2" aria-label="Close chat">
            <X className="h-4 w-4" strokeWidth={1.8} />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              {message.role === 'coach' ? (
                <div className="flex max-w-[88%] gap-2.5">
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center">
                    <img src="/blackpill.svg" alt="Kef" width={22} height={22} className="h-5 w-5" />
                  </span>
                  <div className="whitespace-pre-wrap rounded-[8px] border border-line bg-paper px-3.5 py-2.5 text-[13px] leading-relaxed text-ink2">
                    {message.content}
                  </div>
                </div>
              ) : (
                <div className="max-w-[88%] whitespace-pre-wrap rounded-[8px] border border-accent/20 bg-accentSoft px-3.5 py-2.5 text-[13px] leading-relaxed text-ink">
                  {message.content}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 pl-8 text-[12px] text-ink3">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" aria-hidden="true" />
              Kef is thinking
            </div>
          )}

          {error && (
            <div className="rounded-[6px] border border-bad/25 bg-badSoft px-3 py-2.5 text-[12px] leading-relaxed text-bad">
              {error}
              {lastQuestion && (
                <button type="button" onClick={retry} className="ml-2 font-medium underline underline-offset-2">
                  Try again
                </button>
              )}
            </div>
          )}
        </div>

        {showStarters && (
          <div className="border-t border-line px-4 py-3">
            <p className="eyebrow mb-2">Start with</p>
            <div className="flex flex-wrap gap-1.5">
              {starters.map((starter) => (
                <button
                  key={starter}
                  type="button"
                  onClick={() => void send(starter)}
                  disabled={loading}
                  className="rounded-[4px] border border-line bg-paper px-2.5 py-1.5 text-left text-[11.5px] leading-snug text-ink2 transition-colors hover:border-accent/40 hover:text-ink disabled:opacity-50"
                >
                  {starter}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-line px-3 pb-3 pt-3">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  void send(input)
                }
              }}
              maxLength={500}
              placeholder="Ask a question..."
              className="field max-h-32 min-h-[42px] resize-none py-2.5 text-[13px]"
            />
            <button
              type="button"
              onClick={() => void send(input)}
              disabled={!input.trim() || loading}
              aria-label="Send question"
              className="btn btn-primary h-10 w-10 shrink-0 p-0"
            >
              <ArrowUp className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
          <p className="mt-2 text-[10.5px] leading-relaxed text-ink3">
            Enter to send, Shift+Enter for a new line. General guidance, not medical advice.
          </p>
        </div>
      </div>
    </div>
  )
}
