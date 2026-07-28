import { useEffect, useRef, useState } from 'react'
import { ArrowUp, Square } from 'lucide-react'

const MAX_HEIGHT = 200 // px — textarea grows to this, then scrolls

interface ComposerProps {
  onSend: (text: string) => void
  streaming?: boolean
  onStop?: () => void
}

/**
 * Auto-growing composer: 1 row min, max 200px then scroll.
 * Enter sends, Shift+Enter newline. Container gets border-strong on focus
 * (no glow, no ring). Send is a 32px accent circle; while streaming it becomes
 * a square stop icon that aborts the stream.
 */
export function Composer({ onSend, streaming = false, onStop }: ComposerProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    const next = Math.min(el.scrollHeight, MAX_HEIGHT)
    el.style.height = `${next}px`
    el.style.overflowY = el.scrollHeight > MAX_HEIGHT ? 'auto' : 'hidden'
  }, [value])

  function submit() {
    if (streaming) return
    const text = value.trim()
    if (!text) return
    onSend(text)
    setValue('')
  }

  const canSend = value.trim().length > 0 && !streaming

  return (
    <div className="rounded-2xl border border-border bg-bg px-4 py-[14px] shadow-composer transition-colors duration-150 ease-out focus-within:border-border-strong">
      <div className="flex items-end gap-3">
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              submit()
            }
          }}
          placeholder="Message Milo…"
          aria-label="Message Milo"
          className="max-h-[200px] flex-1 resize-none bg-transparent text-base leading-6 text-primary placeholder:text-secondary focus:outline-none"
        />
        {streaming ? (
          <button
            type="button"
            onClick={onStop}
            aria-label="Stop generating"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-white transition-colors duration-150 ease-out hover:bg-accent-hover"
          >
            <Square className="h-3.5 w-3.5 fill-current" />
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={!canSend}
            aria-label="Send message"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-white transition-colors duration-150 ease-out hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowUp className="h-[18px] w-[18px]" />
          </button>
        )}
      </div>
    </div>
  )
}
