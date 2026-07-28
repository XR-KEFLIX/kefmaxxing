import { useEffect, useRef } from 'react'
import type { Message } from '../../lib/types'
import { MessageList } from './MessageList'

/**
 * Scroll region for the conversation, inside the centered 768px column.
 * Stage 2: lands on the latest message when the view mounts.
 * Stage 3: follow-the-stream only when near the bottom + scroll-to-bottom pill.
 */
export function ChatArea({ messages }: { messages: Message[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [])

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-content px-6 py-8">
        <MessageList messages={messages} />
      </div>
    </div>
  )
}
