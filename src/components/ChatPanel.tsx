import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowUp, Loader2, Sparkles } from 'lucide-react'
import { askCoach } from '../lib/api'
import { cn } from '../lib/utils'
import type { ChatMessage, Gender, RatingReport } from '../lib/types'

const STARTERS = [
  'What should I fix first?',
  'How long until I see a difference?',
  'What haircut suits my face?',
  'Build me a skin routine.',
]

export function ChatPanel({ report, gender }: { report: RatingReport; gender: Gender }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'coach', content: 'Ask me anything about your rating or your plan. I have your scores in front of me.' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, loading])

  const send = useCallback(
    async (raw: string) => {
      const question = raw.trim()
      if (!question || loading) return
      setError(null)
      const history = messages
      setMessages((prev) => [...prev, { role: 'user', content: question }])
      setInput('')
      setLoading(true)
      try {
        const answer = await askCoach(question, report, gender, history)
        setMessages((prev) => [...prev, { role: 'coach', content: answer }])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'That did not go through. Try again.')
      } finally {
        setLoading(false)
        inputRef.current?.focus()
      }
    },
    [messages, loading, report, gender],
  )

  const showStarters = messages.length === 1

  return (
    <section id="chat" className="card mt-6 scroll-mt-20 overflow-hidden animate-fade-up">
      <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
        <div>
          <h2 className="text-[14.5px] font-semibold">ask the rater</h2>
          <p className="mt-1 text-[12.5px] leading-relaxed text-secondary">
            Follow-up questions about your face, your plan or anything looksmaxxing. It already has your report.
          </p>
        </div>
        <Sparkles className="mt-0.5 hidden h-4 w-4 shrink-0 text-gold sm:block" strokeWidth={1.6} />
      </div>

      <div ref={scrollRef} className="max-h-[380px] space-y-4 overflow-y-auto px-6 py-5">
        {messages.map((message, i) => (
          <div key={i} className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div
              className={cn(
                'max-w-[85%] whitespace-pre-wrap rounded-[12px] border px-4 py-3 text-[13px] leading-relaxed',
                message.role === 'user'
                  ? 'border-gold/30 bg-gold/[0.08] text-primary'
                  : 'border-border bg-bg/60 text-secondary',
              )}
            >
              {message.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-[12px] border border-border bg-bg/60 px-4 py-3 text-[13px] text-faint">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-gold" strokeWidth={2} />
              thinking
            </div>
          </div>
        )}
      </div>

      {showStarters && (
        <div className="flex flex-wrap gap-2 border-t border-border px-6 py-4">
          {STARTERS.map((starter) => (
            <button
              key={starter}
              type="button"
              onClick={() => send(starter)}
              disabled={loading}
              className="chip transition-colors hover:border-gold/40 hover:text-primary disabled:opacity-50"
            >
              {starter}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="border-t border-border px-6 py-3">
          <p className="text-[12.5px] leading-relaxed text-bad">{error}</p>
        </div>
      )}

      <div className="border-t border-border px-6 py-4">
        <div className="flex items-end gap-3">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send(input)
              }
            }}
            placeholder="Ask a question..."
            className="max-h-32 min-h-[44px] w-full resize-none rounded-[10px] border border-border bg-bg px-4 py-3 text-[13px] text-primary outline-none transition-colors placeholder:text-faint focus:border-gold/40"
          />
          <button
            type="button"
            onClick={() => send(input)}
            disabled={!input.trim() || loading}
            aria-label="Send question"
            className="btn-primary h-11 w-11 shrink-0 rounded-[10px] p-0"
          >
            <ArrowUp className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
        <p className="mt-2 text-[11px] text-faint">Enter to send, Shift+Enter for a new line.</p>
      </div>
    </section>
  )
}
