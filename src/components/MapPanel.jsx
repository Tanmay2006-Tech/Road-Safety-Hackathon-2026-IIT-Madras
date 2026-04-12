import { useEffect, useMemo, useState } from 'react'
import {
  Circle,
  CircleMarker,
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import PlaceAutocompleteInput from './PlaceAutocompleteInput'

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function RecenterMap({ location, routeCoordinates, activeRoute }) {
  const map = useMap()
  const routeSignature = useMemo(() => {
    if (!routeCoordinates?.length) return 'none'
    const first = routeCoordinates[0]
    const last = routeCoordinates[routeCoordinates.length - 1]
    return `${routeCoordinates.length}-${first?.[0]}-${first?.[1]}-${last?.[0]}-${last?.[1]}`
  }, [routeCoordinates])

  useEffect(() => {
    if (!location?.lat || !location?.lng) return

    if (routeCoordinates?.length > 1) {
      const latLngs = routeCoordinates.map(([lng, lat]) => [lat, lng])
      const bounds = L.latLngBounds(latLngs)
      const routeCenter = bounds.getCenter()
      const dx = location.lat - routeCenter.lat
      const dy = location.lng - routeCenter.lng
      const distanceFromUserKm = Math.sqrt(dx * dx + dy * dy) * 111

      // If checked route is far away from the user, focus route area instead of current location.
      if (distanceFromUserKm > 25) {
        map.flyToBounds(bounds.pad(0.18), { duration: 0.9, maxZoom: 13 })
        map.invalidateSize()
        return
      }
    }

    map.flyTo([location.lat, location.lng], 12, { duration: 0.8 })
    map.invalidateSize()
  }, [location?.lat, location?.lng, routeSignature, activeRoute, map, routeCoordinates])

  return null
}

function EnsureMapSized({ watchKey }) {
  const map = useMap()

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 120)

    return () => clearTimeout(timer)
  }, [map, watchKey])

  return null
}

function HazardMapClick({ enabled, onAddHazard }) {
  useMapEvents({
    click(event) {
      if (!enabled) return
      onAddHazard({
        lat: event.latlng.lat,
        lng: event.latlng.lng,
        type: 'Manual map report',
        source: 'map-click',
      })
    },
  })

  return null
}

function routeColor(band) {
  if (band === 'Red') return '#f43f5e'
  if (band === 'Yellow') return '#facc15'
  return '#34d399'
}

function serviceMeta(type) {
  if (type === 'hospital') return { color: '#22c55e', symbol: 'H' }
  if (type === 'police') return { color: '#3b82f6', symbol: 'P' }
  if (type === 'fire_station') return { color: '#f97316', symbol: 'F' }
  if (type === 'ambulance_station') return { color: '#a855f7', symbol: 'A' }
  if (type === 'clinic') return { color: '#06b6d4', symbol: 'C' }
  if (type === 'pharmacy') return { color: '#14b8a6', symbol: 'Rx' }
  if (type === 'roadside_assistance') return { color: '#f59e0b', symbol: 'Tow' }
  if (type === 'puncture_repair') return { color: '#eab308', symbol: 'Tyre' }
  if (type === 'showroom') return { color: '#8b5cf6', symbol: 'Car' }
  return { color: '#10b981', symbol: '+' }
}

