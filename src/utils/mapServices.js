const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org/search'
const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving'
const OVERPASS_URLS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.openstreetmap.ru/api/interpreter',
]

export const EMERGENCY_CATEGORIES = [
  'hospital',
  'police',
  'fire_station',
  'clinic',
  'pharmacy',
  'ambulance_station',
  'roadside_assistance',
  'puncture_repair',
  'showroom',
]

const OVERPASS_CATEGORY_QUERY = {
  hospital: 'nwr["amenity"="hospital"]',
  police: 'nwr["amenity"="police"]',
  fire_station: 'nwr["amenity"="fire_station"]',
  clinic: 'nwr["amenity"="clinic"]',
  pharmacy: 'nwr["amenity"="pharmacy"]',
  ambulance_station: 'nwr["emergency"="ambulance_station"]',
  roadside_assistance: 'nwr["service:towing"="yes"]',
  puncture_repair: 'nwr["shop"="car_repair"]',
  showroom: 'nwr["shop"="car"]',
}

export async function geocodePlace(query, options = {}) {
  const countryCode = options.countryCode || 'in'
  const raw = query?.trim()
  if (!raw) throw new Error('Please enter a location')

  async function runGeocodeSearch(text, mode = countryCode) {
    const params = new URLSearchParams({
      q: mode === 'in' ? `${text}, India` : text,
      format: 'json',
      limit: '1',
      addressdetails: '1',
    })

    if (mode !== 'global') {
      params.set('countrycodes', mode)
    }

    const response = await fetch(`${NOMINATIM_BASE}?${params.toString()}`)
    if (!response.ok) return []
    return await response.json()
  }

  // Try progressive fallbacks for long or highly specific addresses.
  const candidates = [raw]
  if (raw.includes(',')) {
    const chunks = raw.split(',').map((part) => part.trim()).filter(Boolean)
    if (chunks.length >= 2) candidates.push(`${chunks[0]}, ${chunks[1]}`)
    candidates.push(chunks[0])
  }

  let data = []
  for (const candidate of candidates) {
    data = await runGeocodeSearch(candidate, countryCode)
    if (data.length) break
  }

  // Fallback to unrestricted global search if country-scoped search fails.
  if (!data.length && countryCode !== 'global') {
    for (const candidate of candidates) {
      data = await runGeocodeSearch(candidate, 'global')
      if (data.length) break
    }
  }

  if (!data.length) throw new Error(`No location found for ${query}`)

  return {
    lat: Number(data[0].lat),
    lng: Number(data[0].lon),
    label: data[0].display_name,
  }
}

export async function fetchPlaceSuggestions(query, options = {}) {
  const countryCode = options.countryCode || 'in'
  const limit = options.limit || 5
  const signal = options.signal
  const trimmed = query?.trim()

  if (!trimmed || trimmed.length < 2) {
    return []
  }

  async function runSuggestionSearch(mode) {
    const params = new URLSearchParams({
      q: mode === 'in' ? `${trimmed}, India` : trimmed,
      format: 'json',
      limit: String(limit),
      addressdetails: '1',
    })

    if (mode !== 'global') {
      params.set('countrycodes', mode)
    }

    const response = await fetch(`${NOMINATIM_BASE}?${params.toString()}`, { signal })
    if (!response.ok) return []

    const data = await response.json()
    return (data || []).map((item) => ({
      label: item.display_name,
      shortLabel: item.display_name?.split(',').slice(0, 3).join(',') || item.display_name,
    }))
  }

  const primary = await runSuggestionSearch(countryCode)
  if (countryCode === 'global' || primary.length >= limit) {
    return primary.slice(0, limit)
  }

  const fallbackGlobal = await runSuggestionSearch('global')
  const merged = new Map()

  ;[...primary, ...fallbackGlobal].forEach((item) => {
    if (merged.size >= limit) return
    if (!merged.has(item.label)) {
      merged.set(item.label, item)
    }
  })

  return [...merged.values()].slice(0, limit)
}

