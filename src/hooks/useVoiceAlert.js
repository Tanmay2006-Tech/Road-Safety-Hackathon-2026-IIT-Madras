import { useEffect, useRef } from 'react'

export function useVoiceAlert({ enabled, text }) {
  const lastSpoken = useRef('')

  useEffect(() => {
    if (!enabled || !text) return
    if (!('speechSynthesis' in window)) return
    if (lastSpoken.current === text) return

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1
    utterance.pitch = 0.9
    utterance.volume = 1

    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
    lastSpoken.current = text

    return () => {
      window.speechSynthesis.cancel()
    }
  }, [enabled, text])
}
