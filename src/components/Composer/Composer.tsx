import { useEffect, useRef, useState } from 'react'
import { ArrowUp, Brain, Check, ChevronDown, Plus, Square } from 'lucide-react'
import { MODELS, useMiloStore, type ModelId } from '../../lib/store'
import { cn } from '../../lib/utils'
import { IconButton } from '../ui/IconButton'

const MAX_HEIGHT = 200 // px — textarea grows to this, then scrolls

interface ComposerProps {
  onSend: (text: string) => void
  streaming?: boolean
  onStop?: () => void
}

/**
 * The composer — one compact crafted object (~76px empty): a single-line
 * writing row above an integrated toolbar row. Tools left (attach, thinking,
 * model), send right. Grows upward to 200px as you write; Enter sends,
 * Shift+Enter newline; send becomes stop while streaming.
 *
 * Real controls: thinking toggle and model selector (persisted, mirroring
 * the backend allowlist). Attach is presentation-only in v1.
 */
export function Composer({ onSend, streaming = false, onStop }: ComposerProps) {
  const [value, setValue] = useState('')
  const [modelMenuOpen, setModelMenuOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const model = useMiloStore((s) => s.model)
  const setModel = useMiloStore((s) => s.setModel)
  const thinking = useMiloStore((s) => s.thinking)
  const toggleThinking = useMiloStore((s) => s.toggleThinking)

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
    <div className="rounded-pill border border-transparent bg-elevated px-3 py-1.5 shadow-composer transition-shadow duration-200 ease-out focus-within:shadow-composer-glow light:border-border">
      {/* Writing row — single line when empty, grows upward */}
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
        className="block max-h-[200px] w-full resize-none bg-transparent px-2 py-1 text-[15px] leading-6 text-primary placeholder:text-secondary focus:outline-none"
      />

      {/* Integrated toolbar row */}
      <div className="mt-0.5 flex items-center gap-1">
        <IconButton label="Attach files (coming soon)" className="h-7 w-7 p-0">
          <Plus />
        </IconButton>
        <IconButton
          label={thinking ? 'Thinking mode on' : 'Thinking mode off'}
          aria-pressed={thinking}
          onClick={toggleThinking}
          className={cn('h-7 w-7 p-0', thinking && 'bg-accent-glow text-accent')}
        >
          <Brain />
        </IconButton>

        {/* Model selector — real; persisted, mirrors the backend allowlist */}
        <div
          className="relative hidden sm:block"
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.stopPropagation()
              setModelMenuOpen(false)
            }
          }}
        >
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={modelMenuOpen}
            aria-label="Choose model"
            onClick={() => setModelMenuOpen((o) => !o)}
            className="flex h-7 items-center gap-1 rounded-full border border-transparent bg-hover px-2.5 text-xs text-secondary transition-colors duration-150 ease-out hover:bg-border light:border-border light:bg-transparent light:hover:bg-hover"
          >
            {model}
            <ChevronDown
              className={cn('h-3 w-3 transition-transform duration-150', modelMenuOpen && 'rotate-180')}
            />
          </button>

          {modelMenuOpen && (
            <>
              {/* click-away layer (presentation only) */}
              <div className="fixed inset-0 z-10" onClick={() => setModelMenuOpen(false)} />
              <div
                role="listbox"
                aria-label="Models"
                className="absolute bottom-full left-0 z-20 mb-2 w-64 animate-fade-in overflow-hidden rounded-xl bg-elevated py-1 shadow-composer"
              >
                {MODELS.map((id) => (
                  <button
                    key={id}
                    type="button"
                    role="option"
                    aria-selected={id === model}
                    onClick={() => {
                      setModel(id as ModelId)
                      setModelMenuOpen(false)
                    }}
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-[13px] text-primary transition-colors duration-150 ease-out hover:bg-hover"
                  >
                    {id}
                    {id === model && <Check className="h-3.5 w-3.5 text-accent" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

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
