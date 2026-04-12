export default function Navbar() {
  return (
    <header className="sticky top-0 z-[1200] border-b border-cyan-200/10 bg-[#060b17]/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1480px] items-center justify-between px-4 py-3 sm:px-6 lg:px-10">
        <div className="flex items-center gap-3 sm:gap-4">
          <img
            src="/riskpath-logo.svg"
            alt="RiskPath logo"
            className="h-10 w-10 rounded-xl border border-cyan-200/30 bg-[#0f1d34] p-1 shadow-lg shadow-cyan-900/25"
          />
          <div>
            <p className="font-display text-xl tracking-wide text-white sm:text-2xl">RiskPath</p>
            <p className="text-[11px] text-cyan-100/80 sm:text-xs">Know the risk before the road.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <p className="rounded-full border border-cyan-200/20 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100">
            Home Dashboard
          </p>
        </div>
      </div>
    </header>
  )
}
