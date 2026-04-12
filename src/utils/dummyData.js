export const hotspotsSeed = [
  { id: 'hz-1', lat: 13.084, lng: 80.2705, incidents: 12, name: 'High accident zone' },
  { id: 'hz-2', lat: 13.0629, lng: 80.2494, incidents: 9, name: 'Blind turn cluster' },
  { id: 'hz-3', lat: 13.0386, lng: 80.2331, incidents: 15, name: 'Signal violation stretch' },
  { id: 'hz-4', lat: 13.1272, lng: 80.219, incidents: 7, name: 'Truck-heavy corridor' },
]

export function generateHotspotsFromRoute(routeCoordinates = []) {
  if (!routeCoordinates.length) return hotspotsSeed

  const sampleIndexes = [
    Math.floor(routeCoordinates.length * 0.2),
    Math.floor(routeCoordinates.length * 0.45),
    Math.floor(routeCoordinates.length * 0.7),
  ]

  return sampleIndexes.map((index, i) => {
    const point = routeCoordinates[Math.min(index, routeCoordinates.length - 1)]
    const jitter = (i + 1) * 0.005
    return {
      id: `gen-hz-${i + 1}`,
      lat: point[1] + jitter,
      lng: point[0] - jitter,
      incidents: 8 + i * 3,
      name: 'High accident zone',
    }
  })
}
