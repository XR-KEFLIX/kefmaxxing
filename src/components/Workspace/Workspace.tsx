import { useMemo, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { Code2, Eye, FileText, PanelRightClose } from 'lucide-react'
import { useMiloStore } from '../../lib/store'
import { cn, extractCodeBlocks } from '../../lib/utils'
import { CodeBlock } from '../Chat/CodeBlock'
import { Markdown } from '../Chat/Markdown'
import { IconButton } from '../ui/IconButton'

type Tab = 'document' | 'code' | 'preview'

const TABS: Array<{ id: Tab; label: string; icon: typeof FileText }> = [
  { id: 'document', label: 'Document', icon: FileText },
  { id: 'code', label: 'Code', icon: Code2 },
  { id: 'preview', label: 'Preview', icon: Eye },
]

/**
 * Right-side workspace: room for work, not just messages.
 * - Document: the latest assistant response as a clean reading surface.
 * - Code: every fenced block from the conversation, listed + full viewer.
 * - Preview: renders HTML/SVG blocks in a sandboxed iframe (scripts disabled).
 * Drag the left edge to resize (320–640px); transitions are 200ms ease-out.
 */
export function Workspace() {
  const activeThread = useMiloStore((s) =>
    s.activeThreadId ? s.threads[s.activeThreadId] : undefined,
  )
  const width = useMiloStore((s) => s.workspaceWidth)
  const setWorkspaceWidth = useMiloStore((s) => s.setWorkspaceWidth)
  const setWorkspaceOpen = useMiloStore((s) => s.setWorkspaceOpen)

  const [tab, setTab] = useState<Tab>('document')
  const [selectedCodeId, setSelectedCodeId] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  const messages = useMemo(() => activeThread?.messages ?? [], [activeThread])
  const codeBlocks = useMemo(() => extractCodeBlocks(messages), [messages])
  const selectedCode =
    codeBlocks.find((b) => b.id === selectedCodeId) ?? codeBlocks[codeBlocks.length - 1]
  const lastAssistant = useMemo(
    () => [...messages].reverse().find((m) => m.role === 'assistant' && m.content),
    [messages],
  )

  const isPreviewable = selectedCode != null && /^(html|svg|xml)$/i.test(selectedCode.language)
  const previewDoc =
    selectedCode == null
      ? ''
      : /^svg$/i.test(selectedCode.language)
        ? `<!doctype html><html><body style="margin:0;display:grid;place-items:center;min-height:100vh">${selectedCode.code}</body></html>`
        : selectedCode.code

  function startDrag(e: ReactPointerEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(true)
    const startX = e.clientX
    const startWidth = width
    function onMove(ev: PointerEvent) {
      setWorkspaceWidth(startWidth + (startX - ev.clientX))
    }
    function onUp() {
      setDragging(false)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  const hint = (text: string) => (
    <p className="px-4 py-10 text-center text-sm text-secondary">{text}</p>
  )

  return (
    <div
      className={cn(
        'relative ml-4 flex h-full shrink-0 flex-col overflow-hidden rounded-surface bg-sidebar shadow-composer',
        !dragging && 'transition-[width] duration-200 ease-out',
      )}
      style={{ width }}
    >
      {/* Resize handle — left edge */}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize workspace"
        onPointerDown={startDrag}
        className="absolute left-0 top-0 z-10 h-full w-1 cursor-col-resize transition-colors duration-150 hover:bg-accent/40"
      />

      {/* Header: segmented tabs + close */}
      <div className="flex items-center gap-2 p-3">
        <div className="flex rounded-full bg-elevated p-0.5" role="tablist" aria-label="Workspace view">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-colors duration-150 ease-out',
                tab === id ? 'bg-hover text-primary' : 'text-secondary hover:text-primary',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <IconButton label="Close workspace" onClick={() => setWorkspaceOpen(false)}>
          <PanelRightClose />
        </IconButton>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {tab === 'document' &&
          (lastAssistant ? (
            <div className="text-[16px] leading-[1.75] text-primary">
              <Markdown content={lastAssistant.content} />
            </div>
          ) : (
            hint('Nothing here yet — ask Milo something and the response will land here.')
          ))}

        {tab === 'code' &&
          (codeBlocks.length > 0 ? (
            <div>
              <div className="mb-3 flex flex-wrap gap-1.5">
                {codeBlocks.map((block) => (
                  <button
                    key={block.id}
                    type="button"
                    onClick={() => setSelectedCodeId(block.id)}
                    className={cn(
                      'rounded-full px-2.5 py-1 text-xs transition-colors duration-150 ease-out',
                      selectedCode?.id === block.id
                        ? 'bg-hover text-primary'
                        : 'bg-elevated text-secondary hover:text-primary',
                    )}
                  >
                    {block.language} · {block.code.split('\n').length} lines
                  </button>
                ))}
              </div>
              {selectedCode && <CodeBlock language={selectedCode.language} code={selectedCode.code} />}
            </div>
          ) : (
            hint('No code in this conversation yet.')
          ))}

        {tab === 'preview' &&
          (selectedCode == null
            ? hint('Nothing to preview yet.')
            : isPreviewable ? (
              <iframe
                title="Artifact preview"
                sandbox=""
                srcDoc={previewDoc}
                className="h-full min-h-[320px] w-full rounded-lg bg-white"
              />
            ) : (
              hint(`Preview is available for HTML/SVG blocks — the selected block is ${selectedCode.language}.`)
            ))}
      </div>
    </div>
  )
}
