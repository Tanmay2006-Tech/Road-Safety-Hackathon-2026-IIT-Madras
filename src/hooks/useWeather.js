import { useEffect, useState } from 'react'

const weatherWarnings = {
  Clear: 'Road visibility is stable for now.',
  Rain: 'Increased accident risk due to low tyre grip and visibility.',
  Fog: 'Increased accident risk due to visibility drop.',
}

function normalizeOpenMeteo(code) {
  // Open-Meteo weather codes: https://open-meteo.com/en/docs
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code)) return 'Rain'
  if ([45, 48].includes(code)) return 'Fog'
  return 'Clear'
}

function normalizeWeather(apiCondition) {
  if (!apiCondition) return 'Clear'

  const condition = apiCondition.toLowerCase()
  if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('storm')) return 'Rain'
  if (condition.includes('fog') || condition.includes('mist') || condition.includes('haze') || condition.includes('smoke')) return 'Fog'

  return 'Clear'
}

export function useWeather(location) {
  const [weather, setWeather] = useState({
    condition: 'Clear',
    temperature: 30,
    warning: weatherWarnings.Clear,
    source: 'fallback',
  })

  useEffect(() => {
    const controller = new AbortController()

    async function fetchWeather() {
      const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY
      if (!location?.lat || !location?.lng) return

      try {
        if (apiKey) {
          const params = new URLSearchParams({
            lat: location.lat,
            lon: location.lng,
            units: 'metric',
            appid: apiKey,
          })

          const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?${params}`, {
            signal: controller.signal,
          })
          if (!response.ok) throw new Error('openweather_failed')

          const data = await response.json()
          const condition = normalizeWeather(data.weather?.[0]?.main)

          setWeather({
            condition,
            temperature: Math.round(data.main?.temp ?? 30),
            warning: weatherWarnings[condition],
            source: 'openweather',
          })
          return
        }

        throw new Error('openweather_missing')
      } catch (error) {
        if (error?.name === 'AbortError') {
          return
        }

        try {
          const params = new URLSearchParams({
            latitude: String(location.lat),
            longitude: String(location.lng),
            current_weather: 'true',
            timezone: 'auto',
          })
          const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
            signal: controller.signal,
          })
          if (!response.ok) throw new Error('openmeteo_failed')

          const data = await response.json()
          const code = Number(data?.current_weather?.weathercode)
          const condition = normalizeOpenMeteo(code)

          setWeather({
            condition,
            temperature: Math.round(data?.current_weather?.temperature ?? 30),
            warning: weatherWarnings[condition],
            source: 'open-meteo',
          })
        } catch {
          // Keep fallback weather if both APIs fail.
        }
      }
    }

    fetchWeather()

    return () => {
      controller.abort()
    }
  }, [location?.lat, location?.lng])

  return weather
}
