import { useEffect, useRef, useState } from 'react'
import { ArrowUp } from 'lucide-react'

const MAX_HEIGHT = 200 // px — textarea grows to this, then scrolls

interface ComposerProps {
  onSend: (text: string) => void
}

/**
 * Auto-growing composer: 1 row min, max 200px then scroll.
 * Enter sends, Shift+Enter newline. Container gets border-strong on focus
 * (no glow, no ring). Send button is a 32px accent circle, disabled at 40%
 * opacity with a not-allowed cursor. Stage 2: local state only.
 */
export function Composer({ onSend }: ComposerProps) {
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
    const text = value.trim()
    if (!text) return
    onSend(text)
    setValue('')
  }

  const canSend = value.trim().length > 0

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
        <button
          type="button"
          onClick={submit}
          disabled={!canSend}
          aria-label="Send message"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-white transition-colors duration-150 ease-out hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowUp className="h-[18px] w-[18px]" />
        </button>
      </div>
    </div>
  )
}
