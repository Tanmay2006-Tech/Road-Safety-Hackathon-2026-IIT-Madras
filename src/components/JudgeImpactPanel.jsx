function scoreTone(score) {
  if (score >= 75) return 'text-emerald-200 border-emerald-400/40 bg-emerald-500/10'
  if (score >= 50) return 'text-amber-100 border-amber-400/40 bg-amber-500/10'
  return 'text-rose-100 border-rose-400/40 bg-rose-500/10'
}

export default function JudgeImpactPanel({ impact }) {
  if (!impact) return null

  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Judge Impact Snapshot</h3>
        <span className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${scoreTone(impact.impactScore)}`}>
          Impact score {impact.impactScore}/100
        </span>
      </div>

      <p className="text-sm font-semibold text-slate-100">{impact.verdict}</p>
      <p className="mt-1 text-xs text-slate-300">{impact.recommendation}</p>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
          <p className="text-[11px] text-slate-400">Risk delta</p>
          <p className="text-lg font-bold text-emerald-300">{impact.riskDeltaPercent}%</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
          <p className="text-[11px] text-slate-400">ETA trade-off</p>
          <p className="text-lg font-bold text-sky-300">{impact.timeDeltaMin} min</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
          <p className="text-[11px] text-slate-400">Model confidence</p>
          <p className="text-lg font-bold text-violet-300">{impact.confidence}%</p>
        </div>
      </div>
    </section>
  )
}
