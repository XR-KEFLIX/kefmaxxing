import { useMiloStore } from '../../lib/store'
import { formatRelativeTime } from '../../lib/utils'
import { Composer } from '../Composer/Composer'

const SUGGESTIONS = [
  'Explain React Server Components simply',
  'Draft a README outline for a side project',
  'Help me debug why my CSS isn’t applying',
]

/**
 * The welcome experience — not a blank screen, not a marketing page:
 * the brand lockup, the signature composer front and center, a live
 * status line (model + thinking), suggested starting points that actually
 * send, and your recent work as objects you can re-enter with one click.
 */
export function EmptyState() {
  const threads = useMiloStore((s) => s.threads)
  const threadOrder = useMiloStore((s) => s.threadOrder)
  const sendMessage = useMiloStore((s) => s.sendMessage)
  const stopStreaming = useMiloStore((s) => s.stopStreaming)
  const streaming = useMiloStore((s) => s.streamingThreadId !== null)
  const selectThread = useMiloStore((s) => s.selectThread)
  const model = useMiloStore((s) => s.model)
  const thinking = useMiloStore((s) => s.thinking)

  const recent = threadOrder
    .slice(0, 3)
    .map((id) => threads[id])
    .filter(Boolean)

  return (
    <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-6">
      <div className="w-full max-w-content">
        {/* Brand lockup */}
        <div className="mb-6 flex items-center justify-center gap-1.5">
          <span className="text-xl font-semibold tracking-[-0.02em] text-primary">Milo</span>
          <span className="h-[5px] w-[5px] rounded-full bg-accent" aria-hidden="true" />
        </div>

        <Composer onSend={sendMessage} streaming={streaming} onStop={stopStreaming} />
        <p className="mt-3 text-center text-xs text-secondary">
          {model}
          {thinking ? ' · thinking on' : ''} — Milo can make mistakes.
        </p>

        {/* Suggested starting points — clicking sends */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {SUGGESTIONS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => sendMessage(prompt)}
              className="rounded-full bg-elevated px-3.5 py-1.5 text-[13px] text-secondary transition-colors duration-150 ease-out hover:bg-hover hover:text-primary"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Recent work — conversation objects, re-enterable */}
        {recent.length > 0 && (
          <div className="mt-12">
            <p className="mb-2 text-xs text-secondary">Recent work</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {recent.map((thread) => (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => selectThread(thread.id)}
                  className="rounded-xl bg-elevated px-4 py-3 text-left transition-all duration-150 ease-out hover:bg-hover hover:shadow-card"
                >
                  <span className="block truncate text-sm text-primary">
                    {thread.title || 'New chat'}
                  </span>
                  <span className="mt-0.5 block text-xs text-secondary">
                    {formatRelativeTime(thread.updatedAt)} · {thread.messages.length} messages
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
