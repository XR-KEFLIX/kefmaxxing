import { useState } from 'react'
import { Moon, PanelLeftClose, Search, Settings, SquarePen } from 'lucide-react'
import { IconButton } from '../ui/IconButton'
import { ThreadList } from './ThreadList'

interface SidebarProps {
  activeThreadId: string | null
  onSelectThread: (id: string) => void
  onCollapse: () => void
}

export function Sidebar({ activeThreadId, onSelectThread, onCollapse }: SidebarProps) {
  // Live search is local state in Stage 1 (static data); moves to the store in Stage 3.
  const [query, setQuery] = useState('')

  return (
    <aside className="flex h-full w-[260px] flex-col border-r border-border bg-sidebar">
      {/* 1. Wordmark + collapse control */}
      <div className="flex items-center justify-between p-4">
        <span className="text-base font-semibold leading-6">Milo</span>
        <IconButton label="Collapse sidebar" onClick={onCollapse}>
          <PanelLeftClose />
        </IconButton>
      </div>

      {/* 2. New chat (decorative until Stage 3) */}
      <div className="px-4 pb-2">
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-primary transition-colors duration-150 ease-out hover:bg-hover"
        >
          <SquarePen className="h-4 w-4 text-secondary" />
          New chat
        </button>
      </div>

      {/* 3. Search — filters the thread list live as you type */}
      <div className="px-4 pb-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chats"
            aria-label="Search chats"
            className="w-full rounded-lg border border-border bg-bg py-1.5 pl-8 pr-3 text-[13px] text-primary outline-none transition-colors duration-150 ease-out placeholder:text-secondary focus:border-border-strong"
          />
        </div>
      </div>

      {/* 4. Thread list, grouped by date */}
      <nav aria-label="Chat history" className="flex-1 overflow-y-auto px-2 pb-2">
        <ThreadList query={query} activeThreadId={activeThreadId} onSelect={onSelectThread} />
      </nav>

      {/* 5. Footer — theme toggle is wired in Stage 4; settings is decorative in v1 */}
      <div className="flex items-center gap-1 border-t border-border p-3">
        <IconButton label="Toggle theme">
          <Moon />
        </IconButton>
        <IconButton label="Settings">
          <Settings />
        </IconButton>
      </div>
    </aside>
  )
}
