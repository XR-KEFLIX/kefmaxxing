import type { Message } from '../../lib/types'
import { cn } from '../../lib/utils'
import { Markdown } from './Markdown'
import { MessageActions } from './MessageActions'

/**
 * Assistant message: NOT a bubble. Full-width markdown on the app background —
 * no avatar, no name label, no card (the most important visual rule).
 *
 * While `status === 'streaming'`: an 8px accent square blinks after the last
 * character (the .streaming-inline-last utility pulls the last block inline so
 * the cursor hugs the text) and the actions row is hidden.
 */
export function AssistantMessage({ message }: { message: Message }) {
  const streaming = message.status === 'streaming'

  return (
    <div className="group w-full">
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

      {/* Hover (or keyboard focus) reveals copy / retry / thumbs below the message */}
      {!streaming && (
        <div className="mt-1 opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100 group-focus-within:opacity-100">
          <MessageActions content={message.content} />
        </div>
      )}
    </div>
  )
}
