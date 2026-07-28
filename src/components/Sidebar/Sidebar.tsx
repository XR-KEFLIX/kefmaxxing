import { useMemo, useState } from 'react'
import { Moon, PanelLeftClose, Search, Settings, SquarePen, Sun } from 'lucide-react'
import { useMiloStore } from '../../lib/store'
import type { Thread } from '../../lib/types'
import { IconButton } from '../ui/IconButton'
import { ThreadList } from './ThreadList'

interface SidebarProps {
  onCollapse: () => void
}

export function Sidebar({ onCollapse }: SidebarProps) {
  // Search query is ephemeral UI state; everything else lives in the store.
  const [query, setQuery] = useState('')

  const threads = useMiloStore((s) => s.threads)
  const threadOrder = useMiloStore((s) => s.threadOrder)
  const activeThreadId = useMiloStore((s) => s.activeThreadId)
  const theme = useMiloStore((s) => s.theme)
  const newChat = useMiloStore((s) => s.newChat)
  const selectThread = useMiloStore((s) => s.selectThread)
  const renameThread = useMiloStore((s) => s.renameThread)
  const deleteThread = useMiloStore((s) => s.deleteThread)
  const toggleTheme = useMiloStore((s) => s.toggleTheme)

  const orderedThreads = useMemo(
    () => threadOrder.map((id) => threads[id]).filter((t): t is Thread => Boolean(t)),
    [threads, threadOrder],
  )

  return (
    <aside className="flex h-full w-[240px] flex-col bg-sidebar">
      {/* 1. Brand lockup: wordmark + ember period — quiet, ownable, no logo box */}
      <div className="flex items-center justify-between p-3">
        <span className="flex items-baseline px-1 text-[15px] font-semibold leading-6">
          Milo
          <span aria-hidden="true" className="ml-[3px] inline-block h-[5px] w-[5px] rounded-full bg-accent" />
        </span>
        <IconButton label="Collapse sidebar" onClick={onCollapse}>
          <PanelLeftClose />
        </IconButton>
      </div>

      {/* 2. New chat — ghost row, no box */}
      <div className="px-3 pb-1">
        <button
          type="button"
          onClick={newChat}
          className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-secondary transition-colors duration-150 ease-out hover:bg-hover hover:text-primary"
        >
          <SquarePen className="h-4 w-4" />
          New chat
        </button>
      </div>

      {/* 3. Search — filled field, no border until focus */}
      <div className="px-3 pb-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
          <input
            id="milo-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chats"
            aria-label="Search chats"
            className="w-full rounded-lg border border-transparent bg-elevated py-1.5 pl-8 pr-3 text-[13px] text-primary outline-none transition-colors duration-150 ease-out placeholder:text-secondary focus:border-accent"
          />
        </div>
      </div>

      {/* 4. Thread list, grouped by date */}
      <nav aria-label="Chat history" className="flex-1 overflow-y-auto px-2 pb-2">
        <ThreadList
          threads={orderedThreads}
          query={query}
          activeThreadId={activeThreadId}
          onSelect={selectThread}
          onRename={renameThread}
          onDelete={deleteThread}
        />
      </nav>

      {/* 5. Footer — no separator; icons just rest on the surface */}
      <div className="flex items-center gap-1 px-2.5 pb-2.5 pt-1">
        <IconButton
          label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          onClick={toggleTheme}
        >
          {theme === 'dark' ? <Sun /> : <Moon />}
        </IconButton>
        <IconButton label="Settings">
          <Settings />
        </IconButton>
      </div>
    </aside>
  )
}
