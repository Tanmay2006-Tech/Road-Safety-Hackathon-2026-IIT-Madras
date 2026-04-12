export function shouldSeedEmergencyContact(contacts, profile) {
  if (!profile?.emergencyContactName || !profile?.emergencyContactPhone) return false
  return !contacts.some((item) => item.phone === profile.emergencyContactPhone)
}

export function buildOfflineKitSnapshot({ routeData, hotspots, facilities, emergencyProfile, now = Date.now() }) {
  return {
    updatedAt: now,
    routeData: routeData || null,
    hotspots: Array.isArray(hotspots) ? hotspots.slice(0, 80) : [],
    facilities: Array.isArray(facilities) ? facilities.slice(0, 120) : [],
    emergencyProfile: emergencyProfile || null,
  }
}

export function parseOfflineKitSnapshot(rawValue) {
  if (!rawValue) return null

  try {
    const parsed = typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue
    if (!parsed || typeof parsed !== 'object') return null

    return {
      updatedAt: parsed.updatedAt || Date.now(),
      routeData: parsed.routeData || null,
      hotspots: Array.isArray(parsed.hotspots) ? parsed.hotspots : [],
      facilities: Array.isArray(parsed.facilities) ? parsed.facilities : [],
      emergencyProfile: parsed.emergencyProfile || null,
      meta: {
        updatedAt: parsed.updatedAt || Date.now(),
        facilitiesCount: Array.isArray(parsed.facilities) ? parsed.facilities.length : 0,
        hasRoute: Boolean(parsed.routeData?.current),
      },
    }
  } catch {
    return null
  }
}

export function buildGuardianShareMessage({ lat, lng, start, destination, expiresAt, formatTime }) {
  const mapsLink = `https://maps.google.com/?q=${Number(lat).toFixed(6)},${Number(lng).toFixed(6)}`

  return [
    'RiskPath guardian update:',
    `Live location: ${mapsLink}`,
    `Route: ${start || 'Not set'} -> ${destination || 'Not set'}`,
    `Expires at: ${formatTime(expiresAt)}`,
  ].join('\n')
}