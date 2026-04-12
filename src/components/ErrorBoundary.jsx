import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, errorMessage: '' }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error?.message || 'Unknown runtime error' }
  }

  componentDidCatch(error) {
    // Keeps crash details for local debugging without introducing external telemetry.
    console.error('RiskPath UI crash:', error)
  }

  handleRefresh = () => {
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    return (
      <main className="grid min-h-screen place-items-center bg-ink px-4 text-slate-100">
        <section className="w-full max-w-lg rounded-2xl border border-rose-400/40 bg-slate-900/90 p-6 text-center shadow-2xl shadow-rose-500/10">
          <p className="text-xs uppercase tracking-[0.2em] text-rose-300">Recovery Mode</p>
          <h1 className="mt-2 font-display text-2xl font-bold">RiskPath hit an unexpected error</h1>
          <p className="mt-3 text-sm text-slate-300">
            The app failed safely. Refresh to continue route analysis and emergency features.
          </p>
          <p className="mt-2 rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-400">
            Error: {this.state.errorMessage}
          </p>
          <button
            onClick={this.handleRefresh}
            className="mt-5 rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-400"
          >
            Reload application
          </button>
        </section>
      </main>
    )
  }
}
