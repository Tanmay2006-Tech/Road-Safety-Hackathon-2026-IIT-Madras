import { describe, expect, it } from 'vitest'
import {
  buildGuardianShareMessage,
  buildOfflineKitSnapshot,
  parseOfflineKitSnapshot,
  shouldSeedEmergencyContact,
} from './sessionHelpers'

describe('sessionHelpers smoke tests', () => {
  it('seeds emergency contact only when missing', () => {
    const contacts = [{ id: '1', name: 'A', phone: '+911234567890' }]
    const profileExisting = { emergencyContactName: 'A', emergencyContactPhone: '+911234567890' }
    const profileNew = { emergencyContactName: 'B', emergencyContactPhone: '+919999999999' }

    expect(shouldSeedEmergencyContact(contacts, profileExisting)).toBe(false)
    expect(shouldSeedEmergencyContact(contacts, profileNew)).toBe(true)
  })

  it('builds and parses offline kit snapshot safely', () => {
    const snapshot = buildOfflineKitSnapshot({
      routeData: { current: { durationMin: 10 } },
      hotspots: [{ id: 1 }],
      facilities: [{ id: 1 }, { id: 2 }],
      emergencyProfile: { fullName: 'Test User' },
      now: 1700000000000,
    })

    const parsed = parseOfflineKitSnapshot(JSON.stringify(snapshot))

    expect(parsed).not.toBeNull()
    expect(parsed.meta.hasRoute).toBe(true)
    expect(parsed.meta.facilitiesCount).toBe(2)
    expect(parsed.emergencyProfile.fullName).toBe('Test User')
  })

  it('builds guardian share message with route and expiry', () => {
    const message = buildGuardianShareMessage({
      lat: 13.0827,
      lng: 80.2707,
      start: 'A',
      destination: 'B',
      expiresAt: 1700000000000,
      formatTime: () => '10:30 AM',
    })

    expect(message).toContain('RiskPath guardian update:')
    expect(message).toContain('https://maps.google.com/?q=13.082700,80.270700')
    expect(message).toContain('Route: A -> B')
    expect(message).toContain('Expires at: 10:30 AM')
  })
})