import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react'

const TOUR_STEPS = [
  {
    id: 'overview',
    title: 'Home',
    description: 'Quick snapshot of route risk, nearby help, and your recent checks.',
  },
  {
    id: 'route',
    title: 'Route',
    description: 'Enter trip points, run analysis, and compare safer options before travel.',
  },
  {
    id: 'map',
    title: 'Map',
    description: 'See hazards, emergency services, and route safety visuals in one place.',
  },
  {
    id: 'insights',
    title: 'Insights',
    description: 'Review risk reasons, confidence, and recommended safety actions.',
  },
  {
    id: 'safety',
    title: 'Safety',
    description: 'Manage trusted contacts, add hazards, and use auto crash detection.',
  },
  {
    id: 'emergency',
    title: 'Emergency',
    description: 'Open SOS quickly and use emergency support actions without delays.',
  },
]

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown']

export default function FirstTimeOnboarding({ initialStage = 'tour', initialProfile, onGoToSection, onSkip, onComplete }) {
  const [stage, setStage] = useState(initialStage)
  const [tourIndex, setTourIndex] = useState(0)
  const [error, setError] = useState('')
  const [profile, setProfile] = useState({
    fullName: initialProfile?.fullName || '',
    phone: initialProfile?.phone || '',
    bloodGroup: initialProfile?.bloodGroup || 'Unknown',
    allergies: initialProfile?.allergies || '',
    medicalNotes: initialProfile?.medicalNotes || '',
    emergencyContactName: initialProfile?.emergencyContactName || '',
    emergencyContactPhone: initialProfile?.emergencyContactPhone || '',
  })

  const progress = useMemo(() => {
    if (stage === 'tour') {
      return Math.round(((tourIndex + 1) / (TOUR_STEPS.length + 1)) * 100)
    }

    return 100
  }, [stage, tourIndex])

  useEffect(() => {
    if (stage === 'tour') {
      const activeTourStep = TOUR_STEPS[tourIndex]
      if (activeTourStep) {
        onGoToSection(activeTourStep.id)
      }
    }
  }, [onGoToSection, stage, tourIndex])

  const activeTourStep = TOUR_STEPS[tourIndex]
  const canGoBack = tourIndex > 0
  const isLastTourStep = tourIndex === TOUR_STEPS.length - 1

  function sanitizePhone(value) {
    return value.replace(/[^0-9+]/g, '')
  }

  function updateProfile(field, value) {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  function nextTourStep() {
    if (isLastTourStep) {
      setStage('profile')
      setError('')
      onGoToSection('safety')
      return
    }

    setTourIndex((prev) => prev + 1)
  }

  function previousTourStep() {
    if (!canGoBack) return
    setTourIndex((prev) => prev - 1)
  }

  function handleSubmit(event) {
    event.preventDefault()
    const sanitizedUserPhone = sanitizePhone(profile.phone)
    const sanitizedEmergencyPhone = sanitizePhone(profile.emergencyContactPhone)

    if (!profile.fullName.trim()) {
      setError('Please enter your name.')
      return
    }

    if (!sanitizedUserPhone) {
      setError('Please enter your phone number.')
      return
    }

    if (!profile.emergencyContactName.trim() || !sanitizedEmergencyPhone) {
      setError('Please add at least one emergency contact name and phone.')
      return
    }

    onComplete({
      ...profile,
      fullName: profile.fullName.trim(),
      phone: sanitizedUserPhone,
      allergies: profile.allergies.trim(),
      medicalNotes: profile.medicalNotes.trim(),
      emergencyContactName: profile.emergencyContactName.trim(),
      emergencyContactPhone: sanitizedEmergencyPhone,
    })
  }

  return (
    <div className="fixed inset-0 z-[2200] bg-slate-950/90 p-3 sm:p-6">
      <div className="mx-auto w-full max-w-3xl rounded-3xl border border-slate-700 bg-[#050c1a] p-4 shadow-2xl shadow-cyan-900/20 sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-200">Welcome to RiskPath</p>
            <h2 className="mt-2 font-display text-2xl text-white sm:text-3xl">Quick setup for safer travel</h2>
            <p className="mt-2 text-sm text-slate-300">
              First, we will show what each section does. Then we will save essential emergency details.
            </p>
          </div>
          <button
            type="button"
            onClick={onSkip}
            className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-slate-400 hover:text-white"
          >
            Skip for now
          </button>
        </div>

        <div className="mb-5 h-2 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full rounded-full bg-cyan-300/80 transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>

        {stage === 'tour' ? (
          <section className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 p-4 sm:p-5">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-200/40 bg-cyan-300/15 px-3 py-1 text-xs text-cyan-100">
              <ShieldCheck size={13} />
              Step {tourIndex + 1} of {TOUR_STEPS.length}: {activeTourStep.title}
            </div>

            <h3 className="text-xl font-semibold text-white">{activeTourStep.title} section</h3>
            <p className="mt-2 text-sm text-slate-200">{activeTourStep.description}</p>

            <p className="mt-4 rounded-xl border border-slate-700 bg-slate-900/65 px-3 py-2 text-xs text-slate-300">
              The main screen is switched in the background so users can visually connect this explanation with the actual section.
            </p>

            <div className="mt-5 flex items-center justify-between">
              <button
                type="button"
                onClick={previousTourStep}
                disabled={!canGoBack}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-600 px-3 py-2 text-xs text-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft size={14} /> Back
              </button>
              <button
                type="button"
                onClick={nextTourStep}
                className="inline-flex items-center gap-1 rounded-lg bg-cyan-300 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-200"
              >
                {isLastTourStep ? 'Continue setup' : 'Next'} <ChevronRight size={14} />
              </button>
            </div>
          </section>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-rose-300/30 bg-rose-400/10 p-4 sm:p-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-300/40 bg-rose-400/10 px-3 py-1 text-xs text-rose-100">
              <AlertTriangle size={13} /> Emergency profile setup
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm text-slate-200">
                Your name *
                <input
                  value={profile.fullName}
                  onChange={(event) => updateProfile('fullName', event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-300"
                  placeholder="Full name"
                />
              </label>

              <label className="text-sm text-slate-200">
                Your phone *
                <input
                  value={profile.phone}
                  onChange={(event) => updateProfile('phone', event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-300"
                  placeholder="+91..."
                />
              </label>

              <label className="text-sm text-slate-200">
                Blood group
                <select
                  value={profile.bloodGroup}
                  onChange={(event) => updateProfile('bloodGroup', event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-300"
                >
                  {BLOOD_GROUPS.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm text-slate-200">
                Allergy info
                <input
                  value={profile.allergies}
                  onChange={(event) => updateProfile('allergies', event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-300"
                  placeholder="Example: Penicillin"
                />
              </label>

              <label className="text-sm text-slate-200 sm:col-span-2">
                Medical notes
                <textarea
                  value={profile.medicalNotes}
                  onChange={(event) => updateProfile('medicalNotes', event.target.value)}
                  className="mt-1 h-20 w-full rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-300"
                  placeholder="Anything responders should know (conditions, medications, etc.)"
                />
              </label>

              <label className="text-sm text-slate-200">
                Emergency contact name *
                <input
                  value={profile.emergencyContactName}
                  onChange={(event) => updateProfile('emergencyContactName', event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-300"
                  placeholder="Primary contact"
                />
              </label>

              <label className="text-sm text-slate-200">
                Emergency contact phone *
                <input
                  value={profile.emergencyContactPhone}
                  onChange={(event) => updateProfile('emergencyContactPhone', event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-300"
                  placeholder="+91..."
                />
              </label>
            </div>

            {error && <p className="rounded-xl border border-rose-300/50 bg-rose-500/10 px-3 py-2 text-xs text-rose-100">{error}</p>}

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setStage('tour')
                  setError('')
                  onGoToSection(TOUR_STEPS[TOUR_STEPS.length - 1].id)
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-600 px-3 py-2 text-xs text-slate-200"
              >
                <ChevronLeft size={14} /> Back to tour
              </button>
              <button
                type="submit"
                className="rounded-lg bg-rose-400 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-rose-300"
              >
                Save and start using app
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}