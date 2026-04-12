export default function TripHistoryPanel({ items }) {
  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4 sm:p-5">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-300">Recent routes</h2>

      {!items.length ? (
        <p className="text-sm text-slate-500">No analyzed trips yet.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="rounded-xl border border-slate-700 bg-slate-950 p-3">
              <p className="text-xs text-slate-400">{item.from} to {item.to}</p>
              <div className="mt-1 flex items-center justify-between text-sm">
                <p className="font-semibold text-slate-100">{item.risk} ({item.riskPercent}%)</p>
                <p className="text-slate-400">{item.timeMin} min</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
