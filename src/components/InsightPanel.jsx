import { AlertTriangle, BadgeInfo, Copy, Download, FileText, Volume2 } from 'lucide-react'

export default function InsightPanel({
  riskEval,
  voiceEnabled,
  onToggleVoice,
  onExportJson,
  onExportText,
  onExportMarkdown,
  onCopySummary,
}) {
  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Trip insights</h2>
        <button
          onClick={onToggleVoice}
          className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs ${
            voiceEnabled
              ? 'border-emerald-300/60 bg-emerald-300/15 text-emerald-200'
              : 'border-slate-700 text-slate-300'
          }`}
        >
          <Volume2 size={12} /> Voice alerts {voiceEnabled ? 'on' : 'off'}
        </button>
      </div>

      {!riskEval ? (
        <p className="text-sm text-slate-400">Run route analysis to see actionable insights.</p>
      ) : (
        <>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-slate-300">
              <p className="mb-1 inline-flex items-center gap-1 text-amber-300"><AlertTriangle size={14} /> Immediate action</p>
              <p>Avoid hard braking in highlighted red stretches. Keep at least 3-second gap.</p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-slate-300">
              <p className="mb-1 inline-flex items-center gap-1 text-sky-300"><BadgeInfo size={14} /> Route note</p>
              <p>{riskEval.risk === 'High' ? 'Switch to the safer route even if ETA increases by 2-4 mins.' : 'Current route is manageable. Keep speed discipline near hotspots.'}</p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={onExportJson} className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200">
              <Download size={13} /> Export JSON report
            </button>
            <button onClick={onExportText} className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200">
              <FileText size={13} /> Export quick brief
            </button>
            <button onClick={onExportMarkdown} className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200">
              <FileText size={13} /> Export evidence pack
            </button>
            <button onClick={onCopySummary} className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200">
              <Copy size={13} /> Copy summary
            </button>
          </div>
        </>
      )}
    </section>
  )
}