export async function fetchRoutes(start, end) {
  const routeQuery = `${start.lng},${start.lat};${end.lng},${end.lat}`
  const params = new URLSearchParams({
    overview: 'full',
    geometries: 'geojson',
    alternatives: 'true',
    steps: 'false',
  })

  const response = await fetch(`${OSRM_BASE}/${routeQuery}?${params.toString()}`)
  if (!response.ok) throw new Error('Unable to fetch route at the moment')

  const data = await response.json()
  if (!data.routes?.length) throw new Error('No drivable route found')

  const all = data.routes.map((route, index) => ({
    id: `route-${index + 1}`,
    distanceKm: route.distance / 1000,
    durationMin: Math.round(route.duration / 60),
    coordinates: route.geometry.coordinates,
  }))

  return {
    current: all[0],
    alternatives: all.slice(1),
  }
}

function getElementLatLng(item) {
  if (typeof item.lat === 'number' && typeof item.lon === 'number') {
    return { lat: item.lat, lng: item.lon }
  }

  if (item.center && typeof item.center.lat === 'number' && typeof item.center.lon === 'number') {
    return { lat: item.center.lat, lng: item.center.lon }
  }

  return null
}

function detectEmergencyType(tags = {}) {
  if (tags.emergency === 'ambulance_station') return 'ambulance_station'
  if (tags['service:towing'] === 'yes') return 'roadside_assistance'
  if (tags.shop === 'car_repair') return 'puncture_repair'
  if (tags.shop === 'car') return 'showroom'
  return tags.amenity || 'service'
}

function buildFallbackEssentials(lat, lng, categories = EMERGENCY_CATEGORIES) {
  const offsets = [
    [0.008, 0.006],
    [-0.007, 0.005],
    [0.006, -0.007],
    [-0.005, -0.006],
    [0.01, 0],
    [0, 0.01],
  ]

  return categories.map((category, index) => {
    const [dLat, dLng] = offsets[index % offsets.length]
    const typeLabel = category.replace('_', ' ')

    return {
      id: `fallback-${category}-${index}`,
      lat: Number((lat + dLat).toFixed(6)),
      lng: Number((lng + dLng).toFixed(6)),
      osmType: 'fallback',
      type: category,
      name: `${typeLabel} support`,
    }
  })
}

export async function fetchNearbyEssentials({ lat, lng, radius = 7000, categories = EMERGENCY_CATEGORIES }) {
  const clauses = categories
    .map((category) => OVERPASS_CATEGORY_QUERY[category])
    .filter(Boolean)
    .map((queryPart) => `${queryPart}(around:${radius},${lat},${lng});`)
    .join('\n    ')

  const query = `
  [out:json][timeout:20];
  (
    ${clauses}
  );
  out center tags;
  `

  async function queryOverpass(url) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 12000)

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: query,
        signal: controller.signal,
      })

      if (!response.ok) return null
      return await response.json()
    } catch {
      return null
    } finally {
      clearTimeout(timeout)
    }
  }

  let data = null
  for (const url of OVERPASS_URLS) {
    data = await queryOverpass(url)
    if (data?.elements?.length) break
  }

  if (!data?.elements?.length) {
    return buildFallbackEssentials(lat, lng, categories)
  }

  const parsed = (data.elements || [])
    .map((item) => {
      const point = getElementLatLng(item)
      if (!point) return null

      const type = detectEmergencyType(item.tags)
      return {
        id: item.id,
        lat: point.lat,
        lng: point.lng,
        osmType: item.type,
        type,
        name: item.tags?.name || `Unnamed ${type.replace('_', ' ')}`,
      }
    })
    .filter(Boolean)

  const unique = new Map()
  parsed.forEach((entry) => {
    unique.set(`${entry.osmType}-${entry.id}-${entry.type}`, entry)
  })

  return [...unique.values()]
}
