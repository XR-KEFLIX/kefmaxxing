import { useMiloStore } from '../../lib/store'
import type { Message } from '../../lib/types'
import { AssistantMessage } from './AssistantMessage'
import { UserMessage } from './UserMessage'

/**
 * Vertical rhythm: 24px between user→assistant pairs (space-y-6) — dense
 * enough for 100+-message sessions, still clearly separated. 8px rhythm
 * inside a message is handled by the markdown element margins.
 * Retry is offered only on the last assistant message.
 */
export function MessageList({ messages }: { messages: Message[] }) {
  const retryLast = useMiloStore((s) => s.retryLast)
  const lastAssistantId = [...messages].reverse().find((m) => m.role === 'assistant')?.id

  return (
    <div className="space-y-6">
      {messages.map((message) =>
        message.role === 'user' ? (
          // Right-aligned pill (ChatGPT shape language)
          <div key={message.id} className="flex justify-end">
            <UserMessage message={message} />
          </div>
        ) : (
          // Full-width, no bubble
          <AssistantMessage
            key={message.id}
            message={message}
            onRetry={message.id === lastAssistantId ? retryLast : undefined}
          />
        ),
      )}
    </div>
  )
}