function createServiceIcon(type) {
  const meta = serviceMeta(type)

  return L.divIcon({
    className: 'service-pin-wrap',
    html: `<div class="service-pin" style="--pin-color:${meta.color}"><span>${meta.symbol}</span></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}

function createCurrentLocationIcon() {
  return L.icon({
    iconUrl: '/you-are-here-pin.svg',
    iconRetinaUrl: '/you-are-here-pin.svg',
    iconSize: [60, 84],
    iconAnchor: [30, 78],
    popupAnchor: [0, -70],
  })
}

function squaredDistance(lat1, lng1, lat2, lng2) {
  const dx = lat1 - lat2
  const dy = lng1 - lng2
  return dx * dx + dy * dy
}

function approxDistanceKm(lat1, lng1, lat2, lng2) {
  const distance = Math.sqrt(squaredDistance(lat1, lng1, lat2, lng2)) * 111
  return Math.max(0.1, Number(distance.toFixed(1)))
}

const MAP_PROVIDERS = {
  light: [
    {
      id: 'osm',
      label: 'OpenStreetMap',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap contributors',
      subdomains: 'abc',
    },
    {
      id: 'carto-light',
      label: 'Carto Light',
      url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
    },
  ],
  dark: [
    {
      id: 'carto-dark',
      label: 'Carto Dark',
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
    },
    {
      id: 'osm-dark-fallback',
      label: 'OpenStreetMap Dark Fallback',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap contributors',
      subdomains: 'abc',
      useDarkFilter: true,
    },
  ],
}

export default function MapPanel({
  center,
  currentRoute,
  saferRoute,
  activeRoute,
  segmentRisks,
  hotspots,
  facilities,
  emergencyFilters,
  onToggleEmergencyFilter,
  hazards,
  hazardClickMode,
  onAddHazard,
  start,
  destination,
  routeScope,
  onStartChange,
  onDestinationChange,
  onAnalyze,
  onClearInputs,
  onUseCurrentLocation,
  hasCurrentLocation,
  loading,
  onOpenSos,
  safetyScore,
  highRiskSegments,
  weatherCondition,
  nightMode,
}) {
  const LIVE_NEARBY_RADIUS_KM = 8
  const activeCoordinates = activeRoute === 'safer' && saferRoute ? saferRoute.coordinates : currentRoute?.coordinates
  const [mapTheme, setMapTheme] = useState('auto')
  const [providerIndex, setProviderIndex] = useState(0)

  const activeTheme = mapTheme === 'auto' ? (nightMode ? 'dark' : 'light') : mapTheme
  const providers = MAP_PROVIDERS[activeTheme] || MAP_PROVIDERS.light
  const activeProvider = providers[Math.min(providerIndex, providers.length - 1)]
  const mapClassName = activeProvider?.useDarkFilter ? 'leaflet-map dark-osm-map h-[600px] w-full' : 'leaflet-map h-[600px] w-full'

  useEffect(() => {
    setProviderIndex(0)
  }, [activeTheme])
  const liveFocus = center

  const filterLabels = {
    hospital: 'Hospital',
    police: 'Police',
    fire_station: 'Fire',
    clinic: 'Clinic',
    pharmacy: 'Pharmacy',
    ambulance_station: 'Emergency',
    roadside_assistance: 'Towing',
    puncture_repair: 'Puncture',
    showroom: 'Showroom',
  }

  const facilitiesWithDistance = useMemo(
    () =>
      facilities
        .map((item) => ({
          ...item,
          distanceKm: approxDistanceKm(liveFocus.lat, liveFocus.lng, item.lat, item.lng),
        }))
        .sort((a, b) => a.distanceKm - b.distanceKm),
    [facilities, liveFocus.lat, liveFocus.lng],
  )

  const nearbyFacilities = useMemo(
    () => facilitiesWithDistance.filter((item) => item.distanceKm <= LIVE_NEARBY_RADIUS_KM),
    [facilitiesWithDistance],
  )

  const counts = nearbyFacilities.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1
    return acc
  }, {})

  const allCount = nearbyFacilities.length
  const policeCount = counts.police || 0
  const ambulanceCount = counts.ambulance_station || 0
  const listedServices = useMemo(() => nearbyFacilities.slice(0, 10), [nearbyFacilities])

  const serviceIcons = useMemo(() => {
    const types = ['hospital', 'police', 'fire_station', 'clinic', 'pharmacy', 'ambulance_station', 'roadside_assistance', 'puncture_repair', 'showroom', 'default']
    return types.reduce((acc, type) => {
      acc[type] = createServiceIcon(type === 'default' ? 'service' : type)
      return acc
    }, {})
  }, [])

  const currentLocationIcon = useMemo(() => createCurrentLocationIcon(), [])

  const nearestHospital = useMemo(() => {
    if (!nearbyFacilities.length) return null
    return nearbyFacilities
      .filter((item) => item.type === 'hospital')
      .sort((a, b) => a.distanceKm - b.distanceKm)[0]
  }, [nearbyFacilities])

  const nearestPolice = useMemo(() => {
    if (!nearbyFacilities.length) return null
    return nearbyFacilities
      .filter((item) => item.type === 'police')
      .sort((a, b) => a.distanceKm - b.distanceKm)[0]
  }, [nearbyFacilities])

  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-700 bg-[#03070e]">
      {nightMode && (
        <div className="flex items-center gap-2 border-b border-amber-600/40 bg-amber-900/40 px-3 py-1.5 text-xs text-amber-200">
          Late night travel detected - accident risk is higher between 10 PM and 5 AM
        </div>
      )}

      <div className="flex items-center gap-4 border-b border-slate-800 bg-gradient-to-r from-[#090f1a] to-[#070911] px-3 py-2 text-xs text-slate-300">
        <span>{ambulanceCount} ambulances nearby</span>
        <span>Avg response: ~6 min</span>
        <span>Risk zones: {highRiskSegments}</span>
        <span>{policeCount} police stations</span>
        <div className="ml-auto flex items-center gap-1 rounded-full border border-slate-700 bg-black/25 p-1 text-[11px]">
          <button
            onClick={() => setMapTheme('auto')}
            className={`rounded-full px-2 py-1 ${mapTheme === 'auto' ? 'bg-cyan-300/25 text-cyan-100' : 'text-slate-300'}`}
          >
            Auto
          </button>
          <button
            onClick={() => setMapTheme('light')}
            className={`rounded-full px-2 py-1 ${mapTheme === 'light' ? 'bg-cyan-300/25 text-cyan-100' : 'text-slate-300'}`}
          >
            Light
          </button>
          <button
            onClick={() => setMapTheme('dark')}
            className={`rounded-full px-2 py-1 ${mapTheme === 'dark' ? 'bg-cyan-300/25 text-cyan-100' : 'text-slate-300'}`}
          >
            Dark
          </button>
        </div>
      </div>

      <div className="relative">
        <MapContainer center={[center.lat, center.lng]} zoom={12} className={mapClassName}>
          <EnsureMapSized watchKey={`${center.lat}-${center.lng}-${activeRoute}`} />
          <TileLayer
            key={`${activeTheme}-${activeProvider.id}`}
            attribution={activeProvider.attribution}
            subdomains={activeProvider.subdomains}
            url={activeProvider.url}
            eventHandlers={{
              tileerror: () => {
                setProviderIndex((prev) => (prev < providers.length - 1 ? prev + 1 : prev))
              },
            }}
          />

          <RecenterMap location={center} routeCoordinates={activeCoordinates} activeRoute={activeRoute} />
          <HazardMapClick enabled={hazardClickMode} onAddHazard={onAddHazard} />

          <Marker position={[center.lat, center.lng]} icon={currentLocationIcon}>
            <Popup>
              <p className="font-semibold">You are here</p>
              <p className="text-xs">{center.lat.toFixed(5)}, {center.lng.toFixed(5)}</p>
            </Popup>
          </Marker>

          {activeCoordinates &&
            (activeRoute === 'current'
              ? segmentRisks.map((segment, idx) => (
                  <Polyline
                    key={`${activeRoute}-${segment.id}-${idx}`}
                    positions={segment.coordinates.map(([lng, lat]) => [lat, lng])}
                    pathOptions={{
                      color: routeColor(segment.color),
                      weight: 6,
                      opacity: 0.92,
                      className: 'draw-route',
                    }}
                  >
                    <Tooltip direction="top" sticky>
                      {segment.color} risk segment ({segment.score}%)
                    </Tooltip>
                  </Polyline>
                ))
              : saferRoute && (
                  <Polyline
                    positions={saferRoute.coordinates.map(([lng, lat]) => [lat, lng])}
                    pathOptions={{
                      color: '#60a5fa',
                      weight: 6,
                      dashArray: '10 8',
                      opacity: 0.88,
                      className: 'draw-route',
                    }}
                  />
                ))}

          {hotspots.map((zone) => (
            <Circle
              key={zone.id}
              center={[zone.lat, zone.lng]}
              radius={380}
              pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.2 }}
            >
              <Tooltip>
                {zone.name} ({zone.incidents} incidents)
              </Tooltip>
            </Circle>
          ))}

          {hazards.map((hazard) => (
            <CircleMarker
              key={hazard.id}
              center={[hazard.lat, hazard.lng]}
              radius={7}
              pathOptions={{ color: '#fb923c', fillColor: '#fb923c', fillOpacity: 0.75 }}
            >
              <Popup>
                <p className="font-semibold">{hazard.type}</p>
                <p>Source: {hazard.source}</p>
                <p>Reported: {new Date(hazard.createdAt).toLocaleTimeString()}</p>
              </Popup>
            </CircleMarker>
          ))}

          <MarkerClusterGroup chunkedLoading>
            {nearbyFacilities.map((spot) => (
              <Marker
                key={`${spot.type}-${spot.id}`}
                position={[spot.lat, spot.lng]}
                icon={serviceIcons[spot.type] || serviceIcons.default}
              >
                <Tooltip direction="top" offset={[0, -10]}>{spot.name}</Tooltip>
                <Popup>
                  <p className="font-semibold">{spot.name}</p>
                  <p>Type: {spot.type.replace('_', ' ')}</p>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>

        <div className="pointer-events-none absolute bottom-5 left-5 rounded-xl bg-black/75 px-3 py-2 text-[11px] text-slate-200">
          <p className="font-semibold">Legend</p>
          <div className="mt-1 flex flex-wrap gap-3">
            <span>Green: Hospital</span>
            <span>Blue: Police</span>
            <span>Orange: Fire/Hazard</span>
            <span>Purple: Emergency</span>
          </div>
        </div>

        <button
          onClick={onOpenSos}
          className="pulse-red absolute bottom-12 left-1/2 z-[900] h-28 w-28 -translate-x-1/2 rounded-full bg-rose-600 text-4xl font-bold text-white shadow-[0_0_40px_rgba(244,63,94,0.6)]"
        >
          SOS
        </button>

        <div className="absolute bottom-4 right-4 z-[900] hidden w-[270px] rounded-xl border border-slate-800 bg-black/85 p-3 text-xs text-slate-200 lg:block">
          <p className="mb-2 font-semibold text-emerald-300">Quick Emergency Actions</p>
          <div className="grid grid-cols-2 gap-2">
            <a href="tel:108" className="rounded-md bg-rose-600/80 px-2 py-1.5 text-center font-semibold text-white">Call 108</a>
            <a href="tel:100" className="rounded-md bg-sky-600/80 px-2 py-1.5 text-center font-semibold text-white">Call 100</a>
            {nearestHospital ? (
              <a
                href={`https://www.google.com/maps/dir/?api=1&origin=${center.lat},${center.lng}&destination=${nearestHospital.lat},${nearestHospital.lng}&travelmode=driving`}
                target="_blank"
                rel="noreferrer"
                className="col-span-2 rounded-md border border-emerald-300/40 bg-emerald-400/10 px-2 py-1.5 text-center font-semibold text-emerald-200"
              >
                Navigate nearest hospital
              </a>
            ) : null}
            {nearestPolice ? (
              <a
                href={`https://www.google.com/maps/dir/?api=1&origin=${center.lat},${center.lng}&destination=${nearestPolice.lat},${nearestPolice.lng}&travelmode=driving`}
                target="_blank"
                rel="noreferrer"
                className="col-span-2 rounded-md border border-sky-300/40 bg-sky-400/10 px-2 py-1.5 text-center font-semibold text-sky-200"
              >
                Navigate nearest police station
              </a>
            ) : null}
          </div>
        </div>

        <aside className="absolute right-0 top-0 z-[900] hidden h-full w-full max-w-[340px] border-l border-slate-800 bg-black/88 p-3 backdrop-blur lg:block">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <p>Nearby Services - Live Location ({LIVE_NEARBY_RADIUS_KM} KM)</p>
            <p className="text-violet-300">{allCount} found</p>
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            <button className="rounded-md bg-violet-600 px-2 py-1 text-[11px] font-semibold text-white">All {allCount}</button>
            {Object.keys(filterLabels).map((key) => (
              <button
                key={key}
                onClick={() => onToggleEmergencyFilter(key)}
                className={`rounded-md px-2 py-1 text-[11px] font-semibold ${
                  emergencyFilters[key]
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-900 text-slate-400'
                }`}
              >
                {filterLabels[key]} {counts[key] || 0}
              </button>
            ))}
          </div>

          <div className="mt-3 max-h-[210px] space-y-2 overflow-auto pr-1">
            {listedServices.map((spot) => (
              <div key={`list-${spot.id}-${spot.type}`} className="rounded-lg border border-slate-800 bg-[#060b14] p-2 transition hover:border-slate-600">
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-bold"
                    style={{
                      borderColor: serviceMeta(spot.type).color,
                      color: serviceMeta(spot.type).color,
                      background: 'rgba(2,6,23,0.95)',
                    }}
                  >
                    {serviceMeta(spot.type).symbol}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-100">{spot.name}</p>
                    <p className="text-xs text-emerald-300">{spot.type.replace('_', ' ')}</p>
                  </div>
                  <p className="text-[11px] text-slate-500">{spot.distanceKm} km</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-slate-800 bg-[#060b14] p-2 text-center">
              <p className="text-lg font-bold text-rose-300">{highRiskSegments}</p>
              <p className="text-[10px] text-slate-500">HIGH ZONES</p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-[#060b14] p-2 text-center">
              <p className="text-lg font-bold text-amber-300">{weatherCondition}</p>
              <p className="text-[10px] text-slate-500">WEATHER</p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-[#060b14] p-2 text-center">
              <p className="text-lg font-bold text-sky-300">{safetyScore}%</p>
              <p className="text-[10px] text-slate-500">SAFETY</p>
            </div>
          </div>

          <div className="mt-3 border-t border-violet-700/40 pt-3">
            <p className="mb-2 text-xl font-semibold text-violet-300">Route check</p>
            <div className="mb-2">
              <PlaceAutocompleteInput
                value={start}
                onChange={onStartChange}
                placeholder="e.g. Mumbai, Maharashtra"
                scope={routeScope}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
              />
            </div>
            <div className="mb-2">
              <PlaceAutocompleteInput
                value={destination}
                onChange={onDestinationChange}
                placeholder="e.g. Pune, Maharashtra"
                scope={routeScope}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onAnalyze()}
                disabled={loading || !start || !destination}
                className="rounded-lg bg-violet-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-violet-600 disabled:cursor-not-allowed disabled:bg-slate-700"
              >
                {loading ? 'Analyzing...' : 'Analyze Route'}
              </button>
              <button
                onClick={onClearInputs}
                type="button"
                className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/70 hover:text-cyan-200"
              >
                Clear
              </button>
              <button
                onClick={onUseCurrentLocation}
                type="button"
                disabled={!hasCurrentLocation}
                className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/70 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Current
              </button>
            </div>
          </div>
        </aside>

        <div className="absolute bottom-3 left-3 right-3 z-[900] rounded-xl border border-slate-800 bg-black/85 p-2 lg:hidden">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <p>{allCount} emergency points</p>
            <p>{highRiskSegments} high zones</p>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              onClick={() => onAnalyze()}
              disabled={loading || !start || !destination}
              className="rounded-lg bg-violet-700 px-2 py-1.5 text-xs font-semibold text-white disabled:bg-slate-700"
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
            <button
              onClick={onOpenSos}
              className="rounded-lg bg-rose-600 px-2 py-1.5 text-xs font-semibold text-white"
            >
              SOS
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
