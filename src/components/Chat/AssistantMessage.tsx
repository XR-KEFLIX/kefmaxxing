import type { Message } from '../../lib/types'
import { cn } from '../../lib/utils'
import { Markdown } from './Markdown'
import { MessageActions } from './MessageActions'

/**
 * Assistant message: NOT a bubble. Full-width markdown on the app background —
 * no avatar, no name label, no card.
 *
 * Deliberate asymmetry (ChatGPT pattern): assistant actions are PERSISTENTLY
 * visible at reduced opacity, brightening on hover/focus — while user-side
 * actions (thread rename/delete, etc.) stay hover-reveal. While streaming, an
 * 8px accent square blinks after the last character and actions are hidden.
 */
export function AssistantMessage({
  message,
  onRetry,
}: {
  message: Message
  onRetry?: () => void
}) {
  const streaming = message.status === 'streaming'

  return (
    <div className="w-full">
      <div
        className={cn(
          'text-base leading-[1.65] text-primary',
          streaming && 'streaming-inline-last',
        )}
      >
        <Markdown content={message.content} />
        {streaming && (
          <span aria-hidden="true" className="ml-1 inline-block h-2 w-2 animate-blink bg-accent" />
        )}
      </div>

      {!streaming && (
        <div className="mt-1 opacity-60 transition-opacity duration-150 ease-out hover:opacity-100 focus-within:opacity-100">
          <MessageActions content={message.content} onRetry={onRetry} />
        </div>
      )}
    </div>
  )
}
