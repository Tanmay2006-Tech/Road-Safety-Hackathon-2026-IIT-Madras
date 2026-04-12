import { useEffect, useState } from 'react'

const fallback = {
  lat: 13.0827,
  lng: 80.2707,
}

const supportsGeolocation = typeof navigator !== 'undefined' && Boolean(navigator.geolocation)

export function useUserLocation() {
  const [location, setLocation] = useState(fallback)
  const [locationError, setLocationError] = useState(
    supportsGeolocation ? '' : 'Location not supported. Using Chennai as default.',
  )

  useEffect(() => {
    if (!supportsGeolocation) {
      return
    }

    let isMounted = true

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!isMounted) return
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
      () => {
        if (!isMounted) return
        setLocationError('Location access denied. Showing default map center.')
      },
      {
        enableHighAccuracy: true,
        timeout: 9000,
      },
    )

    return () => {
      isMounted = false
    }
  }, [])

  return { location, locationError }
}
