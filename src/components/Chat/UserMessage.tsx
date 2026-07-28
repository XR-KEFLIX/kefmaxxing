import type { Message } from '../../lib/types'

/**
 * User message: right-aligned pill (ChatGPT shape language) — evenly rounded
 * on all four corners at the `bubble` radius (20px), solid filled background,
 * no border. Content-width capped at 70%.
 */
export function UserMessage({ message }: { message: Message }) {
  return (
    <div className="max-w-[70%] rounded-bubble bg-user-msg px-4 py-3">
      <p className="whitespace-pre-wrap text-base leading-[1.65] text-primary">{message.content}</p>
    </div>
  )
}
