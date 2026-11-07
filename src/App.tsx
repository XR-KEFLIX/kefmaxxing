import { useCallback, useRef, useState } from 'react'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { AnalyzerSection } from './components/AnalyzerSection'
import { Analyzing } from './components/Analyzing'
import { ReportView } from './components/ReportView'
import { MethodSection } from './components/MethodSection'
import { Footer } from './components/Footer'
import { ChatDock } from './components/ChatDock'
import { preparePhoto } from './lib/image'
import { requestRating } from './lib/api'
import type { Gender, RatingReport, ScanStatus } from './lib/types'

export default function App() {
  const [photo, setPhoto] = useState<string | null>(null)
  const [gender, setGender] = useState<Gender>('male')
  const [status, setStatus] = useState<ScanStatus>('idle')
  const [report, setReport] = useState<RatingReport | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatSeed, setChatSeed] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const handleFile = useCallback(async (file: File) => {
    setError(null)
    try {
      const dataUrl = await preparePhoto(file)
      setPhoto(dataUrl)
      setReport(null)
      setStatus('idle')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not read that photo.')
    }
  }, [])

  const handleAnalyze = useCallback(async () => {
    if (!photo) return
    setStatus('analyzing')
    setError(null)
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const response = await requestRating(photo, gender, controller.signal)
      setReport(response.report)
      setStatus('done')
      requestAnimationFrame(() => {
        document.getElementById('report')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    } catch (err) {
      if (controller.signal.aborted) {
        setStatus('idle')
        return
      }
      setError(err instanceof Error ? err.message : 'The analysis failed. Try again.')
      setStatus('error')
    } finally {
      if (abortRef.current === controller) abortRef.current = null
    }
  }, [gender, photo])

  const handleCancel = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  const handleReset = useCallback(() => {
    setPhoto(null)
    setReport(null)
    setError(null)
    setStatus('idle')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleClearPhoto = useCallback(() => {
    setPhoto(null)
    setReport(null)
    setError(null)
    setStatus('idle')
  }, [])

  const startAnalysis = useCallback(() => {
    if (status === 'analyzing') abortRef.current?.abort()
    if (status === 'done' || status === 'error' || status === 'analyzing') {
      setPhoto(null)
      setReport(null)
      setError(null)
      setStatus('idle')
    }
    requestAnimationFrame(() => {
      document.getElementById('analysis')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [status])

  const openChat = useCallback((seed?: string) => {
    setChatSeed(seed ?? null)
    setChatOpen(true)
  }, [])

  const closeChat = useCallback(() => setChatOpen(false), [])
  const consumeSeed = useCallback(() => setChatSeed(null), [])

  const showAnalyzer = status === 'idle' || status === 'error' || (status === 'done' && !report)

  return (
    <div id="top" className="min-h-dvh bg-paper">
      <a
        href="#analysis"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-button focus:bg-accent focus:px-4 focus:py-2 focus:text-[13px] focus:text-onAccent"
      >
        Skip to analysis
      </a>

      <Header onOpenChat={() => openChat()} onStart={startAnalysis} />

      <main>
        <Hero onStart={startAnalysis} onOpenChat={() => openChat()} onAsk={(question) => openChat(question)} />

        {showAnalyzer && (
          <AnalyzerSection
            photo={photo}
            gender={gender}
            status={status}
            error={error}
            onFile={handleFile}
            onGender={setGender}
            onAnalyze={handleAnalyze}
            onClearError={() => setError(null)}
            onClearPhoto={handleClearPhoto}
          />
        )}

        {status === 'analyzing' && photo && <Analyzing photo={photo} onCancel={handleCancel} />}

        {status === 'done' && report && photo && (
          <ReportView
            report={report}
            photo={photo}
            onReset={handleReset}
            onOpenChat={openChat}
          />
        )}

        <MethodSection />
      </main>

      <Footer />

      <ChatDock
        open={chatOpen}
        onOpen={() => openChat()}
        onClose={closeChat}
        report={report}
        gender={gender}
        seed={chatSeed}
        onSeedConsumed={consumeSeed}
      />
    </div>
  )
}
