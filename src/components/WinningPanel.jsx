import { Copy, Trophy } from 'lucide-react'

export default function WinningPanel({ riskEval, impact, forecast, onCopyPitch }) {
  if (!riskEval) return null

  const nextPeak = forecast?.reduce((best, item) => (item.riskPercent > best.riskPercent ? item : best), forecast[0])

  return (
    <section className="rounded-2xl border border-amber-300/40 bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900 p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-amber-200">
          <Trophy size={14} /> Outcome summary
        </h2>
        <button
          onClick={onCopyPitch}
          className="inline-flex items-center gap-1 rounded-lg border border-amber-300/50 bg-amber-400/10 px-2 py-1 text-xs font-semibold text-amber-100 hover:bg-amber-400/20"
        >
          <Copy size={12} /> Copy 30s pitch
        </button>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-700 bg-slate-950/75 p-3">
          <p className="text-[11px] text-slate-400">Current model confidence</p>
          <p className="text-xl font-bold text-violet-300">{riskEval.confidence}%</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-950/75 p-3">
          <p className="text-[11px] text-slate-400">Safety impact score</p>
          <p className="text-xl font-bold text-emerald-300">{impact?.impactScore ?? 0}/100</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-950/75 p-3">
          <p className="text-[11px] text-slate-400">Worst upcoming window</p>
          <p className="text-xl font-bold text-rose-300">+{nextPeak?.minute ?? 0} min</p>
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-300">
        RiskPath predicts route escalation, compares safer alternatives, and keeps emergency actions close at hand.
      </p>
    </section>
  )
}
