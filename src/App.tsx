import { useEffect } from 'react'
import { PanelLeftOpen, PanelRightOpen, SquarePen } from 'lucide-react'
import { ChatArea } from './components/Chat/ChatArea'
import { EmptyState } from './components/Chat/EmptyState'
import { Composer } from './components/Composer/Composer'
import { Sidebar } from './components/Sidebar/Sidebar'
import { Workspace } from './components/Workspace/Workspace'
import { IconButton } from './components/ui/IconButton'
import { useMiloStore } from './lib/store'
import type { Message } from './lib/types'
import { cn } from './lib/utils'

const NO_MESSAGES: Message[] = []

/**
 * Classic architecture, exceptional execution: attached sidebar on the left,
 * chat fills the rest, workspace panel docks on the right. No floating
 * panels, no experimental layout — the quality lives in typography,
 * spacing, states, and component craft.
 */
export default function App() {
  const sidebarOpen = useMiloStore((s) => s.sidebarOpen)
  const setSidebarOpen = useMiloStore((s) => s.setSidebarOpen)
  const newChat = useMiloStore((s) => s.newChat)
  const sendMessage = useMiloStore((s) => s.sendMessage)
  const stopStreaming = useMiloStore((s) => s.stopStreaming)
  const streamingThreadId = useMiloStore((s) => s.streamingThreadId)
  const theme = useMiloStore((s) => s.theme)
  const activeThreadId = useMiloStore((s) => s.activeThreadId)
  const workspaceOpen = useMiloStore((s) => s.workspaceOpen)
  const setWorkspaceOpen = useMiloStore((s) => s.setWorkspaceOpen)
  const activeMessages = useMiloStore((s) => {
    const id = s.activeThreadId
    return id && s.threads[id] ? s.threads[id].messages : undefined
  })

  // Theme: dark is default; swap a `.light` class on <html> for the light theme.
  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light')
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
      {/* Attached sidebar — 240px, collapses to 0 with a 200ms width transition */}
      <div
        className={cn(
          'shrink-0 overflow-hidden transition-[width] duration-200 ease-out',
          sidebarOpen ? 'w-[240px]' : 'w-0',
        )}
      >
        <Sidebar onCollapse={() => setSidebarOpen(false)} />
      </div>

      <main className="relative flex min-w-0 flex-1">
        {/* Floating hamburger + new chat pair, only when the sidebar is collapsed */}
        {!sidebarOpen && (
          <div className="absolute left-3 top-3 z-10 flex items-center gap-1">
            <IconButton
              label="Open sidebar"
              onClick={() => setSidebarOpen(true)}
              className="bg-elevated shadow-composer hover:text-primary"
            >
              <PanelLeftOpen />
            </IconButton>
            <IconButton
              label="New chat"
              onClick={newChat}
              className="bg-elevated shadow-composer hover:text-primary"
            >
              <SquarePen />
            </IconButton>
          </div>
        )}

        {/* Chat column */}
        <div className="flex min-w-0 flex-1 flex-col">
          {hasMessages ? (
            <>
              <ChatArea key={activeThreadId ?? 'none'} messages={messages} />
              <div className="shrink-0 px-6 pb-4 pt-2">
                <div className="mx-auto w-full max-w-content">
                  <Composer onSend={sendMessage} streaming={streaming} onStop={stopStreaming} />
                  <p className="mt-2 text-center text-xs text-secondary">
                    Milo can make mistakes. Check important info.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <EmptyState />
          )}
        </div>

        {/* Right-side workspace — Milo's differentiator; open by default */}
        {workspaceOpen && <Workspace />}

        {!workspaceOpen && (
          <IconButton
            label="Open workspace"
            onClick={() => setWorkspaceOpen(true)}
            className="absolute right-3 top-3 z-10 bg-elevated shadow-composer hover:text-primary"
          >
            <PanelRightOpen />
          </IconButton>
        )}
      </main>
    </div>
  )
}
