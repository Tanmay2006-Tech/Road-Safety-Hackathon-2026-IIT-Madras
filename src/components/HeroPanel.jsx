import { ShieldCheck, Siren, TimerReset } from 'lucide-react'

const cardData = [
  {
    icon: ShieldCheck,
    label: 'Prevention-first score',
    value: '92%',
    note: 'routes scanned before driving',
  },
  {
    icon: Siren,
    label: 'Emergency readiness',
    value: '24x7',
    note: 'instant SOS with location',
  },
  {
    icon: TimerReset,
    label: 'Avg alert lead time',
    value: '2.3 min',
    note: 'before dangerous segments',
  },
]

export default function HeroPanel() {
  return (
    <section className="rp-card rp-enter relative overflow-hidden rounded-3xl p-5 sm:p-7">
      <div className="pointer-events-none absolute -top-8 right-3 h-32 w-32 rounded-full bg-cyan-300/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 left-12 h-40 w-40 rounded-full bg-amber-300/20 blur-3xl" />

      <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-200 sm:text-xs">Premium Mobility Risk Intelligence</p>
      <h1 className="mt-3 max-w-3xl font-display text-3xl font-extrabold leading-tight text-cyan-50 sm:text-4xl lg:text-5xl">
        Predict danger early.
        <span className="block text-amber-200">Drive with confidence, not guesswork.</span>
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-slate-200 sm:text-base">
        RiskPath fuses route geometry, weather volatility, traffic pressure, and risk explainability into one live command center built for Indian roads.
      </p>

      <div className="mt-5 flex flex-wrap gap-2.5">
        <a
          href="#analyzer"
          className="rounded-xl bg-cyan-200 px-4 py-2 text-sm font-semibold text-slate-950 shadow-[0_10px_26px_rgba(15,196,224,0.26)] transition hover:bg-cyan-100"
        >
          Start risk analysis
        </a>
        <a
          href="#map"
          className="rounded-xl border border-amber-200/45 bg-amber-200/10 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:border-amber-200/70 hover:bg-amber-200/15"
        >
          Open live operations map
        </a>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {cardData.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="rounded-2xl border border-slate-200/15 bg-[#08162b]/80 p-3.5">
              <div className="flex items-center justify-between text-slate-300">
                <p className="text-xs tracking-wide text-slate-300">{card.label}</p>
                <Icon size={15} />
              </div>
              <p className="mt-2 text-2xl font-semibold text-cyan-100">{card.value}</p>
              <p className="text-xs text-slate-400">{card.note}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
