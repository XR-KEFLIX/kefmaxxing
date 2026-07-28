import type { Thread } from '../../lib/types'
import { groupThreadsByDate } from '../../lib/utils'
import { ThreadItem } from './ThreadItem'

/**
 * Stage 1 static data — replaced by the zustand store in Stage 3.
 * Timestamps are relative to "now" so all four date groups are represented.
 */
const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR
const now = Date.now()

function mockThread(id: string, title: string, ageMs: number): Thread {
  return { id, title, messages: [], createdAt: now - ageMs, updatedAt: now - ageMs }
}

const MOCK_THREADS: Thread[] = [
  mockThread('mock-1', 'Auth patterns for the API gateway', 2 * HOUR),
  mockThread('mock-2', 'Draft launch announcement', 6 * HOUR),
  mockThread('mock-3', 'Rate limiting strategy', 26 * HOUR),
  mockThread('mock-4', 'Migrate Postgres to v16', 3 * DAY),
  mockThread('mock-5', 'Onboarding email copy review', 5 * DAY),
  mockThread('mock-6', 'Rust vs Go for the worker service', 6 * DAY + 4 * HOUR),
  mockThread('mock-7', '2024 reading list', 20 * DAY),
  mockThread('mock-8', 'Home server setup', 45 * DAY),
]

interface ThreadListProps {
  query: string
  activeThreadId: string | null
  onSelect: (id: string) => void
}

export function ThreadList({ query, activeThreadId, onSelect }: ThreadListProps) {
  const q = query.trim().toLowerCase()
  const visible = q
    ? MOCK_THREADS.filter((t) => t.title.toLowerCase().includes(q))
    : MOCK_THREADS
  const groups = groupThreadsByDate(visible)

  if (groups.length === 0) {
    return <p className="px-3 py-6 text-[13px] text-secondary">No chats match your search.</p>
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
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
