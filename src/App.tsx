import { useCallback, useRef, useState } from 'react'
import { Header } from './components/Header'
import { UploadPanel } from './components/UploadPanel'
import { Analyzing } from './components/Analyzing'
import { ReportView } from './components/ReportView'
import { ChatPanel } from './components/ChatPanel'
import { StandardsSection } from './components/StandardsSection'
import { Footer } from './components/Footer'
import { preparePhoto } from './lib/image'
import { requestRating } from './lib/api'
import type { Gender, RatingReport, ScanStatus } from './lib/types'

export default function App() {
  const [photo, setPhoto] = useState<string | null>(null)
  const [gender, setGender] = useState<Gender>('male')
  const [status, setStatus] = useState<ScanStatus>('idle')
  const [report, setReport] = useState<RatingReport | null>(null)
  const [error, setError] = useState<string | null>(null)
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
      const res = await requestRating(photo, gender, controller.signal)
      setReport(res.report)
      setStatus('done')
      requestAnimationFrame(() => {
        document.getElementById('report')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    } catch (err) {
      if (controller.signal.aborted) {
        setStatus('idle')
        return
      }
      setError(err instanceof Error ? err.message : 'Rating failed. Try again.')
      setStatus('error')
    } finally {
      abortRef.current = null
    }
  }, [photo, gender])

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

  const showUpload = status === 'idle' || status === 'error' || (status === 'done' && !report)

  return (
    <div id="top" className="grain min-h-dvh">
      <Header />
      <main className="mx-auto w-full max-w-content px-5 pb-24 pt-24 sm:px-8">
        {showUpload && (
          <UploadPanel
            photo={photo}
            gender={gender}
            status={status}
            error={error}
            onFile={handleFile}
            onGender={setGender}
            onAnalyze={handleAnalyze}
            onClearError={() => setError(null)}
          />
        )}
        {status === 'analyzing' && photo && <Analyzing photo={photo} onCancel={handleCancel} />}
        {status === 'done' && report && photo && (
          <>
            <ReportView report={report} photo={photo} onReset={handleReset} />
            <ChatPanel report={report} gender={gender} />
          </>
        )}
        <StandardsSection />
      </main>
      <Footer />
    </div>
  )
}
