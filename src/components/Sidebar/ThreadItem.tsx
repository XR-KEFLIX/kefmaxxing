import { useEffect, useRef, useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import type { Thread } from '../../lib/types'
import { cn, formatRelativeTime } from '../../lib/utils'
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
 * A conversation is an object, not a row: a card with a title and a metadata
 * line (relative time + message count). Active = lifted surface + accent bar
 * (grows in from center); hover = gentle surface lift with reveal actions.
 * Rename/delete stay inline (no modals).
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

  const count = thread.messages.length
  const meta =
    count > 0
      ? `${formatRelativeTime(thread.updatedAt)} · ${count} messages`
      : formatRelativeTime(thread.updatedAt)

  const containerClass = cn(
    'group relative rounded-xl px-3.5 py-2.5 transition-colors duration-150 ease-out',
    active ? 'bg-hover' : 'hover:bg-hover/70',
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
        <span className="block truncate text-sm text-primary">Delete this chat?</span>
        <div className="mt-1.5 flex items-center gap-1.5">
          {/* Destructive action: neutral chrome, meaning carried by the label */}
          <button
            type="button"
            onClick={onDelete}
            className="rounded-md bg-elevated px-2 py-1 text-xs font-medium text-primary transition-colors duration-150 ease-out hover:bg-border"
          >
            Delete
          </button>
          <button
            ref={cancelRef}
            type="button"
            onClick={() => setMode('idle')}
            className="rounded-md px-2 py-1 text-xs text-secondary transition-colors duration-150 ease-out hover:bg-hover"
          >
            Cancel
          </button>
        </div>
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
          className="absolute left-1 top-[25%] h-[50%] w-[2.5px] animate-grow-y rounded-full bg-accent"
        />
      )}
      <button type="button" onClick={onSelect} className="block w-full min-w-0 text-left">
        <span
          className={cn(
            'block truncate text-sm transition-colors duration-150 ease-out',
            active ? 'font-medium text-primary' : 'text-secondary group-hover:text-primary',
          )}
        >
          {thread.title || 'New chat'}
        </span>
        <span className="mt-0.5 block truncate text-xs text-secondary">{meta}</span>
      </button>

      {/* Rename/delete — revealed on hover or keyboard focus */}
      <div className="absolute right-1.5 top-1.5 hidden items-center gap-0.5 group-hover:flex group-focus-within:flex">
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
