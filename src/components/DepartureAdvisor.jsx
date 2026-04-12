import { Clock3, Lightbulb, Route } from 'lucide-react'

function buildRecommendation({ riskEval, weatherCondition, trafficLevel, nightMode }) {
  if (!riskEval) {
    return {
      badge: 'Waiting for analysis',
      window: 'Analyze a route to get departure guidance',
      tip: 'Run Route Risk Analyzer first.',
      tone: 'text-slate-300 border-slate-700 bg-slate-900/70',
    }
  }

  const risk = riskEval.risk
  const percent = riskEval.riskPercent

  if (risk === 'High' || percent >= 75) {
    return {
      badge: 'High caution',
      window: nightMode
        ? 'Delay by 20-40 mins if possible or choose safer route now.'
        : 'Delay by 10-20 mins or switch to safer route before departure.',
      tip: `Main reason: ${riskEval.reasons?.[0]?.factor || 'context risk'}. Keep speed low near red segments.`,
      tone: 'text-rose-200 border-rose-400/50 bg-rose-500/10',
    }
  }

  if (risk === 'Medium' || percent >= 50) {
    return {
      badge: 'Moderate caution',
      window: trafficLevel === 'heavy' ? 'Start 10 mins early to avoid rush pressure.' : 'Safe to leave now with alert driving.',
      tip: weatherCondition === 'Rain' ? 'Use headlights and maintain larger lane gap.' : 'Keep 3-second distance on yellow segments.',
      tone: 'text-amber-200 border-amber-300/50 bg-amber-400/10',
    }
  }

  return {
    badge: 'Good to go',
    window: 'Leave now. Route conditions are currently favorable.',
    tip: 'Still monitor hotspots and follow lane discipline.',
    tone: 'text-emerald-200 border-emerald-300/50 bg-emerald-400/10',
  }
}

export default function DepartureAdvisor({ riskEval, weatherCondition, trafficLevel, nightMode }) {
  const recommendation = buildRecommendation({ riskEval, weatherCondition, trafficLevel, nightMode })

  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Smart Departure Advisor</h2>
        <span className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${recommendation.tone}`}>
          {recommendation.badge}
        </span>
      </div>

      <p className="inline-flex items-center gap-2 text-sm text-slate-200">
        <Clock3 size={15} className="text-sky-300" />
        {recommendation.window}
      </p>

      <p className="mt-2 inline-flex items-start gap-2 text-sm text-slate-300">
        <Lightbulb size={15} className="mt-0.5 text-amber-300" />
        {recommendation.tip}
      </p>

      {riskEval && (
        <p className="mt-3 inline-flex items-center gap-2 text-xs text-slate-400">
          <Route size={13} className="text-emerald-300" />
          Current route risk: {riskEval.risk} ({riskEval.riskPercent}%)
        </p>
      )}
    </section>
  )
}
