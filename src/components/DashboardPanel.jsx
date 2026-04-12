export default function DashboardPanel({ overallRisk, highRiskSegments, nearbyZones, safetyScore }) {
  const trend = overallRisk === 'High' ? 'Escalating' : overallRisk === 'Medium' ? 'Watch closely' : 'Stable'

  const cards = [
    { label: 'Risks detected today', value: 4 + highRiskSegments },
    { label: 'Nearby high-risk zones', value: nearbyZones },
    { label: 'Average safety score', value: `${safetyScore}%` },
  ]

  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4 sm:p-5">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-300">Dashboard</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-slate-700 bg-slate-950 p-3">
            <p className="text-xs text-slate-500">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-100">{card.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <p>Current overall risk level: {overallRisk}</p>
        <p>Trend: {trend}</p>
      </div>
    </section>
  )
}
