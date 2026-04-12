const shortcuts = [
  { keys: 'Shift + Enter', action: 'Analyze route now' },
  { keys: 'Alt + S', action: 'Open SOS overlay' },
  { keys: 'Alt + L', action: 'Toggle live monitor' },
  { keys: 'Alt + D', action: 'Run demo scenario' },
]

export default function CommandCenterPanel({ onAnalyze, onOpenSos, onToggleMonitor, onAutoDemo, liveMonitorOn }) {
  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Command Center</h3>
        <p className="text-xs text-slate-400">Keyboard and quick controls</p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <button onClick={onAnalyze} className="rounded-xl bg-emerald-400 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-300">
          Analyze now
        </button>
        <button onClick={onAutoDemo} className="rounded-xl border border-indigo-300/60 bg-indigo-500/15 px-3 py-2 text-sm font-semibold text-indigo-100 hover:bg-indigo-500/25">
          Run demo scenario
        </button>
        <button onClick={onOpenSos} className="rounded-xl border border-rose-300/60 bg-rose-500/15 px-3 py-2 text-sm font-semibold text-rose-100 hover:bg-rose-500/25">
          Trigger SOS
        </button>
        <button
          onClick={onToggleMonitor}
          className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
            liveMonitorOn
              ? 'border-emerald-300/60 bg-emerald-400/15 text-emerald-200'
              : 'border-slate-600 bg-slate-900 text-slate-200 hover:border-emerald-300/60 hover:text-emerald-200'
          }`}
        >
          {liveMonitorOn ? 'Live monitor: ON' : 'Live monitor: OFF'}
        </button>
      </div>

      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-xs text-slate-300">
        {shortcuts.map((item) => (
          <div key={item.keys} className="flex items-center justify-between border-b border-slate-800/70 py-1.5 last:border-b-0">
            <span className="font-semibold text-emerald-300">{item.keys}</span>
            <span>{item.action}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
