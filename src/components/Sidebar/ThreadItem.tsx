import { Pencil, Trash2 } from 'lucide-react'
import type { Thread } from '../../lib/types'
import { cn } from '../../lib/utils'
import { IconButton } from '../ui/IconButton'

interface ThreadItemProps {
  thread: Thread
  active: boolean
  onSelect: () => void
}

export function ThreadItem({ thread, active, onSelect }: ThreadItemProps) {
  return (
    <div
      className={cn(
        'group flex h-9 items-center rounded-lg pl-3 pr-1 transition-colors duration-150 ease-out',
        active ? 'bg-accent-subtle' : 'hover:bg-hover',
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-current={active ? 'page' : undefined}
        className="min-w-0 flex-1 truncate text-left text-sm text-primary"
      >
        {thread.title || 'New chat'}
      </button>

      {/* Rename/delete — revealed on hover or keyboard focus; wired in Stage 3 */}
      <div className="ml-1 hidden shrink-0 items-center gap-0.5 group-hover:flex group-focus-within:flex">
        <IconButton label="Rename chat" className="p-1 hover:text-accent">
          <Pencil />
        </IconButton>
        <IconButton label="Delete chat" className="p-1 hover:text-accent">
          <Trash2 />
        </IconButton>
      </div>
    </div>
  )
}
