export default function SosButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="pulse-red fixed bottom-5 right-5 z-[1500] h-16 w-16 rounded-full bg-rose-600 text-lg font-bold text-white shadow-xl shadow-rose-900/70 sm:h-20 sm:w-20"
      aria-label="Emergency SOS"
    >
      SOS
    </button>
  )
}
