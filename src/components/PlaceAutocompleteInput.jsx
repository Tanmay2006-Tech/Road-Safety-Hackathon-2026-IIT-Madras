import { useEffect, useMemo, useState } from 'react'
import { fetchPlaceSuggestions } from '../utils/mapServices'

export default function PlaceAutocompleteInput({
  value,
  onChange,
  placeholder,
  scope = 'in',
  className,
}) {
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const inputClassName = useMemo(
    () =>
      className ||
      'w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-emerald-400',
    [className],
  )

  useEffect(() => {
    let alive = true
    const controller = new AbortController()

    const timer = setTimeout(async () => {
      const trimmed = value?.trim()
      if (!trimmed || trimmed.length < 2) {
        if (alive) {
          setSuggestions([])
          setOpen(false)
        }
        return
      }

      try {
        const next = await fetchPlaceSuggestions(trimmed, {
          countryCode: scope,
          limit: 6,
          signal: controller.signal,
        })

        if (!alive) return
        setSuggestions(next)
        setOpen(next.length > 0)
        setActiveIndex(next.length ? 0 : -1)
      } catch {
        if (!alive) return
        setSuggestions([])
        setOpen(false)
        setActiveIndex(-1)
      }
    }, 260)

    return () => {
      alive = false
      clearTimeout(timer)
      controller.abort()
    }
  }, [value, scope])

  return (
    <div className="relative">
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => {
          if (suggestions.length > 0) setOpen(true)
        }}
        onKeyDown={(event) => {
          if (!open || !suggestions.length) return

          if (event.key === 'ArrowDown') {
            event.preventDefault()
            setActiveIndex((prev) => (prev + 1) % suggestions.length)
          }

          if (event.key === 'ArrowUp') {
            event.preventDefault()
            setActiveIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1))
          }

          if (event.key === 'Enter' && activeIndex >= 0) {
            event.preventDefault()
            onChange(suggestions[activeIndex].label)
            setOpen(false)
          }

          if (event.key === 'Escape') {
            setOpen(false)
          }
        }}
        onBlur={() => {
          setTimeout(() => setOpen(false), 140)
        }}
        placeholder={placeholder}
        className={inputClassName}
        autoComplete="off"
      />

      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-[1400] max-h-56 overflow-auto rounded-xl border border-slate-700 bg-[#060f21] p-1 shadow-2xl shadow-black/40">
          {suggestions.map((item, index) => (
            <button
              key={item.label}
              type="button"
              onMouseDown={(event) => {
                event.preventDefault()
                onChange(item.label)
                setOpen(false)
              }}
              className={`block w-full rounded-lg px-2 py-2 text-left text-xs transition ${
                index === activeIndex ? 'bg-slate-800 text-white' : 'text-slate-200 hover:bg-slate-800'
              }`}
            >
              {item.shortLabel}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
