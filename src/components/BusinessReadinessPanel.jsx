function checkTone(ok) {
  return ok
    ? 'border-emerald-300/35 bg-emerald-500/10 text-emerald-100'
    : 'border-amber-300/35 bg-amber-500/10 text-amber-100'
}

function countByType(items = []) {
  return items.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1
    return acc
  }, {})
}

export default function BusinessReadinessPanel({ facilities = [], routeScope, weatherSource, crashDetectionEnabled }) {
  const counts = countByType(facilities)
  const emergencyCount = (counts.hospital || 0) + (counts.police || 0) + (counts.ambulance_station || 0)
  const supportCount = (counts.roadside_assistance || 0) + (counts.puncture_repair || 0) + (counts.showroom || 0)

  const checks = [
    {
      label: 'Nearest emergency services accessible',
      ok: emergencyCount > 0,
      note: `${emergencyCount} emergency points available`,
    },
    {
      label: 'Roadside support coverage included',
      ok: supportCount > 0,
      note: `${supportCount} towing and repair points available`,
    },
    {
      label: 'Global applicability available',
      ok: routeScope === 'global',
      note: routeScope === 'global' ? 'Global mode selected' : 'India mode selected',
    },
    {
      label: 'Offline resilience enabled',
      ok: typeof navigator !== 'undefined' && 'serviceWorker' in navigator,
      note: 'PWA service worker support enabled',
    },
    {
      label: 'Crash auto-detection available',
      ok: Boolean(crashDetectionEnabled),
      note: crashDetectionEnabled ? 'Feature ON for active safety' : 'Feature OFF from Emergency settings',
    },
    {
      label: 'Free API fallback reliability',
      ok: weatherSource === 'openweather' || weatherSource === 'open-meteo' || weatherSource === 'fallback',
      note: `Weather source: ${weatherSource || 'fallback'}`,
    },
  ]

  const score = Math.round((checks.filter((item) => item.ok).length / checks.length) * 100)

  return (
    <section className="rp-card rounded-2xl p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200">Hackathon readiness</h2>
        <span className="rounded-full border border-cyan-200/35 bg-cyan-300/10 px-2 py-1 text-[11px] font-semibold text-cyan-100">
          Score {score}/100
        </span>
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        {checks.map((item) => (
          <div key={item.label} className={`rounded-xl border p-3 text-xs ${checkTone(item.ok)}`}>
            <p className="font-semibold">{item.label}</p>
            <p className="mt-1 opacity-90">{item.note}</p>
          </div>
        ))}
      </div>
    </section>
  )
}