import { useEffect, useState } from 'react'
import { PanelLeftOpen, SquarePen } from 'lucide-react'
import { ChatArea } from './components/Chat/ChatArea'
import { EmptyState } from './components/Chat/EmptyState'
import { Composer } from './components/Composer/Composer'
import { Sidebar } from './components/Sidebar/Sidebar'
import { IconButton } from './components/ui/IconButton'
import { CANNED_RESPONSE } from './lib/mockStream'
import type { Message } from './lib/types'
import { cn } from './lib/utils'

const SIDEBAR_KEY = 'milo.sidebarOpen'

/**
 * Stage 2 demo conversation — replaced by the zustand store in Stage 3.
 * Two exchanges: the first assistant message is the canned ~500-word markdown
 * response (rendering showcase); the last one is stuck in `streaming` status
 * to demo the blinking cursor.
 */
const HOUR = 60 * 60 * 1000
const demoNow = Date.now()
const MOCK_MESSAGES: Message[] = [
  {
    id: 'demo-1',
    role: 'user',
    content:
      'I need to structure a medium-sized TypeScript React app. What layout scales without becoming a mess?',
    createdAt: demoNow - 2 * HOUR,
  },
  {
    id: 'demo-2',
    role: 'assistant',
    content: CANNED_RESPONSE,
    createdAt: demoNow - 2 * HOUR + 60_000,
    status: 'done',
  },
  {
    id: 'demo-3',
    role: 'user',
    content: 'Thanks — can you trim the examples down to the essentials?',
    createdAt: demoNow - 5 * 60_000,
  },
  {
    id: 'demo-4',
    role: 'assistant',
    content:
      'Sure — the essentials are: **feature folders** over type folders, one store per domain, and derived data in selectors (never in state). Everything else is refinement.',
    createdAt: demoNow - 4 * 60_000,
    status: 'streaming',
  },
]

export default function App() {
  // Stage 1–2: plain local state. All of this moves into the zustand store in Stage 3.
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SIDEBAR_KEY) !== 'false'
    } catch {
      return true // storage unavailable — default to open
    }
  })
  // Visual selection only, so the active-thread style is reviewable.
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null)
  // Stage 2: messages in local state so the composer really appends on send.
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES)

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_KEY, String(sidebarOpen))
    } catch {
      // storage unavailable (private mode) — ignore
    }
  }, [sidebarOpen])

  function handleSend(text: string) {
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: 'user', content: text, createdAt: Date.now() },
    ])
  }

  const hasMessages = messages.length > 0

  return (
    <div className="flex h-full bg-bg text-primary">
      {/* Sidebar: 260px, collapses to 0 with a 200ms ease-out width transition */}
      <div
        className={cn(
          'shrink-0 overflow-hidden transition-[width] duration-200 ease-out',
          sidebarOpen ? 'w-[260px]' : 'w-0',
        )}
      >
        <Sidebar
          activeThreadId={activeThreadId}
          onSelectThread={setActiveThreadId}
          onCollapse={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main area */}
      <main className="relative flex min-w-0 flex-1 flex-col">
        {/* Floating hamburger + new chat pair, only when the sidebar is collapsed */}
        {!sidebarOpen && (
          <div className="absolute left-3 top-3 z-10 flex items-center gap-1">
            <IconButton label="Open sidebar" onClick={() => setSidebarOpen(true)}>
              <PanelLeftOpen />
            </IconButton>
            {/* Decorative until Stage 3 (new chat logic) */}
            <IconButton label="New chat">
              <SquarePen />
            </IconButton>
          </div>
        )}

        {hasMessages ? (
          <>
            {/* Conversation: scroll region, then composer fixed at bottom */}
            <ChatArea messages={messages} />
            <div className="shrink-0 px-6 pb-4 pt-2">
              <div className="mx-auto w-full max-w-content">
                <Composer onSend={handleSend} />
              </div>
            </div>
          </>
        ) : (
          /* Empty state: greeting + composer, vertically centered as one block */
          <div className="flex flex-1 items-center justify-center overflow-y-auto px-6 py-10">
            <div className="w-full max-w-content">
              <EmptyState />
              <div className="mt-6">
                <Composer onSend={handleSend} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
