import { Activity, Cpu, Droplets, Moon, TrafficCone } from 'lucide-react'

function reasonColor(factor) {
  if (factor.toLowerCase().includes('rain') || factor.toLowerCase().includes('fog')) return 'bg-sky-300'
  if (factor.toLowerCase().includes('night')) return 'bg-indigo-300'
  if (factor.toLowerCase().includes('traffic')) return 'bg-amber-300'
  return 'bg-emerald-300'
}

const presets = [
  {
    id: 'normal',
    title: 'Morning Commute',
    options: { rain: false, night: false, heavyTraffic: false },
    icon: Activity,
  },
  {
    id: 'monsoon',
    title: 'Monsoon Rush Hour',
    options: { rain: true, night: false, heavyTraffic: true },
    icon: Droplets,
  },
  {
    id: 'night',
    title: 'Late-Night Highway',
    options: { rain: false, night: true, heavyTraffic: false },
    icon: Moon,
  },
  {
    id: 'worst',
    title: 'Worst-Case Conditions',
    options: { rain: true, night: true, heavyTraffic: true },
    icon: TrafficCone,
  },
]

export default function ModelLabPanel({ riskEval, onApplyPreset }) {
  const reasons = riskEval?.reasons || []

  return (
    <section id="ml-lab" className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Risk lab</h2>
          <p className="inline-flex items-center gap-1 text-xs text-slate-500">
          <Cpu size={12} /> Risk factor view
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {presets.map((preset) => {
          const Icon = preset.icon
          return (
            <button
              key={preset.id}
              onClick={() => onApplyPreset(preset.options)}
              className="rounded-xl border border-slate-700 bg-slate-950 p-3 text-left text-slate-200 transition hover:border-emerald-300/60"
            >
              <p className="inline-flex items-center gap-2 text-sm font-semibold">
                <Icon size={14} /> {preset.title}
              </p>
              <p className="mt-1 text-xs text-slate-500">Apply scenario quickly</p>
            </button>
          )
        })}
      </div>

      <div className="mt-4 space-y-2">
        {!reasons.length && <p className="text-sm text-slate-500">Analyze a route to inspect risk factors.</p>}
        {reasons.map((reason) => {
          const value = Number(reason.impact.replace(/[^0-9]/g, '')) || 8
          return (
            <div key={reason.factor}>
              <div className="mb-1 flex items-center justify-between text-xs text-slate-300">
                <p>{reason.factor}</p>
                <p>{reason.impact}</p>
              </div>
              <div className="h-2 rounded-full bg-slate-800">
                <div
                  className={`h-full rounded-full ${reasonColor(reason.factor)}`}
                  style={{ width: `${Math.min(100, value * 2.4)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
