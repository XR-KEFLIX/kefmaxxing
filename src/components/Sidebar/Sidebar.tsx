import { useMemo, useState } from 'react'
import { Github, Moon, PanelLeftClose, Search, SquarePen, Sun } from 'lucide-react'
import { useMiloStore } from '../../lib/store'
import { IconButton } from '../ui/IconButton'
import { ThreadList } from './ThreadList'

/**
 * Attached sidebar — 240px, flush against the left edge, tone-separated from
 * the chat (no border line). Brand lockup + collapse, new chat, borderless
 * search, conversation cards grouped by date, footer with GitHub + theme.
 * Architecture stays classic; the quality is in spacing, type and states.
 */
export function Sidebar({ onCollapse }: { onCollapse: () => void }) {
  const threads = useMiloStore((s) => s.threads)
  const threadOrder = useMiloStore((s) => s.threadOrder)
  const activeThreadId = useMiloStore((s) => s.activeThreadId)
  const selectThread = useMiloStore((s) => s.selectThread)
  const newChat = useMiloStore((s) => s.newChat)
  const renameThread = useMiloStore((s) => s.renameThread)
  const deleteThread = useMiloStore((s) => s.deleteThread)
  const theme = useMiloStore((s) => s.theme)
  const toggleTheme = useMiloStore((s) => s.toggleTheme)
  const [query, setQuery] = useState('')

  const ordered = useMemo(
    () => threadOrder.map((id) => threads[id]).filter(Boolean),
    [threads, threadOrder],
  )

  return (
    <aside className="flex h-full w-[240px] flex-col bg-sidebar">
      {/* Brand lockup + collapse */}
      <div className="flex items-center justify-between px-3.5 pb-1 pt-3.5">
        <div className="flex items-center gap-1.5 px-1" aria-label="Milo">
          <span className="text-[15px] font-semibold tracking-[-0.02em] text-primary">Milo</span>
          <span className="h-[5px] w-[5px] rounded-full bg-accent" aria-hidden="true" />
        </div>
        <IconButton label="Close sidebar" onClick={onCollapse} className="hover:text-primary">
          <PanelLeftClose />
        </IconButton>
      </div>

      {/* New chat */}
      <div className="px-2">
        <button
          type="button"
          onClick={newChat}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-secondary transition-colors duration-150 ease-out hover:bg-hover hover:text-primary"
        >
          <SquarePen className="h-4 w-4" />
          New chat
        </button>
      </div>

      {/* Search — borderless filled field */}
      <div className="px-2 pt-1.5">
        <div className="flex h-9 items-center gap-2 rounded-xl bg-elevated px-2.5">
          <Search className="h-4 w-4 shrink-0 text-secondary" aria-hidden="true" />
          <input
            id="milo-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chats"
            aria-label="Search chats"
            className="w-full min-w-0 bg-transparent text-[13px] text-primary placeholder:text-secondary focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
        </div>
      </div>

      {/* Conversations */}
      <div className="mt-1 flex-1 overflow-y-auto px-2 pb-2">
        <ThreadList
          threads={ordered}
          query={query}
          activeThreadId={activeThreadId}
          onSelect={selectThread}
          onRename={renameThread}
          onDelete={deleteThread}
        />
      </div>

      {/* Footer — GitHub + theme, no separator line */}
      <div className="flex items-center justify-end gap-1 px-2.5 py-2.5">
        <a
          href="https://github.com/160spiral-bit/milo-ai"
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub repository"
          title="GitHub repository"
          className="inline-flex items-center justify-center rounded-full p-1.5 text-secondary transition-colors duration-150 ease-out hover:bg-hover hover:text-primary [&_svg]:h-4 [&_svg]:w-4"
        >
          <Github />
        </a>
        <IconButton
          label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          onClick={toggleTheme}
          className="hover:text-primary"
        >
          {theme === 'dark' ? <Sun /> : <Moon />}
        </IconButton>
      </div>
    </aside>
  )
}
