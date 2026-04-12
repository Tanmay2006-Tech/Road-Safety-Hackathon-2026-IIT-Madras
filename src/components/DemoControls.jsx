export default function DemoControls({ demoState, onToggle }) {
  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Demo Mode</h2>
        <span className="text-xs text-slate-500">Simulate road conditions</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { key: 'rain', label: 'Rain' },
          { key: 'night', label: 'Night' },
          { key: 'heavyTraffic', label: 'Heavy traffic' },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => onToggle(item.key)}
            className={`rounded-xl border px-3 py-2 text-xs font-medium transition ${
              demoState[item.key]
                ? 'border-amber-300 bg-amber-300/20 text-amber-200'
                : 'border-slate-700 bg-slate-950 text-slate-400 hover:border-slate-500 hover:text-slate-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </section>
  )
}
