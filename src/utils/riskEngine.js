import { hotspotsSeed } from './dummyData'

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
}

function scoreToBand(score) {
  if (score <= 40) return 'Green'
  if (score <= 70) return 'Yellow'
  return 'Red'
}

function overallLabel(score) {
  if (score <= 40) return 'Low'
  if (score <= 70) return 'Medium'
  return 'High'
}

function deterministicNoise(lat, lng, index) {
  const seed = Math.sin(lat * 12.9898 + lng * 78.233 + index * 23.99) * 43758.5453
  return (seed - Math.floor(seed)) * 8 - 4
}

function nearestHotspotBoost(lat, lng, hotspots) {
  const source = hotspots?.length ? hotspots : hotspotsSeed

  let minDistance = Infinity
  let incidents = 0

  source.forEach((zone) => {
    const distance = haversineDistanceKm(lat, lng, zone.lat, zone.lng)
    if (distance < minDistance) {
      minDistance = distance
      incidents = zone.incidents
    }
  })

  if (minDistance > 4) return 0
  if (minDistance > 2) return 6
  if (minDistance > 1) return 12

  return clamp(14 + incidents * 0.8, 14, 28)
}

function splitIntoSegments(coordinates, desired = 12) {
  if (!coordinates?.length) return []
  const chunk = Math.max(1, Math.floor(coordinates.length / desired))
  const segments = []

  for (let i = 0; i < coordinates.length - 1; i += chunk) {
    const pair = coordinates.slice(i, Math.min(i + chunk + 1, coordinates.length))
    if (pair.length > 1) segments.push(pair)
  }

  return segments
}

export function evaluateRouteRisk(route, context = {}) {
  const weather = context.weatherCondition || 'Clear'
  const isNight = Boolean(context.isNight)
  const traffic = context.trafficLevel || 'moderate'
  const hotspots = context.hotspots || hotspotsSeed

  const weatherImpact = {
    Clear: 0,
    Rain: 25,
    Fog: 30,
  }[weather] ?? 8

  const trafficImpact = {
    low: 0,
    moderate: 9,
    heavy: 18,
  }[traffic] ?? 9

  const nightImpact = isNight ? 20 : 0

  const segments = splitIntoSegments(route.coordinates)

  const scoredSegments = segments.map((segment, index) => {
    const mid = segment[Math.floor(segment.length / 2)]
    const lng = mid[0]
    const lat = mid[1]

    const base = 26 + weatherImpact + trafficImpact + nightImpact
    const hotspot = nearestHotspotBoost(lat, lng, hotspots)
    const variance = deterministicNoise(lat, lng, index)

    const score = clamp(Math.round(base + hotspot + variance), 10, 98)

    return {
      id: `${route.id}-s${index + 1}`,
      score,
      color: scoreToBand(score),
      coordinates: segment,
      lat,
      lng,
    }
  })

  const avgRisk =
    scoredSegments.reduce((sum, segment) => sum + segment.score, 0) /
    Math.max(scoredSegments.length, 1)

  const riskPercent = Math.round(avgRisk)
  const highRiskSegments = scoredSegments.filter((segment) => segment.color === 'Red').length

  const reasons = []
  if (weather !== 'Clear') reasons.push({ factor: weather, impact: `+${weatherImpact}%` })
  if (isNight) reasons.push({ factor: 'Night', impact: '+20%' })
  if (traffic === 'heavy') reasons.push({ factor: 'Heavy traffic', impact: '+18%' })
  if (!reasons.length) reasons.push({ factor: 'Balanced conditions', impact: '+8%' })

  const confidence = clamp(68 + scoredSegments.length + (weather !== 'Clear' ? 4 : 0), 68, 92)

  return {
    risk: overallLabel(riskPercent),
    riskPercent,
    confidence,
    highRiskSegments,
    segmentRisks: scoredSegments,
    reasons,
    safetyScore: clamp(100 - riskPercent, 2, 95),
  }
}

export function forecastRouteRisk(route, context = {}) {
  if (!route?.coordinates?.length) return []

  const windows = [15, 30, 45]
  const trafficScale = {
    low: 0,
    moderate: 1,
    heavy: 2,
  }

  const baseTraffic = trafficScale[context.trafficLevel || 'moderate'] ?? 1

  return windows.map((minute, index) => {
    const weatherCondition = minute >= 45 && context.weatherCondition === 'Clear'
      ? 'Rain'
      : context.weatherCondition

    const trafficLevel = baseTraffic + index >= 2 ? 'heavy' : baseTraffic + index === 1 ? 'moderate' : 'low'
    const isNight = context.isNight || minute >= 30

    const evalResult = evaluateRouteRisk(route, {
      ...context,
      weatherCondition,
      trafficLevel,
      isNight,
    })

    return {
      minute,
      risk: evalResult.risk,
      riskPercent: evalResult.riskPercent,
      confidence: evalResult.confidence,
      trafficLevel,
      weatherCondition,
    }
  })
}
