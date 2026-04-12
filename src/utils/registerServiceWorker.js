export function registerServiceWorker(onMessage) {
  if (!('serviceWorker' in navigator)) return

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')

      if (registration.waiting && onMessage) {
        onMessage('A new app update is available. Refresh to apply it.')
      }

      registration.addEventListener('updatefound', () => {
        const worker = registration.installing
        if (!worker) return

        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller && onMessage) {
            onMessage('New RiskPath version installed. Refresh when safe to do so.')
          }
        })
      })
    } catch {
      // Service worker registration can fail on unsupported or restricted environments.
    }
  })
}
