function riskTone(level) {
  if (level === 'High') return 'text-rose-200 border-rose-400/40 bg-rose-500/10'
  if (level === 'Medium') return 'text-amber-100 border-amber-400/40 bg-amber-500/10'
  return 'text-emerald-100 border-emerald-400/40 bg-emerald-500/10'
}

export default function PredictiveTimelinePanel({ forecast }) {
  if (!forecast?.length) return null

  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Predictive Risk Timeline</h3>
        <p className="text-xs text-slate-400">Next 45 minutes</p>
      </div>

      <div className="space-y-2">
        {forecast.map((item) => (
          <div key={item.minute} className={`rounded-xl border p-3 ${riskTone(item.risk)}`}>
            <div className="flex items-center justify-between text-xs">
              <p className="font-semibold">+{item.minute} min</p>
              <p>{item.risk} risk ({item.riskPercent}%)</p>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-950/60">
              <div className="h-full rounded-full bg-current" style={{ width: `${item.riskPercent}%` }} />
            </div>
            <p className="mt-2 text-[11px] opacity-90">
              Weather: {item.weatherCondition} | Traffic: {item.trafficLevel} | Confidence: {item.confidence}%
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
