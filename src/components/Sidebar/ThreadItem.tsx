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
    'group flex h-9 items-center rounded-lg pl-3 transition-colors duration-150 ease-out',
    mode === 'idle' ? 'pr-1' : 'pr-2',
    active ? 'bg-accent-subtle' : 'hover:bg-hover',
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
        <button
          type="button"
          onClick={onDelete}
          className="ml-1 shrink-0 rounded-md bg-danger/10 px-2 py-1 text-xs font-medium text-danger transition-colors duration-150 ease-out hover:bg-danger/20"
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
          onBlur={commitRename} // blur commits per spec
          aria-label="Chat title"
          className="w-full min-w-0 rounded-md border border-border-strong bg-bg px-2 py-1 text-sm text-primary outline-none"
        />
      </div>
    )
  }

  return (
    <div className={containerClass}>
      <button
        type="button"
        onClick={onSelect}
        aria-current={active ? 'page' : undefined}
        className="min-w-0 flex-1 truncate text-left text-sm text-primary"
      >
        {thread.title || 'New chat'}
      </button>

      {/* Rename/delete — revealed on hover or keyboard focus */}
      <div className="ml-1 hidden shrink-0 items-center gap-0.5 group-hover:flex group-focus-within:flex">
        <IconButton label="Rename chat" className="p-1 hover:text-accent" onClick={startRename}>
          <Pencil />
        </IconButton>
        <IconButton
          label="Delete chat"
          className="p-1 hover:text-accent"
          onClick={() => setMode('confirming')}
        >
          <Trash2 />
        </IconButton>
      </div>
    </div>
  )
}
