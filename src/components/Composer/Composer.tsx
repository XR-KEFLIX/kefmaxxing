import { useEffect, useRef, useState } from 'react'
import { ArrowUp, ChevronDown, Plus, Square } from 'lucide-react'
import { IconButton } from '../ui/IconButton'

const MAX_HEIGHT = 200 // px — textarea grows to this, then scrolls

interface ComposerProps {
  onSend: (text: string) => void
  streaming?: boolean
  onStop?: () => void
}

/**
 * The composer is the product — built as one crafted object, not a rounded
 * rectangle with controls inline: a roomy text zone on top, an integrated
 * toolbar row beneath it (tools left, send right), all on a single elevated
 * surface with a soft shadow and a restrained accent focus ring.
 *
 * - Starts at two rows so it reads as substantial from first paint; grows to
 *   200px, then scrolls. Enter sends, Shift+Enter newline.
 * - Send: perfect circle, solid accent, calm color-only hover. While
 *   streaming it becomes a square stop icon that aborts the stream.
 * - Tools ("+" + model pill) are presentation-only in v1 and the pill
 *   collapses on narrow viewports.
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

  const actionButtonClass =
    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-ink ' +
    'transition-colors duration-150 ease-out hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40'

  return (
    <div className="rounded-pill border border-transparent bg-elevated px-3 py-2.5 shadow-composer transition-shadow duration-200 ease-out focus-within:shadow-composer-glow light:border-border">
      {/* Text zone — generous, unhurried */}
      <textarea
        ref={textareaRef}
        rows={2}
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
        className="block max-h-[200px] w-full resize-none bg-transparent px-2 py-1 text-base leading-6 text-primary placeholder:text-secondary focus:outline-none"
      />

      {/* Integrated toolbar row — tools left, send right */}
      <div className="mt-1 flex items-center gap-1.5">
        <IconButton label="Attach files (coming soon)" className="h-8 w-8 p-0">
          <Plus />
        </IconButton>
        <button
          type="button"
          aria-label="Choose model (coming soon)"
          className="hidden h-8 items-center gap-1.5 rounded-full border border-transparent bg-hover px-3 text-[13px] text-secondary transition-colors duration-150 ease-out hover:bg-border sm:flex light:border-border light:bg-transparent light:hover:bg-hover"
        >
          Milo 2.5
          <ChevronDown className="h-3.5 w-3.5" />
        </button>

        <div className="flex-1" />

        {streaming ? (
          <button type="button" onClick={onStop} aria-label="Stop generating" className={actionButtonClass}>
            <Square className="h-3.5 w-3.5 fill-current" />
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={!canSend}
            aria-label="Send message"
            className={actionButtonClass}
          >
            <ArrowUp className="h-[18px] w-[18px]" />
          </button>
        )}
      </div>
    </div>
  )
}
