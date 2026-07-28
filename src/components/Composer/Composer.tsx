import { useEffect, useRef, useState } from 'react'
import { ArrowUp, Brain, Check, ChevronDown, PanelRight, Plus, Square, Wrench } from 'lucide-react'
import { MODELS, useMiloStore, type ModelId } from '../../lib/store'
import { cn } from '../../lib/utils'
import { IconButton } from '../ui/IconButton'

const MAX_HEIGHT = 240 // px — textarea grows to this, then scrolls

interface ComposerProps {
  onSend: (text: string) => void
  streaming?: boolean
  onStop?: () => void
}

/**
 * The hero object — a piece of hardware, not a form field. Three rows:
 *
 *   [ Attach ] [ Tools ] [ Model ]        capabilities
 *   large writing area                    the work
 *   [ Thinking ] [ Workspace ] [ Send ]   behavior + action
 *
 * Floating, elevated, detached from every edge. Real controls: model
 * selector (mirrors the backend allowlist), thinking toggle, workspace
 * toggle, send/stop. Attach/Tools are presentation-only in v1.
 */
export function Composer({ onSend, streaming = false, onStop }: ComposerProps) {
  const [value, setValue] = useState('')
  const [modelMenuOpen, setModelMenuOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const model = useMiloStore((s) => s.model)
  const setModel = useMiloStore((s) => s.setModel)
  const thinking = useMiloStore((s) => s.thinking)
  const toggleThinking = useMiloStore((s) => s.toggleThinking)
  const workspaceOpen = useMiloStore((s) => s.workspaceOpen)
  const toggleWorkspace = useMiloStore((s) => s.toggleWorkspace)

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
    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-ink ' +
    'transition-colors duration-150 ease-out hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40'

  return (
    <div className="rounded-pill border border-transparent bg-elevated px-3 py-2 shadow-composer transition-shadow duration-200 ease-out focus-within:shadow-composer-glow light:border-border">
      {/* Row 1 — capabilities */}
      <div className="flex items-center gap-1.5 px-1">
        <IconButton label="Attach files (coming soon)" className="h-8 w-8 p-0">
          <Plus />
        </IconButton>
        <IconButton label="Tools (coming soon)" className="h-8 w-8 p-0">
          <Wrench />
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
            className="flex h-8 items-center gap-1.5 rounded-full border border-transparent bg-hover px-3 text-[13px] text-secondary transition-colors duration-150 ease-out hover:bg-border light:border-border light:bg-transparent light:hover:bg-hover"
          >
            {model}
            <ChevronDown
              className={cn('h-3.5 w-3.5 transition-transform duration-150', modelMenuOpen && 'rotate-180')}
            />
          </button>

          {modelMenuOpen && (
            <>
              {/* click-away layer (presentation only) */}
              <div className="fixed inset-0 z-10" onClick={() => setModelMenuOpen(false)} />
              <div
                role="listbox"
                aria-label="Models"
                className="absolute left-0 top-full z-20 mt-2 w-64 animate-fade-in overflow-hidden rounded-xl bg-elevated py-1 shadow-composer"
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
      </div>

      {/* Row 2 — the writing area: generous by default, grows to 240px */}
      <textarea
        ref={textareaRef}
        rows={3}
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
        className="mt-1 block max-h-[240px] w-full resize-none bg-transparent px-2 py-1.5 text-base leading-6 text-primary placeholder:text-secondary focus:outline-none"
      />

      {/* Row 3 — behavior + action */}
      <div className="mt-1 flex items-center gap-1.5 px-1">
        <IconButton
          label={thinking ? 'Thinking mode on' : 'Thinking mode off'}
          aria-pressed={thinking}
          onClick={toggleThinking}
          className={cn('h-8 w-8 p-0', thinking && 'bg-accent-glow text-accent')}
        >
          <Brain />
        </IconButton>
        <IconButton
          label={workspaceOpen ? 'Close workspace' : 'Open workspace'}
          aria-pressed={workspaceOpen}
          onClick={toggleWorkspace}
          className={cn('h-8 w-8 p-0', workspaceOpen && 'bg-accent-glow text-accent')}
        >
          <PanelRight />
        </IconButton>

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
