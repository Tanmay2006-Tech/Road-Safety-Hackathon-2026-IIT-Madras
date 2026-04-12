export default function RiskBar({ riskPercent = 0, confidence = 0 }) {
  const normalizedRisk = Math.min(100, Math.max(0, riskPercent))
  const pointer = `${normalizedRisk}%`

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4 sm:p-5">
      <div className="mb-2 flex items-center justify-between text-sm">
        <p className="font-semibold text-slate-100">Risk Visualization</p>
        <p className="text-slate-400">Confidence: {confidence}%</p>
      </div>

      <div className="relative mt-5 h-4 overflow-hidden rounded-full bg-slate-800/90">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-300 to-rose-500 transition-[width] duration-700 ease-out"
          style={{ width: pointer }}
        />
        <span
          className="absolute -top-2 h-8 w-[2px] -translate-x-1/2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.65)] transition-[left] duration-700 ease-out"
          style={{ left: pointer }}
        />
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
        <span>Safe</span>
        <span>{normalizedRisk}% risk</span>
        <span>Danger</span>
      </div>
    </div>
  )
}
