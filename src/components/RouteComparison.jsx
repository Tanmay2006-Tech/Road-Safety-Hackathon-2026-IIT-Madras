export default function RouteComparison({ currentResult, saferResult, activeRoute, onSwitch }) {
  if (!currentResult || !saferResult) return null

  const riskDelta = currentResult.riskPercent - saferResult.riskPercent
  const timeDelta = saferResult.timeMin - currentResult.timeMin
  const isSaferActive = activeRoute === 'safer'

  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4 sm:p-5">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-300">
        Safer Route Comparison
      </h2>
      <div className="overflow-hidden rounded-xl border border-slate-700">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-800/70 text-slate-300">
            <tr>
              <th className="px-3 py-2 font-medium">Route</th>
              <th className="px-3 py-2 font-medium">Risk</th>
              <th className="px-3 py-2 font-medium">Risk %</th>
              <th className="px-3 py-2 font-medium">Time</th>
            </tr>
          </thead>
          <tbody className="text-slate-200">
            <tr
              className={`border-t border-slate-700 transition-all duration-500 ${
                isSaferActive ? 'opacity-45' : 'bg-slate-900/55'
              }`}
            >
              <td className="px-3 py-2">Current</td>
              <td className="px-3 py-2">{currentResult.risk} {currentResult.risk === 'High' ? '🔴' : currentResult.risk === 'Medium' ? '🟡' : '🟢'}</td>
              <td className="px-3 py-2">{currentResult.riskPercent}%</td>
              <td className="px-3 py-2">{currentResult.timeMin} min</td>
            </tr>
            <tr
              className={`border-t border-slate-700 transition-all duration-500 ${
                isSaferActive
                  ? 'bg-emerald-400/12 shadow-[inset_0_0_0_1px_rgba(74,222,128,0.45),0_0_26px_rgba(16,185,129,0.22)]'
                  : 'bg-slate-900/35'
              }`}
            >
              <td className="px-3 py-2">
                Safer Route {isSaferActive ? '✅' : ''}
              </td>
              <td className="px-3 py-2">{saferResult.risk} {saferResult.risk === 'High' ? '🔴' : saferResult.risk === 'Medium' ? '🟡' : '🟢'}</td>
              <td className="px-3 py-2">{saferResult.riskPercent}%</td>
              <td className="px-3 py-2">{saferResult.timeMin} min</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-slate-300">
        Safety gain: <span className="font-semibold text-emerald-300">{Math.max(0, riskDelta)}%</span>
        {' '}| ETA trade-off: <span className="font-semibold text-sky-300">{timeDelta >= 0 ? '+' : ''}{timeDelta} min</span>
      </p>

      <p className="mt-2 text-xs text-emerald-200/90">
        {isSaferActive ? 'Safer route is active and highlighted on the map.' : 'Switch to safer route to reduce risk now.'}
      </p>

      <button
        onClick={() => onSwitch(activeRoute === 'current' ? 'safer' : 'current')}
        className="mt-3 rounded-xl border border-emerald-300/70 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-400/20"
      >
        Switch to {activeRoute === 'current' ? 'Safer Route' : 'Current Route'}
      </button>
    </section>
  )
}
