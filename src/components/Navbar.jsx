export default function Navbar() {
  return (
    <header className="sticky top-0 z-[1200] border-b border-cyan-200/10 bg-[#060b17]/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1480px] items-center justify-between px-4 py-3 sm:px-6 lg:px-10">
        <div className="flex items-center gap-3 sm:gap-4">
          <img
            src="/riskpath-logo.svg"
            alt="RiskPath logo"
            className="h-11 w-11 shrink-0 rounded-2xl bg-white p-1.5 shadow-lg shadow-cyan-900/20 ring-1 ring-white/10 sm:h-12 sm:w-12 sm:p-2"
          />
          <div>
            <p className="font-display text-xl tracking-wide text-white sm:text-2xl">RiskPath</p>
            <p className="text-[11px] text-cyan-100/80 sm:text-xs">Know the risk before the road.</p>
          </div>
        </div>
        <div />
      </div>
    </header>
  )
}
