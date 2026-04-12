import { BarChart3 } from 'lucide-react'

export default function AnalyticsPanel({ analysesCount, sosCount, hazardsCount, emergencyPoints }) {
  const items = [
    { label: 'Trips analyzed', value: analysesCount },
    { label: 'SOS activations', value: sosCount },
    { label: 'Community hazards', value: hazardsCount },
    { label: 'Emergency points loaded', value: emergencyPoints },
  ]

  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4 sm:p-5">
      <h2 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-300">
        <BarChart3 size={14} /> Admin Analytics Snapshot
      </h2>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.label} className="rounded-xl border border-slate-700 bg-slate-950 p-3">
            <p className="text-xs text-slate-500">{item.label}</p>
            <p className="mt-1 text-2xl font-semibold text-slate-100">{item.value}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
