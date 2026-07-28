import type { Message } from '../../lib/types'
import { cn } from '../../lib/utils'
import { Markdown } from './Markdown'
import { MessageActions } from './MessageActions'

/**
 * Assistant message: full-width, no bubble, no avatar — plus its visual
 * signature: a single 2px accent bar on the left edge (the same treatment
 * blockquotes get, tying the identity together).
 *
 * Deliberate asymmetry: assistant actions are PERSISTENTLY visible at reduced
 * opacity, brightening on hover/focus. While streaming, an 8px accent square
 * blinks after the last character and actions stay hidden.
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
    <div className="w-full border-l-2 border-accent pl-5">
      <div
        className={cn(
          'text-[15px] leading-[1.7] text-primary',
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
