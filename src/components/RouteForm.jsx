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
}) {
  return (
    <section id="analyzer" className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4 shadow-xl shadow-black/20 sm:p-5">
      <h2 className="mb-3 text-lg font-semibold text-slate-100">Route Risk Analyzer</h2>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          onAnalyze()
        }}
        className="grid gap-3 md:grid-cols-3"
      >
        <select
          value={scope}
          onChange={(event) => onScopeChange(event.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400"
        >
          <option value="in">India mode (RoadSoS default)</option>
          <option value="global">Global mode (cross-country)</option>
        </select>
        <PlaceAutocompleteInput
          value={start}
          onChange={onStartChange}
          placeholder="Start (Eg: Adyar, Chennai)"
          scope={scope}
        />
        <PlaceAutocompleteInput
          value={destination}
          onChange={onDestinationChange}
          placeholder="Destination (Eg: T Nagar, Chennai)"
          scope={scope}
        />
        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={loading || !start || !destination}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} />}
            {loading ? 'Analyzing route...' : 'Analyze risk'}
          </button>
          <button
            type="button"
            onClick={onClear}
            className="rounded-xl border border-slate-600 px-3 py-2.5 text-xs font-semibold text-slate-200 transition hover:border-emerald-300/70 hover:text-emerald-200"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={onUseCurrentLocation}
            disabled={!hasCurrentLocation}
            className="rounded-xl border border-slate-600 px-3 py-2.5 text-xs font-semibold text-slate-200 transition hover:border-emerald-300/70 hover:text-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Current location
          </button>
        </div>
      </form>
    </section>
  )
}
