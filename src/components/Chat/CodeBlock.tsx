import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Check } from 'lucide-react'
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash'
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css'
import diff from 'react-syntax-highlighter/dist/esm/languages/prism/diff'
import go from 'react-syntax-highlighter/dist/esm/languages/prism/go'
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript'
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json'
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx'
import markdown from 'react-syntax-highlighter/dist/esm/languages/prism/markdown'
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python'
import ruby from 'react-syntax-highlighter/dist/esm/languages/prism/ruby'
import rust from 'react-syntax-highlighter/dist/esm/languages/prism/rust'
import sql from 'react-syntax-highlighter/dist/esm/languages/prism/sql'
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx'
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript'
import yaml from 'react-syntax-highlighter/dist/esm/languages/prism/yaml'

// Light build: register only common fence languages instead of bundling all of Prism.
SyntaxHighlighter.registerLanguage('bash', bash)
SyntaxHighlighter.registerLanguage('css', css)
SyntaxHighlighter.registerLanguage('diff', diff)
SyntaxHighlighter.registerLanguage('go', go)
SyntaxHighlighter.registerLanguage('javascript', javascript)
SyntaxHighlighter.registerLanguage('json', json)
SyntaxHighlighter.registerLanguage('jsx', jsx)
SyntaxHighlighter.registerLanguage('markdown', markdown)
SyntaxHighlighter.registerLanguage('python', python)
SyntaxHighlighter.registerLanguage('ruby', ruby)
SyntaxHighlighter.registerLanguage('rust', rust)
SyntaxHighlighter.registerLanguage('sql', sql)
SyntaxHighlighter.registerLanguage('tsx', tsx)
SyntaxHighlighter.registerLanguage('typescript', typescript)
SyntaxHighlighter.registerLanguage('yaml', yaml)

/*
 * Muted warm syntax palette (spec hex values, no neon).
 * react-syntax-highlighter chosen over highlight.js: the theme is one typed
 * object colocated with the component — no global CSS to keep in sync.
 */
const base: CSSProperties = {
  color: '#E8E4DC', // base text
  background: 'none',
  fontFamily: 'inherit',
  fontSize: 'inherit',
  lineHeight: 'inherit',
  textShadow: 'none',
  whiteSpace: 'pre',
}

const miloTheme: Record<string, CSSProperties> = {
  'code[class*="language-"]': base,
  'pre[class*="language-"]': { ...base, margin: 0, padding: 0 },
  comment: { color: '#7A766C', fontStyle: 'italic' },
  prolog: { color: '#7A766C' },
  doctype: { color: '#7A766C' },
  cdata: { color: '#7A766C' },
  keyword: { color: '#D97757' },
  important: { color: '#D97757' },
  string: { color: '#A8C39A' },
  char: { color: '#A8C39A' },
  regex: { color: '#A8C39A' },
  'attr-value': { color: '#A8C39A' },
  function: { color: '#D9B77C' },
  'class-name': { color: '#D9B77C' },
  'maybe-class-name': { color: '#D9B77C' },
  'attr-name': { color: '#D9B77C' },
  tag: { color: '#D9B77C' },
  number: { color: '#A8C39A' },
  boolean: { color: '#A8C39A' },
  constant: { color: '#A8C39A' },
  operator: { color: '#B8B4AA' },
  punctuation: { color: '#8A867C' },
  selector: { color: '#D97757' },
  property: { color: '#D9B77C' },
}

/** Prism language keys differ from common markdown fence aliases. */
const LANGUAGE_ALIASES: Record<string, string> = {
  ts: 'typescript',
  js: 'javascript',
  sh: 'bash',
  shell: 'bash',
  py: 'python',
  rb: 'ruby',
  yml: 'yaml',
  md: 'markdown',
  text: 'plaintext',
}

interface CodeBlockProps {
  language: string
  code: string
}

export function CodeBlock({ language, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const prismLanguage = LANGUAGE_ALIASES[language] ?? (language || 'plaintext')

  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard unavailable (permissions) — ignore
    }
  }

  return (
    <div className="my-4 overflow-hidden rounded-xl bg-code-bg font-mono text-sm">
      {/* 36px top bar: language label left, copy right */}
      <div className="flex h-9 items-center justify-between bg-code-topbar pl-4 pr-3">
        <span className="text-xs text-[#9B978E]">{language || 'text'}</span>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? 'Copied' : 'Copy code'}
          className="flex items-center gap-1 text-xs text-[#9B978E] transition-colors duration-150 ease-out hover:text-white"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Copied
            </>
          ) : (
            'Copy'
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={prismLanguage}
        style={miloTheme}
        customStyle={{
          margin: 0,
          padding: '14px 16px',
          background: 'transparent',
          overflowX: 'auto', // horizontal scroll for long lines
          lineHeight: '1.6',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}
