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
 * Pill composer on the elevated surface:
 * - 28px pill, thin border in light / borderless filled panel in dark.
 * - Focus: warm accent-glow shadow around the pill (not a border swap).
 * - Send: perfect circle, solid accent with accent-ink icon; hover pops
 *   1.04x with a slightly bouncy easing. While streaming it becomes a
 *   square stop icon that aborts the stream.
 * - Left tools row ("+" + model pill) is presentation-only in v1 and
 *   collapses to just "+" on narrow viewports.
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

  // Tactile send/stop: color shift + 1.04x pop on a bouncy easing
  const actionButtonClass =
    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-ink ' +
    'transition-[transform,background-color] duration-150 ease-[cubic-bezier(0.34,1.56,0.64,1)] ' +
    'hover:scale-[1.04] hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100'

  return (
    <div className="rounded-pill border border-transparent bg-elevated px-5 py-3.5 shadow-composer transition-shadow duration-200 ease-out focus-within:shadow-composer-glow light:border-border">
      <div className="flex items-end gap-2">
        {/* Tools row — presentation only in v1; extras collapse on narrow screens */}
        <div className="flex shrink-0 items-center gap-1.5">
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
        </div>

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
          className="max-h-[200px] flex-1 resize-none bg-transparent px-1 py-1 text-[15px] leading-6 text-primary placeholder:text-secondary focus:outline-none"
        />

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
