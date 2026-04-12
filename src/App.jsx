import { useEffect, useState } from 'react'
import ErrorBoundary from './components/ErrorBoundary'
import HomePage from './pages/HomePage'
import { registerServiceWorker } from './utils/registerServiceWorker'

function App() {
  const [statusMessage, setStatusMessage] = useState('')
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  useEffect(() => {
    registerServiceWorker((message) => {
      setStatusMessage(message)
      setTimeout(() => setStatusMessage(''), 6000)
    })
  }, [])

  useEffect(() => {
    const onOffline = () => {
      setIsOffline(true)
      setStatusMessage('Offline mode active. Cached features remain available.')
    }

    const onOnline = () => {
      setIsOffline(false)
      setStatusMessage('Connection restored. Live data sync resumed.')
      setTimeout(() => setStatusMessage(''), 3200)
    }

    window.addEventListener('offline', onOffline)
    window.addEventListener('online', onOnline)

    return () => {
      window.removeEventListener('offline', onOffline)
      window.removeEventListener('online', onOnline)
    }
  }, [])

  return (
    <ErrorBoundary>
      {(statusMessage || isOffline) && (
        <div className="sticky top-0 z-[2000] border-b border-cyan-100/20 bg-[#08162a]/92 px-4 py-2 text-center text-xs text-cyan-100 backdrop-blur-xl">
          {statusMessage || 'Offline mode active. Cached features remain available.'}
        </div>
      )}
      <HomePage />
    </ErrorBoundary>
  )
}

export default App
