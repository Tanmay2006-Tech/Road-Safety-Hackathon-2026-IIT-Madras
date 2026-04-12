import { MapPin, PhoneCall, ShieldAlert } from 'lucide-react'

export default function SosOverlay({ open, location, emergencyProfile, onCopyEmergencyMessage, onClose }) {
  if (!open) return null

  const lat = Number.isFinite(location?.lat) ? location.lat.toFixed(5) : 'N/A'
  const lng = Number.isFinite(location?.lng) ? location.lng.toFixed(5) : 'N/A'
  const emergencyText = [
    `Emergency help needed. My live location is ${lat}, ${lng}.`,
    emergencyProfile?.fullName ? `Name: ${emergencyProfile.fullName}` : null,
    emergencyProfile?.phone ? `Phone: ${emergencyProfile.phone}` : null,
    emergencyProfile?.bloodGroup ? `Blood group: ${emergencyProfile.bloodGroup}` : null,
    emergencyProfile?.allergies ? `Allergies: ${emergencyProfile.allergies}` : null,
    emergencyProfile?.medicalNotes ? `Medical notes: ${emergencyProfile.medicalNotes}` : null,
  ].filter(Boolean).join('\n')

  async function copyEmergencyText() {
    if (!navigator.clipboard) {
      onCopyEmergencyMessage?.(false)
      return
    }

    try {
      await navigator.clipboard.writeText(emergencyText)
      onCopyEmergencyMessage?.(true)
    } catch {
      // Clipboard support can fail on insecure contexts.
      onCopyEmergencyMessage?.(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-rose-500/60 bg-slate-900 p-5 shadow-2xl shadow-rose-800/30">
        <div className="mb-3 flex items-center gap-2 text-rose-300">
          <ShieldAlert size={20} />
          <h3 className="text-lg font-semibold">Emergency SOS Activated</h3>
        </div>

        <p className="text-sm text-slate-300">Help message ready with your location details.</p>
        <p className="mt-3 flex items-center gap-2 rounded-lg bg-slate-950 p-3 text-xs text-slate-300">
          <MapPin size={14} className="text-emerald-300" />
          Coordinates: {lat}, {lng}
        </p>

        {emergencyProfile && (
          <div className="mt-3 rounded-lg border border-slate-700 bg-slate-950 p-3 text-xs text-slate-300">
            <p className="font-semibold text-slate-100">Emergency profile</p>
            <p className="mt-1">{emergencyProfile.fullName || 'Name not set'}</p>
            <p>{emergencyProfile.phone || 'Phone not set'}</p>
            {emergencyProfile.bloodGroup && <p>Blood group: {emergencyProfile.bloodGroup}</p>}
            {emergencyProfile.allergies && <p>Allergies: {emergencyProfile.allergies}</p>}
            {emergencyProfile.medicalNotes && <p>Medical notes: {emergencyProfile.medicalNotes}</p>}
            {emergencyProfile.emergencyContactName && emergencyProfile.emergencyContactPhone && (
              <a
                href={`tel:${emergencyProfile.emergencyContactPhone}`}
                className="mt-2 inline-flex items-center gap-1 rounded-lg border border-cyan-300/60 bg-cyan-300/10 px-2 py-1 text-cyan-100"
              >
                <PhoneCall size={12} />
                Call {emergencyProfile.emergencyContactName}
              </a>
            )}
          </div>
        )}

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <a href="tel:108" className="rounded-lg bg-rose-500 px-3 py-2 text-center text-sm font-semibold text-white">Ambulance 108</a>
          <a href="tel:100" className="rounded-lg bg-sky-500 px-3 py-2 text-center text-sm font-semibold text-white">Police 100</a>
          <a href="tel:101" className="rounded-lg bg-amber-500 px-3 py-2 text-center text-sm font-semibold text-slate-950">Fire 101</a>
        </div>

        <button
          onClick={copyEmergencyText}
          className="mt-3 rounded-lg border border-slate-600 px-3 py-2 text-xs text-slate-200"
        >
          Copy emergency message
        </button>

        <button
          onClick={onClose}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-600 px-3 py-2 text-xs text-slate-200"
        >
          <PhoneCall size={14} />
          Close SOS panel
        </button>
      </div>
    </div>
  )
}
