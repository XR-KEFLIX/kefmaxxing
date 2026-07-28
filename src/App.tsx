import { useEffect } from 'react'
import { PanelLeftOpen, SquarePen } from 'lucide-react'
import { ChatArea } from './components/Chat/ChatArea'
import { EmptyState } from './components/Chat/EmptyState'
import { Composer } from './components/Composer/Composer'
import { Sidebar } from './components/Sidebar/Sidebar'
import { IconButton } from './components/ui/IconButton'
import { useMiloStore } from './lib/store'
import type { Message } from './lib/types'
import { cn } from './lib/utils'

const NO_MESSAGES: Message[] = []

export default function App() {
  const sidebarOpen = useMiloStore((s) => s.sidebarOpen)
  const setSidebarOpen = useMiloStore((s) => s.setSidebarOpen)
  const newChat = useMiloStore((s) => s.newChat)
  const sendMessage = useMiloStore((s) => s.sendMessage)
  const stopStreaming = useMiloStore((s) => s.stopStreaming)
  const streamingThreadId = useMiloStore((s) => s.streamingThreadId)
  const theme = useMiloStore((s) => s.theme)
  const activeThreadId = useMiloStore((s) => s.activeThreadId)
  const activeMessages = useMiloStore((s) => {
    const id = s.activeThreadId
    return id && s.threads[id] ? s.threads[id].messages : undefined
  })

  // Theme: swap the `.dark` class on <html>; the CSS-var tokens do the rest.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  // Shortcuts: Cmd/Ctrl+Shift+O new chat · Cmd/Ctrl+K focus search · Esc blur composer
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey
      if (mod && e.shiftKey && e.key.toLowerCase() === 'o') {
        e.preventDefault()
        newChat()
      } else if (mod && !e.shiftKey && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSidebarOpen(true)
        requestAnimationFrame(() => document.getElementById('milo-search')?.focus())
      } else if (e.key === 'Escape' && document.activeElement instanceof HTMLTextAreaElement) {
        document.activeElement.blur()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [newChat, setSidebarOpen])

  const messages = activeMessages ?? NO_MESSAGES
  const hasMessages = messages.length > 0
  const streaming = streamingThreadId !== null

  return (
    <div className="flex h-full bg-bg text-primary">
      {/* Sidebar: 260px, collapses to 0 with a 200ms ease-out width transition */}
      <div
        className={cn(
          'shrink-0 overflow-hidden transition-[width] duration-200 ease-out',
          sidebarOpen ? 'w-[260px]' : 'w-0',
        )}
      >
        <Sidebar onCollapse={() => setSidebarOpen(false)} />
      </div>

      {/* Main area */}
      <main className="relative flex min-w-0 flex-1 flex-col">
        {/* Floating hamburger + new chat pair, only when the sidebar is collapsed */}
        {!sidebarOpen && (
          <div className="absolute left-3 top-3 z-10 flex items-center gap-1">
            <IconButton label="Open sidebar" onClick={() => setSidebarOpen(true)}>
              <PanelLeftOpen />
            </IconButton>
            <IconButton label="New chat" onClick={newChat}>
              <SquarePen />
            </IconButton>
          </div>
        )}

        {hasMessages ? (
          <>
            {/* Conversation: scroll region (remounted per thread), composer fixed at bottom */}
            <ChatArea key={activeThreadId ?? 'none'} messages={messages} />
            <div className="shrink-0 px-6 pb-4 pt-2">
              <div className="mx-auto w-full max-w-content">
                <Composer onSend={sendMessage} streaming={streaming} onStop={stopStreaming} />
              </div>
            </div>
          </>
        ) : (
          /* Empty state: greeting + composer, vertically centered as one block */
          <div className="flex flex-1 items-center justify-center overflow-y-auto px-6 py-10">
            <div className="w-full max-w-content">
              <EmptyState />
              <div className="mt-6">
                <Composer onSend={sendMessage} streaming={streaming} onStop={stopStreaming} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
