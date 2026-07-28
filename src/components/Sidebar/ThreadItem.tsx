import { useEffect, useRef, useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import type { Thread } from '../../lib/types'
import { cn } from '../../lib/utils'
import { IconButton } from '../ui/IconButton'

type Mode = 'idle' | 'renaming' | 'confirming'

interface ThreadItemProps {
  thread: Thread
  active: boolean
  onSelect: () => void
  onRename: (title: string) => void
  onDelete: () => void
}

/**
 * Thread row with inline flows (no modals):
 * - Rename: pencil swaps the title for an input — Enter commits, Esc cancels, blur commits.
 * - Delete: trash swaps the row for "Delete this chat? [Delete] [Cancel]" — Esc cancels.
 * Active state: 2.5px accent bar on the left edge (grows in from center)
 * plus a neutral surface lift — a confident marker, not a faint tint.
 */
export function ThreadItem({ thread, active, onSelect, onRename, onDelete }: ThreadItemProps) {
  const [mode, setMode] = useState<Mode>('idle')
  const [draft, setDraft] = useState(thread.title)
  const inputRef = useRef<HTMLInputElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (mode === 'renaming') {
      inputRef.current?.focus()
      inputRef.current?.select()
    } else if (mode === 'confirming') {
      cancelRef.current?.focus() // safe default focus
    }
  }, [mode])

  function startRename() {
    setDraft(thread.title)
    setMode('renaming')
  }

  function commitRename() {
    const title = draft.trim()
    if (title && title !== thread.title) onRename(title)
    setMode('idle')
  }

  const containerClass = cn(
    'group relative flex h-8 items-center rounded-lg pl-3 transition-colors duration-150 ease-out',
    mode === 'idle' ? 'pr-1' : 'pr-2',
    active ? 'bg-hover' : 'hover:bg-hover',
  )

  if (mode === 'confirming') {
    return (
      <div
        className={containerClass}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.stopPropagation()
            setMode('idle')
          }
        }}
      >
        <span className="min-w-0 flex-1 truncate text-[13px] text-primary">Delete this chat?</span>
        {/* Destructive action: neutral chrome, meaning carried by the label */}
        <button
          type="button"
          onClick={onDelete}
          className="ml-1 shrink-0 rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors duration-150 ease-out hover:bg-hover"
        >
          Delete
        </button>
        <button
          ref={cancelRef}
          type="button"
          onClick={() => setMode('idle')}
          className="shrink-0 rounded-md px-2 py-1 text-xs text-secondary transition-colors duration-150 ease-out hover:bg-hover"
        >
          Cancel
        </button>
      </div>
    )
  }

  if (mode === 'renaming') {
    return (
      <div className={containerClass}>
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              commitRename()
            } else if (e.key === 'Escape') {
              e.stopPropagation()
              setMode('idle')
            }
          }}
          onBlur={commitRename} // blur commits
          aria-label="Chat title"
          className="w-full min-w-0 rounded-md border border-border bg-bg px-2 py-1 text-sm text-primary outline-none"
        />
      </div>
    )
  }

  return (
    <div className={containerClass}>
      {/* Active indicator: 2.5px accent bar, animates in with a vertical grow */}
      {active && (
        <span
          aria-hidden="true"
          className="absolute left-1 top-[22.5%] h-[55%] w-[2.5px] animate-grow-y rounded-full bg-accent"
        />
      )}
      <button
        type="button"
        onClick={onSelect}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'min-w-0 flex-1 truncate text-left text-sm transition-colors duration-150 ease-out',
          active ? 'font-medium text-primary' : 'text-secondary hover:text-primary',
        )}
      >
        {thread.title || 'New chat'}
      </button>

      {/* Rename/delete — revealed on hover or keyboard focus */}
      <div className="ml-1 hidden shrink-0 items-center gap-0.5 group-hover:flex group-focus-within:flex">
        <IconButton label="Rename chat" className="p-1 hover:text-primary" onClick={startRename}>
          <Pencil />
        </IconButton>
        <IconButton
          label="Delete chat"
          className="p-1 hover:text-primary"
          onClick={() => setMode('confirming')}
        >
          <Trash2 />
        </IconButton>
      </div>
    </div>
  )
}
