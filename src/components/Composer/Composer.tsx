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
 * Pill composer (ChatGPT shape language):
 * - 28px pill radius, roomy padding; in dark mode it's a solid filled panel
 *   with NO border, in light mode a thin subtle 1px border.
 * - Left tools row: circular "+" plus a pill model trigger (presentation only
 *   in v1); extra tools collapse behind "+" on narrow viewports.
 * - Send is a perfect 32px circle centered on the right edge; while streaming
 *   it becomes a square stop icon that aborts the stream.
 * - 1 row min, 200px max then scroll. Enter sends, Shift+Enter newline.
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
    <div className="rounded-pill border border-border bg-bg px-5 py-3.5 shadow-composer transition-colors duration-150 ease-out focus-within:border-border-strong dark:border-transparent dark:bg-sidebar dark:focus-within:border-transparent">
      <div className="flex items-end gap-2">
        {/* Tools row — presentation only in v1; extras collapse on narrow screens */}
        <div className="flex shrink-0 items-center gap-1.5">
          <IconButton label="Attach files (coming soon)" className="h-8 w-8 p-0">
            <Plus />
          </IconButton>
          <button
            type="button"
            aria-label="Choose model (coming soon)"
            className="hidden h-8 items-center gap-1.5 rounded-full border border-border px-3 text-[13px] text-secondary transition-colors duration-150 ease-out hover:bg-hover sm:flex dark:border-transparent dark:bg-hover dark:hover:bg-border"
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
          className="max-h-[200px] flex-1 resize-none bg-transparent px-1 py-1 text-base leading-6 text-primary placeholder:text-secondary focus:outline-none"
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
