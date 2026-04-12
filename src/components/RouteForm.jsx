import { useRef } from 'react'
import { Loader2, Navigation } from 'lucide-react'
import PlaceAutocompleteInput from './PlaceAutocompleteInput'

export default function RouteForm({
  start,
  destination,
  scope,
  onScopeChange,
  onStartChange,
  onDestinationChange,
  onAnalyze,
  onClear,
  onUseCurrentLocation,
  hasCurrentLocation,
  loading,
  statusMessage,
  result,
  onViewMap,
  onOpenInsights,
}) {
  const resultPanelRef = useRef(null)

  const reasonLines = Array.isArray(result?.reasons)
    ? result.reasons
        .slice(0, 3)
        .map((reason) => {
          if (typeof reason === 'string') return reason
          if (reason && typeof reason === 'object') {
            const factor = reason.factor || 'Factor'
            const impact = reason.impact || ''
            return impact ? `${factor}: ${impact}` : String(factor)
          }
          return String(reason)
        })
    : []

  async function handleSubmit(event) {
    event.preventDefault()
    await onAnalyze()

    requestAnimationFrame(() => {
      resultPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  return (
    <section id="analyzer" className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4 shadow-xl shadow-black/20 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-100">Start here</h2>
        <p className="text-xs text-slate-400">Enter a route and see the risk instantly.</p>
      </div>
      <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-3">
        <select
          value={scope}
          onChange={(event) => onScopeChange(event.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400"
        >
          <option value="in">India</option>
          <option value="global">Global</option>
        </select>
        <PlaceAutocompleteInput
          value={start}
          onChange={onStartChange}
          placeholder="Where are you starting?"
          scope={scope}
        />
        <PlaceAutocompleteInput
          value={destination}
          onChange={onDestinationChange}
          placeholder="Where are you going?"
          scope={scope}
        />
        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={loading || !start || !destination}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} />}
            {loading ? 'Checking...' : 'Show risk'}
          </button>
          <button
            type="button"
            onClick={onClear}
            className="rounded-xl border border-slate-600 px-3 py-2.5 text-xs font-semibold text-slate-200 transition hover:border-emerald-300/70 hover:text-emerald-200"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onUseCurrentLocation}
            disabled={!hasCurrentLocation}
            className="rounded-xl border border-slate-600 px-3 py-2.5 text-xs font-semibold text-slate-200 transition hover:border-emerald-300/70 hover:text-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Use live location
          </button>
        </div>
      </form>

      <div ref={resultPanelRef} className="mt-4 rounded-xl border-2 border-cyan-300/55 bg-[#08162d] p-3 shadow-lg shadow-cyan-950/20">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-100">Result panel</p>
          <p className="text-xs text-slate-300">Updates after you click Show risk</p>
        </div>

        {loading && (
          <div className="mt-3 rounded-xl border border-cyan-300/25 bg-cyan-300/8 p-3 text-sm text-cyan-100">
            Checking route risk and nearby support...
          </div>
        )}

        {!loading && statusMessage && (
          <div className="mt-3 rounded-xl border border-rose-300/45 bg-rose-500/10 p-3 text-sm text-rose-100">
            {statusMessage}
          </div>
        )}

        {!loading && !statusMessage && !result && (
          <div className="mt-3 rounded-xl border border-slate-700 bg-slate-900/70 p-3 text-sm text-slate-300">
            No result yet. Enter start and destination, then click Show risk.
          </div>
        )}

        {!loading && !statusMessage && result && (
          <>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div>
                <p className="text-xs text-slate-400">Risk level</p>
                <p className="mt-1 text-2xl font-semibold text-white">{result.risk}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Risk score</p>
                <p className="mt-1 text-2xl font-semibold text-white">{result.riskPercent}%</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">High-risk segments</p>
                <p className="mt-1 text-2xl font-semibold text-white">{result.highRiskSegments}</p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onViewMap}
                className="rounded-lg border border-cyan-300/50 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold text-cyan-100"
              >
                View on map
              </button>
              <button
                type="button"
                onClick={onOpenInsights}
                className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs font-semibold text-slate-200"
              >
                Open insights
              </button>
            </div>

            <div className="mt-4 rounded-xl border border-slate-700 bg-slate-900/70 p-3">
              <p className="text-xs uppercase tracking-[0.15em] text-cyan-200">Why this result</p>
              {reasonLines.length > 0 ? (
                <ul className="mt-2 space-y-1 text-xs text-slate-300">
                  {reasonLines.map((line) => (
                    <li key={line}>- {line}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-xs text-slate-400">No detailed reason available yet for this route.</p>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
