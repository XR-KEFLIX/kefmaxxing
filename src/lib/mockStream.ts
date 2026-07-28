/**
 * Mock generation lives ONLY in this file.
 *
 * Stage 2: exports CANNED_RESPONSE, the ~500-word markdown sample used by the
 * demo conversation (rendering showcase: intro, two headings, a list, a table,
 * one TS code block, closing paragraph).
 *
 * Stage 3: adds streamResponse(onToken, signal) — token-by-token emission with
 * jitter + AbortSignal support. That is the single integration point a real
 * streaming API will replace (the real backend already exists at api/chat.js).
 */
export const CANNED_RESPONSE = `A good React + TypeScript structure optimizes for one thing: how fast a new developer can find the file they need. The layouts that scale are organized around **features**, not around technical types. When every screen, hook, and test for a domain lives in one folder, the codebase stays navigable as it grows.

## Feature folders over type folders

The classic beginner layout splits code by kind — \`components/\`, \`hooks/\`, \`utils/\` — and it collapses the moment you have more than a dozen features. Instead, group by domain:

- \`features/chat/\` — everything the chat screen needs: components, hooks, local types
- \`features/sidebar/\` — thread list, search, and grouping logic
- \`lib/\` — genuinely shared primitives only (date formatting, class helpers)
- \`store/\` — one zustand store per domain, never a single global blob
- \`app/\` — routing, providers, and the root layout

The rule of thumb: if deleting a feature means deleting one folder and two import lines, the structure is healthy. If it means an afternoon of archaeology, it isn't.

## State and data flow

Keep state as close to its consumer as possible, and lift it only when two siblings truly need to share it. Server data and UI state are different species — mixing them in one store is how synchronization bugs are born. A useful division of labor:

| Concern | Where it lives | Notes |
| --- | --- | --- |
| Server data | API layer + cache | Fetch, retry, and cache in one place |
| UI state | Component or domain store | Sidebar open, drafts, selections |
| Derived data | Selectors, computed on read | Never store what you can compute |
| Cross-cutting config | Context, once | Theme, locale — changes rarely |

Here is the pattern in miniature — a domain store with a selector, so components subscribe to exactly what they render:

\`\`\`ts
import { create } from 'zustand'

type Thread = { id: string; title: string; updatedAt: number }

type ChatStore = {
  threads: Record<string, Thread>
  activeId: string | null
  select: (id: string) => void
}

export const useChatStore = create<ChatStore>((set) => ({
  threads: {},
  activeId: null,
  select: (id) => set({ activeId: id }),
}))

// Selector: derive the sorted list on read, not in state
export const useSortedThreads = () =>
  useChatStore((s) =>
    Object.values(s.threads).sort((a, b) => b.updatedAt - a.updatedAt),
  )
\`\`\`

Notice what is *not* stored: the sorted list. Storing derived data creates two sources of truth, and they will eventually disagree in production, during a demo.

This layout keeps refactors cheap and code review fast, because the blast radius of any change is one folder. Start with features, keep shared code honest, and let the structure enforce the discipline for you.`
