import type { Message } from '../../lib/types'
import { AssistantMessage } from './AssistantMessage'
import { UserMessage } from './UserMessage'

/**
 * Vertical rhythm: 32px between user→assistant pairs (space-y-8);
 * 8px rhythm inside a message is handled by the markdown element margins.
 */
export function MessageList({ messages }: { messages: Message[] }) {
  return (
    <div className="space-y-8">
      {messages.map((message) =>
        message.role === 'user' ? (
          // Left-aligned, content-width block (never right-aligned)
          <div key={message.id} className="flex">
            <UserMessage message={message} />
          </div>
        ) : (
          // Full-width, no bubble
          <AssistantMessage key={message.id} message={message} />
        ),
      )}
    </div>
  )
}
