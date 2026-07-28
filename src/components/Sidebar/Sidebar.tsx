import { useMemo, useState } from 'react'
import { PanelLeftClose, PanelLeftOpen, Search, Settings, SquarePen } from 'lucide-react'
import { useMiloStore } from '../../lib/store'
import { cn } from '../../lib/utils'
import { IconButton } from '../ui/IconButton'
import { ThreadList } from './ThreadList'

/**
 * The navigation rail — a floating object, not a welded panel.
 * 280px expanded / 72px collapsed, detached from the browser edges by the
 * app-level air, 20px corners, soft elevation. Expanded shows conversation
 * cards; collapsed shows mini-cards (title initials) so threads stay
 * re-enterable. Bottom: profile + settings.
 */
export function Sidebar() {
  const expanded = useMiloStore((s) => s.sidebarOpen)
  const setSidebarOpen = useMiloStore((s) => s.setSidebarOpen)
  const threads = useMiloStore((s) => s.threads)
  const threadOrder = useMiloStore((s) => s.threadOrder)
  const activeThreadId = useMiloStore((s) => s.activeThreadId)
  const selectThread = useMiloStore((s) => s.selectThread)
  const newChat = useMiloStore((s) => s.newChat)
  const renameThread = useMiloStore((s) => s.renameThread)
  const deleteThread = useMiloStore((s) => s.deleteThread)
  const [query, setQuery] = useState('')

  const ordered = useMemo(
    () => threadOrder.map((id) => threads[id]).filter(Boolean),
    [threads, threadOrder],
  )

  return (
    <aside className="flex h-full w-full flex-col rounded-surface bg-sidebar p-3 shadow-composer">
      {/* Top: Milo mark + collapse toggle */}
      <div className={cn('flex items-center', expanded ? 'justify-between px-1.5 py-1' : 'flex-col gap-2 py-1')}>
        {expanded ? (
          <div className="flex items-center gap-1.5" aria-label="Milo">
            <span className="text-[15px] font-semibold tracking-[-0.02em] text-primary">Milo</span>
            <span className="h-[5px] w-[5px] rounded-full bg-accent" aria-hidden="true" />
          </div>
        ) : (
          <span className="grid h-8 w-8 place-items-center" aria-label="Milo">
            <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
          </span>
        )}
        <IconButton
          label={expanded ? 'Collapse rail' : 'Expand rail'}
          onClick={() => setSidebarOpen(!expanded)}
          className="hover:text-primary"
        >
          {expanded ? <PanelLeftClose /> : <PanelLeftOpen />}
        </IconButton>
      </div>

      {/* New chat */}
      {expanded ? (
        <button
          type="button"
          onClick={newChat}
          className="mt-2 flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-secondary transition-colors duration-150 ease-out hover:bg-hover hover:text-primary"
        >
          <SquarePen className="h-4 w-4" />
          New chat
        </button>
      ) : (
        <div className="mt-2 flex justify-center">
          <IconButton
            label="New chat"
            onClick={newChat}
            className="h-10 w-10 rounded-xl bg-elevated hover:bg-hover hover:text-primary"
          >
            <SquarePen />
          </IconButton>
        </div>
      )}

      {/* Search — expanded only */}
      {expanded && (
        <div className="mt-2 flex h-9 items-center gap-2 rounded-xl bg-elevated px-2.5 transition-colors duration-150 ease-out">
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
      )}

      {/* Middle: conversation cards */}
      <div className="mt-2 flex-1 overflow-y-auto">
        {expanded ? (
          <ThreadList
            threads={ordered}
            query={query}
            activeThreadId={activeThreadId}
            onSelect={selectThread}
            onRename={renameThread}
            onDelete={deleteThread}
          />
        ) : (
          /* Collapsed: mini-cards — first letter of the title, like Arc favicons */
          <div className="flex flex-col items-center gap-1.5 pt-2">
            {ordered.slice(0, 10).map((thread) => (
              <button
                key={thread.id}
                type="button"
                title={thread.title || 'New chat'}
                onClick={() => selectThread(thread.id)}
                className={cn(
                  'grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[13px] font-medium transition-all duration-150 ease-out',
                  thread.id === activeThreadId
                    ? 'bg-hover text-primary shadow-card'
                    : 'bg-elevated text-secondary hover:bg-hover hover:text-primary hover:shadow-card',
                )}
              >
                {(thread.title || 'N')[0].toUpperCase()}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom: profile + settings */}
      <div
        className={cn(
          'mt-2 flex items-center gap-1 pt-2',
          expanded ? 'justify-between px-1' : 'flex-col',
        )}
      >
        <div className="flex items-center gap-2" title="You">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-elevated text-[11px] font-medium text-secondary">
            Y
          </span>
          {expanded && <span className="text-sm text-secondary">You</span>}
        </div>
        <IconButton label="Settings (coming soon)" className="hover:text-primary">
          <Settings />
        </IconButton>
      </div>
    </aside>
  )
}
