import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { streamResponse } from './mockStream'
import type { Message, Thread } from './types'
import { deriveTitle } from './utils'

/**
 * All app state lives here (spec). Threads + UI prefs persist to localStorage
 * via zustand/persist; derived data (grouped/sorted lists) is computed in
 * selectors/components, never stored.
 *
 * The ONLY mock dependency is streamResponse from ./mockStream — to go live,
 * replace that one function with a real streaming call (see api/chat.js).
 */
interface MiloState {
  threads: Record<string, Thread>
  threadOrder: string[]
  activeThreadId: string | null
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  /** Thread currently receiving a stream (at most one at a time). Not persisted. */
  streamingThreadId: string | null

  newChat: () => void
  selectThread: (id: string) => void
  renameThread: (id: string, title: string) => void
  deleteThread: (id: string) => void
  setSidebarOpen: (open: boolean) => void
  toggleTheme: () => void
  sendMessage: (text: string) => void
  stopStreaming: () => void
  retryLast: () => void

  // Stream plumbing — internal, components should not call these.
  appendToken: (threadId: string, messageId: string, token: string) => void
  finishStream: (threadId: string, messageId: string) => void
}

/** Active stream's abort handle — module scope, never serialized. */
let activeController: AbortController | null = null

/** First-load default: follow the OS preference (persisted value wins after that). */
function systemTheme(): 'light' | 'dark' {
  return typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

/** Storage that never throws: denied access or corrupt data → empty state + warning. */
const safeStorage = {
  getItem: (name: string): string | null => {
    try {
      return localStorage.getItem(name)
    } catch {
      console.warn('[milo] localStorage read failed — starting with empty state')
      return null
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      localStorage.setItem(name, value)
    } catch {
      // storage full or denied — the session continues unpersisted
    }
  },
  removeItem: (name: string): void => {
    try {
      localStorage.removeItem(name)
    } catch {
      // ignore
    }
  },
}

export const useMiloStore = create<MiloState>()(
  persist(
    (set, get) => ({
      threads: {},
      threadOrder: [],
      activeThreadId: null,
      sidebarOpen: true,
      theme: systemTheme(),
      streamingThreadId: null,

      newChat: () => set({ activeThreadId: null }),

      selectThread: (id) => {
        if (get().threads[id]) set({ activeThreadId: id })
      },

      renameThread: (id, title) => {
        const clean = title.trim().replace(/\s+/g, ' ')
        if (!clean) return
        set((s) => {
          const thread = s.threads[id]
          if (!thread) return {}
          return { threads: { ...s.threads, [id]: { ...thread, title: clean } } }
        })
      },

      deleteThread: (id) => {
        if (get().streamingThreadId === id) get().stopStreaming()
        set((s) => {
          if (!s.threads[id]) return {}
          const threads = { ...s.threads }
          delete threads[id]
          return {
            threads,
            threadOrder: s.threadOrder.filter((tid) => tid !== id),
            // Conservative: deleting the active thread returns to the empty state.
            activeThreadId: s.activeThreadId === id ? null : s.activeThreadId,
          }
        })
      },

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),

      sendMessage: (text) => {
        const content = text.trim()
        if (!content || get().streamingThreadId) return // one stream at a time

        const now = Date.now()
        const activeId = get().activeThreadId
        const existing = activeId ? get().threads[activeId] : undefined
        const threadId = existing?.id ?? crypto.randomUUID()
        const assistantId = crypto.randomUUID()

        const userMessage: Message = {
          id: crypto.randomUUID(),
          role: 'user',
          content,
          createdAt: now,
        }
        const assistantMessage: Message = {
          id: assistantId,
          role: 'assistant',
          content: '',
          createdAt: now,
          status: 'streaming',
        }

        set((s) => {
          const base = s.threads[threadId]
          const thread: Thread = base
            ? {
                ...base,
                title:
                  base.title === 'New chat' || base.title === ''
                    ? deriveTitle(content)
                    : base.title,
                messages: [...base.messages, userMessage, assistantMessage],
                updatedAt: now,
              }
            : {
                id: threadId,
                title: deriveTitle(content),
                messages: [userMessage, assistantMessage],
                createdAt: now,
                updatedAt: now,
              }
          return {
            threads: { ...s.threads, [threadId]: thread },
            threadOrder: [threadId, ...s.threadOrder.filter((id) => id !== threadId)],
            activeThreadId: threadId,
            streamingThreadId: threadId,
          }
        })

        startStream(get, threadId, assistantId)
      },

      stopStreaming: () => {
        activeController?.abort()
      },

      retryLast: () => {
        const s = get()
        const threadId = s.activeThreadId
        if (!threadId || s.streamingThreadId) return
        const thread = s.threads[threadId]
        const lastAssistant = thread
          ? [...thread.messages].reverse().find((m) => m.role === 'assistant')
          : undefined
        if (!thread || !lastAssistant) return

        const now = Date.now()
        const replacement: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: '',
          createdAt: now,
          status: 'streaming',
        }
        set((st) => {
          const t = st.threads[threadId]
          if (!t) return {}
          return {
            threads: {
              ...st.threads,
              [threadId]: {
                ...t,
                messages: t.messages.map((m) => (m.id === lastAssistant.id ? replacement : m)),
                updatedAt: now,
              },
            },
            streamingThreadId: threadId,
          }
        })
        startStream(get, threadId, replacement.id)
      },

      appendToken: (threadId, messageId, token) =>
        set((s) => {
          const thread = s.threads[threadId]
          if (!thread) return {}
          return {
            threads: {
              ...s.threads,
              [threadId]: {
                ...thread,
                messages: thread.messages.map((m) =>
                  m.id === messageId ? { ...m, content: m.content + token } : m,
                ),
              },
            },
          }
        }),

      finishStream: (threadId, messageId) =>
        set((s) => {
          const thread = s.threads[threadId]
          if (!thread) return { streamingThreadId: null }
          return {
            streamingThreadId: null,
            threads: {
              ...s.threads,
              [threadId]: {
                ...thread,
                messages: thread.messages.map((m) =>
                  m.id === messageId ? { ...m, status: 'done' as const } : m,
                ),
              },
            },
          }
        }),
    }),
    {
      name: 'milo-store',
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => ({
        threads: s.threads,
        threadOrder: s.threadOrder,
        activeThreadId: s.activeThreadId,
        sidebarOpen: s.sidebarOpen,
        theme: s.theme,
      }),
      onRehydrateStorage: () => (state) => {
        // A stream can't survive a reload — mark interrupted messages done.
        if (!state) return
        state.streamingThreadId = null
        for (const thread of Object.values(state.threads)) {
          for (const message of thread.messages) {
            if (message.status === 'streaming') message.status = 'done'
          }
        }
      },
    },
  ),
)

function startStream(get: () => MiloState, threadId: string, messageId: string) {
  const controller = new AbortController()
  activeController = controller
  void streamResponse(
    (token) => get().appendToken(threadId, messageId, token),
    controller.signal,
  ).then(() => {
    if (activeController === controller) activeController = null
    get().finishStream(threadId, messageId)
  })
}
