import type { Thread } from './types'

/** Tiny classnames joiner (clsx-lite, no extra dependency). */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}

export type GroupLabel = 'Today' | 'Yesterday' | 'Previous 7 days' | 'Older'

/** Thread title from the first user message: 40 chars max, ellipsis if cut. */
export function deriveTitle(text: string): string {
  const clean = text.trim().replace(/\s+/g, ' ')
  if (!clean) return 'New chat'
  return clean.length > 40 ? `${clean.slice(0, 40).trimEnd()}…` : clean
}

export interface ThreadGroup {
  label: GroupLabel
  threads: Thread[]
}

const GROUP_ORDER: GroupLabel[] = ['Today', 'Yesterday', 'Previous 7 days', 'Older']
const DAY_MS = 24 * 60 * 60 * 1000

function startOfDay(ts: number): number {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

/**
 * Groups threads by calendar day into Today / Yesterday / Previous 7 days / Older.
 * Threads are sorted by updatedAt, newest first. Empty groups are omitted.
 */
export function groupThreadsByDate(threads: Thread[]): ThreadGroup[] {
  const buckets: Record<GroupLabel, Thread[]> = {
    Today: [],
    Yesterday: [],
    'Previous 7 days': [],
    Older: [],
  }
  const today = startOfDay(Date.now())

  for (const thread of [...threads].sort((a, b) => b.updatedAt - a.updatedAt)) {
    const dayDiff = Math.round((today - startOfDay(thread.updatedAt)) / DAY_MS)
    const label: GroupLabel =
      dayDiff <= 0
        ? 'Today'
        : dayDiff === 1
          ? 'Yesterday'
          : dayDiff <= 7
            ? 'Previous 7 days'
            : 'Older'
    buckets[label].push(thread)
  }

  return GROUP_ORDER.filter((label) => buckets[label].length > 0).map((label) => ({
    label,
    threads: buckets[label],
  }))
}
