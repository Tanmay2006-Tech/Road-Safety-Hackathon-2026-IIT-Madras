import { CloudRain, CloudSun, EyeOff } from 'lucide-react'

function weatherIcon(condition) {
  if (condition === 'Rain') return <CloudRain size={16} className="text-sky-300" />
  if (condition === 'Fog') return <EyeOff size={16} className="text-slate-300" />
  return <CloudSun size={16} className="text-amber-300" />
}

const warningByCondition = {
  Clear: 'Road visibility is stable for now.',
  Rain: 'Increased accident risk due to low tyre grip and visibility.',
  Fog: 'Increased accident risk due to visibility drop.',
}

export default function WeatherCard({ weather, forcedCondition }) {
  const conditionToShow = forcedCondition || weather.condition

  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4 sm:p-5">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-100">
        {weatherIcon(conditionToShow)}
        <span>Real-Time Weather</span>
      </div>
      <p className="text-sm text-slate-200">Weather: {conditionToShow}</p>
      <p className="mt-1 text-sm text-slate-400">{warningByCondition[conditionToShow] || weather.warning}</p>
      <p className="mt-2 text-xs text-slate-500">
        Temp: {weather.temperature}°C {weather.source === 'fallback' ? '(demo)' : '(OpenWeather)'}
      </p>
    </section>
  )
}
