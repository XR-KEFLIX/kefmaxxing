import type { Message } from '../../lib/types'
import { cn } from '../../lib/utils'
import { Markdown } from './Markdown'
import { MessageActions } from './MessageActions'

/**
 * Assistant message: full-width plain markdown on the app background —
 * no bubble, no avatar, no decorative marks. Actions are persistently
 * visible at reduced opacity, brightening on hover/focus. While streaming,
 * an 8px accent square blinks after the last character and actions hide.
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
