import type { Thread } from '../../lib/types'
import { groupThreadsByDate } from '../../lib/utils'
import { ThreadItem } from './ThreadItem'

interface ThreadListProps {
  threads: Thread[]
  query: string
  activeThreadId: string | null
  onSelect: (id: string) => void
  onRename: (id: string, title: string) => void
  onDelete: (id: string) => void
}

export function ThreadList({
  threads,
  query,
  activeThreadId,
  onSelect,
  onRename,
  onDelete,
}: ThreadListProps) {
  const q = query.trim().toLowerCase()
  const visible = q ? threads.filter((t) => t.title.toLowerCase().includes(q)) : threads
  const groups = groupThreadsByDate(visible)

  if (groups.length === 0) {
    return (
      <p className="px-3 py-6 text-[13px] text-secondary">
        {threads.length === 0
          ? 'No chats yet — start a new chat to begin.'
          : 'No chats match your search.'}
      </p>
    )
  }

  return (
    <div>
      {groups.map((group) => (
        <section key={group.label} className="pt-4 first:pt-1">
          <h2 className="px-3 pb-1 text-xs font-medium uppercase tracking-wide text-secondary">
            {group.label}
          </h2>
          <ul>
            {group.threads.map((thread) => (
              <li key={thread.id}>
                <ThreadItem
                  thread={thread}
                  active={thread.id === activeThreadId}
                  onSelect={() => onSelect(thread.id)}
                  onRename={(title) => onRename(thread.id, title)}
                  onDelete={() => onDelete(thread.id)}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
