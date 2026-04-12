import { AlertTriangle, Plus } from 'lucide-react'
import { useState } from 'react'

const hazardTypes = ['Pothole', 'Waterlogging', 'Low visibility', 'Accident spot', 'Roadblock']

export default function HazardReporterPanel({ onAddHazard, onToggleClickMode, clickMode }) {
  const [hazardType, setHazardType] = useState(hazardTypes[0])

  function addNearUser() {
    onAddHazard({
      type: hazardType,
      source: 'quick-report',
    })
  }

  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-300">
          <AlertTriangle size={14} /> Hazard Reporter
        </h2>
        <button
          onClick={onToggleClickMode}
          className={`rounded-lg border px-2 py-1 text-xs ${
            clickMode ? 'border-amber-300/60 bg-amber-400/10 text-amber-200' : 'border-slate-700 text-slate-300'
          }`}
        >
          {clickMode ? 'Map click mode: on' : 'Map click mode: off'}
        </button>
      </div>

      <div className="flex items-center gap-2">
        <select
          value={hazardType}
          onChange={(event) => setHazardType(event.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-sm text-slate-100"
        >
          {hazardTypes.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
        <button onClick={addNearUser} className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-200">
          <Plus size={13} /> Quick report near me
        </button>
      </div>

      <p className="mt-2 text-xs text-slate-500">
        Use map click mode to place hazard markers at exact locations.
      </p>
    </section>
  )
}
