import type { Message, Thread } from './types'

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

/** Compact relative time for sidebar metadata: now / 5m / 3h / 2d / 1w / date. */
export function formatRelativeTime(ts: number): string {
  const minutes = Math.floor((Date.now() - ts) / 60_000)
  if (minutes < 1) return 'now'
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`
  if (days < 30) return `${Math.floor(days / 7)}w`
  return new Date(ts).toLocaleDateString()
}

export interface CodeArtifact {
  id: string
  language: string
  code: string
}

/** Extracts fenced code blocks from assistant messages — the workspace's raw material. */
export function extractCodeBlocks(messages: Message[]): CodeArtifact[] {
  const artifacts: CodeArtifact[] = []
  const fence = /```([\w-]*)\n([\s\S]*?)```/g
  for (const message of messages) {
    if (message.role !== 'assistant') continue
    for (const match of message.content.matchAll(fence)) {
      artifacts.push({
        id: `${message.id}-${artifacts.length}`,
        language: match[1] || 'text',
        code: match[2].replace(/\n$/, ''),
      })
    }
  }
  return artifacts
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
