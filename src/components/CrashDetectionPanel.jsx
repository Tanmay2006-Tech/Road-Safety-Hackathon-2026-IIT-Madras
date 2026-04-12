import { AlertOctagon, ShieldCheck, Siren, ToggleLeft, ToggleRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export default function CrashDetectionPanel({ onTriggerEmergency }) {
  const [armed, setArmed] = useState(() => {
    try {
      return localStorage.getItem('riskpath_crash_auto') === '1'
    } catch {
      return false
    }
  })
  const [permissionState, setPermissionState] = useState('unknown')
  const [countdown, setCountdown] = useState(0)
  const [impactDetected, setImpactDetected] = useState(false)
  const [lastMagnitude, setLastMagnitude] = useState(0)
  const triggerLocked = useRef(false)
  const impactBurstCount = useRef(0)
  const lastBurstAt = useRef(0)
  const cooldownUntil = useRef(0)

  useEffect(() => {
    try {
      localStorage.setItem('riskpath_crash_auto', armed ? '1' : '0')
    } catch {
      // Ignore storage issues.
    }
  }, [armed])

  async function ensureMotionPermission() {
    const api = window.DeviceMotionEvent
    if (!api || typeof api.requestPermission !== 'function') {
      setPermissionState('granted')
      return true
    }

    try {
      const result = await api.requestPermission()
      setPermissionState(result)
      return result === 'granted'
    } catch {
      setPermissionState('denied')
      return false
    }
  }

  async function toggleArmed() {
    if (!armed) {
      const allowed = await ensureMotionPermission()
      if (!allowed) return
      setArmed(true)
      return
    }

    setImpactDetected(false)
    setCountdown(0)
    triggerLocked.current = false
    impactBurstCount.current = 0
    setArmed(false)
  }

  useEffect(() => {
    if (!armed) return

    function handleMotion(event) {
      if (Date.now() < cooldownUntil.current) return

      const acc = event.accelerationIncludingGravity
      if (!acc) return

      const x = acc.x || 0
      const y = acc.y || 0
      const z = acc.z || 0
      const magnitude = Math.sqrt(x * x + y * y + z * z)
      setLastMagnitude(Number(magnitude.toFixed(1)))

      // Confirm impact using burst detection to avoid false positives from potholes.
      const now = Date.now()
      if (magnitude > 32) {
        if (now - lastBurstAt.current <= 1400) {
          impactBurstCount.current += 1
        } else {
          impactBurstCount.current = 1
        }
        lastBurstAt.current = now
      }

      if (impactBurstCount.current >= 2 && !triggerLocked.current) {
        triggerLocked.current = true
        impactBurstCount.current = 0
        setImpactDetected(true)
        setCountdown(10)
      }
    }

    window.addEventListener('devicemotion', handleMotion)
    return () => window.removeEventListener('devicemotion', handleMotion)
  }, [armed])

  useEffect(() => {
    if (!countdown) return

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          onTriggerEmergency('crash-detection')
          setImpactDetected(false)
          triggerLocked.current = false
          cooldownUntil.current = Date.now() + 20000
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [countdown, onTriggerEmergency])

  function simulateImpact() {
    if (triggerLocked.current) return
    triggerLocked.current = true
    setImpactDetected(true)
    setCountdown(10)
  }

  function cancelAutoSos() {
    setCountdown(0)
    setImpactDetected(false)
    triggerLocked.current = false
  }

  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Auto Crash Detection</h2>
        <button
          onClick={toggleArmed}
          className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs ${
            armed ? 'border-emerald-300/60 bg-emerald-300/15 text-emerald-200' : 'border-slate-700 text-slate-300'
          }`}
        >
          {armed ? <ToggleRight size={14} /> : <ToggleLeft size={14} />} {armed ? 'Armed' : 'Disarmed'}
        </button>
      </div>

      <p className="text-sm text-slate-300">
        Uses device motion in real time and auto-triggers SOS after countdown when a crash-like impact burst is detected.
      </p>

      <p className="mt-2 text-xs text-slate-500">
        Sensor status: {permissionState} {armed ? `| Live force: ${lastMagnitude} m/s^2` : ''}
      </p>

      <button
        onClick={simulateImpact}
        className="mt-3 rounded-xl border border-rose-400/60 bg-rose-500/15 px-3 py-2 text-xs font-semibold text-rose-200"
      >
        Simulate crash impact
      </button>

      {impactDetected && countdown > 0 && (
        <div className="mt-3 rounded-xl border border-rose-400/60 bg-rose-500/15 p-3 text-sm text-rose-200">
          <p className="inline-flex items-center gap-2 font-semibold"><AlertOctagon size={14} /> Impact detected. Auto SOS in {countdown}s</p>
          <button
            onClick={cancelAutoSos}
            className="mt-2 rounded-lg border border-slate-500 px-2.5 py-1 text-xs text-slate-100"
          >
            I am safe, cancel
          </button>
        </div>
      )}

      {!impactDetected && (
        <p className="mt-3 inline-flex items-center gap-2 text-xs text-slate-500">
          {armed ? <Siren size={13} /> : <ShieldCheck size={13} />} {armed ? 'Automatic crash monitoring active' : 'Automatic crash monitoring paused'}
        </p>
      )}
    </section>
  )
}
