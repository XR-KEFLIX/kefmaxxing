import { useEffect } from 'react'
import { ChatArea } from './components/Chat/ChatArea'
import { EmptyState } from './components/Chat/EmptyState'
import { Composer } from './components/Composer/Composer'
import { Sidebar } from './components/Sidebar/Sidebar'
import { Workspace } from './components/Workspace/Workspace'
import { useMiloStore } from './lib/store'
import type { Message } from './lib/types'
import { cn } from './lib/utils'

const NO_MESSAGES: Message[] = []

/**
 * The shell — an environment, not a webpage. 16px of app-level air surrounds
 * three floating objects: the navigation rail, the open chat column (messages
 * float on open space along an 820px editorial spine), and the workspace.
 * Nothing is welded to the browser window.
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
    <div className="flex h-full gap-4 bg-bg p-4 text-primary">
      {/* Rail — floating object: 280px expanded, 72px collapsed */}
      <div
        className={cn(
          'h-full shrink-0 transition-[width] duration-200 ease-out',
          sidebarOpen ? 'w-[280px]' : 'w-[72px]',
        )}
      >
        <Sidebar />
      </div>

      {/* Chat column + workspace */}
      <main className="flex min-w-0 flex-1">
        {/* Open space: messages float along the editorial spine; the hero
            composer floats beneath, detached from the bottom by the shell's air */}
        <div className="flex min-w-0 flex-1 flex-col">
          {hasMessages ? (
            <>
              <ChatArea key={activeThreadId ?? 'none'} messages={messages} />
              <div className="shrink-0 px-6 pt-2">
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

        {/* Third floating surface — open by default; toggled from the composer */}
        {workspaceOpen && <Workspace />}
      </main>
    </div>
  )
}
