import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import Navbar from '../components/Navbar'
import RouteForm from '../components/RouteForm'
import WeatherCard from '../components/WeatherCard'
import RiskBar from '../components/RiskBar'
import RouteComparison from '../components/RouteComparison'
import InsightPanel from '../components/InsightPanel'
import CrashDetectionPanel from '../components/CrashDetectionPanel'
import TrustedContactsPanel from '../components/TrustedContactsPanel'
import HazardReporterPanel from '../components/HazardReporterPanel'
import SosOverlay from '../components/SosOverlay'
import RoadSoSCompliancePanel from '../components/RoadSoSCompliancePanel'
import FirstTimeOnboarding from '../components/FirstTimeOnboarding'
import { useUserLocation } from '../hooks/useUserLocation'
import { useWeather } from '../hooks/useWeather'
import { useVoiceAlert } from '../hooks/useVoiceAlert'
import { EMERGENCY_CATEGORIES, fetchNearbyEssentials, fetchRoutes, geocodePlace } from '../utils/mapServices'
import { evaluateRouteRisk, forecastRouteRisk } from '../utils/riskEngine'
import { generateHotspotsFromRoute, hotspotsSeed } from '../utils/dummyData'
import { downloadContactsCsv, downloadSafetyJson, downloadSafetyMarkdown, downloadSafetyText } from '../utils/reportBuilder'
import {
  buildGuardianShareMessage,
  buildOfflineKitSnapshot,
  parseOfflineKitSnapshot,
  shouldSeedEmergencyContact,
} from '../utils/sessionHelpers'

const MapPanel = lazy(() => import('../components/MapPanel'))

const JUDGE_DEMO_STEPS = [
  {
    section: 'overview',
    label: 'Problem Snapshot',
    note: 'Start with live risk and emergency readiness view.',
    seconds: 12,
    objective: 'Show the problem and value in the first 10 seconds.',
    judgeLearn: 'RiskPath predicts danger before a user starts driving.',
  },
  {
    section: 'route',
    label: 'Route Intelligence',
    note: 'Show route input and one-click safety analysis.',
    seconds: 14,
    objective: 'Enter route and trigger analysis with one action.',
    judgeLearn: 'The product converts simple input into risk-ready route decisions.',
  },
  {
    section: 'map',
    label: 'Live Map and Services',
    note: 'Show hazards, safer route, and nearby emergency points.',
    seconds: 16,
    objective: 'Highlight visual proof: risk segments plus emergency service layer.',
    judgeLearn: 'Users can switch from awareness to action without changing apps.',
  },
  {
    section: 'insights',
    label: 'Actionable Insights',
    note: 'Explain risk reason breakdown and downloadable summaries.',
    seconds: 12,
    objective: 'Show that outputs are explainable and shareable.',
    judgeLearn: 'The model output is understandable, auditable, and useful to teams.',
  },
  {
    section: 'emergency',
    label: 'Emergency Execution',
    note: 'Demonstrate SOS, profile details, and contact actions.',
    seconds: 14,
    objective: 'Finish with response speed and readiness capability.',
    judgeLearn: 'RiskPath supports prevention and response in one workflow.',
  },
]

const PRESENTATION_SCRIPT = [
  'RiskPath predicts route risk before travel starts.',
  'Map view overlays risk segments and nearby emergency facilities.',
  'Emergency mode provides SOS, trusted contacts, and one-tap responders.',
  'Crash detection and emergency profile improve response readiness.',
]

export default function HomePage() {
  const { location, locationError } = useUserLocation()
  const weather = useWeather(location)

  const [start, setStart] = useState('')
  const [destination, setDestination] = useState('')
  const [routeScope, setRouteScope] = useState('in')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const [routeData, setRouteData] = useState(null)
  const [hotspots, setHotspots] = useState(hotspotsSeed)
  const [facilities, setFacilities] = useState([])
  const [activeRoute, setActiveRoute] = useState('current')

  const [sosOpen, setSosOpen] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [hazardClickMode, setHazardClickMode] = useState(false)
  const [hazards, setHazards] = useState([])
  const [contacts, setContacts] = useState([])
  const [liveMonitorOn, setLiveMonitorOn] = useState(false)
  const [monitorPing, setMonitorPing] = useState(120)
  const [isOnline, setIsOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine))
  const [compactMode, setCompactMode] = useState(() => {
    try {
      return localStorage.getItem('riskpath_compact_ui') === '1'
    } catch {
      return false
    }
  })
  const [toast, setToast] = useState('')
  const [judgeDemo, setJudgeDemo] = useState({ running: false, paused: false, index: 0, remaining: 0 })
  const [presentationMode, setPresentationMode] = useState(false)
  const [offlineKitMeta, setOfflineKitMeta] = useState(null)
  const [guardianShareExpiresAt, setGuardianShareExpiresAt] = useState(0)
  const [crashDetectionEnabled, setCrashDetectionEnabled] = useState(() => {
    try {
      return localStorage.getItem('riskpath_crash_feature') !== '0'
    } catch {
      return true
    }
  })
  const [onboardingOpen, setOnboardingOpen] = useState(false)
  const [onboardingMode, setOnboardingMode] = useState('tour')
  const [emergencyProfile, setEmergencyProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('riskpath_emergency_profile')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [activeSection, setActiveSection] = useState('overview')
  const [emergencyFilters, setEmergencyFilters] = useState({
    hospital: true,
    police: true,
    fire_station: true,
    clinic: true,
    pharmacy: true,
    ambulance_station: true,
    roadside_assistance: true,
    puncture_repair: true,
    showroom: true,
  })

  const effectiveCondition = weather.condition
  const trafficLevel = 'moderate'
  const nightMode = false

  useEffect(() => {
    try {
      const savedContacts = localStorage.getItem('riskpath_contacts')
      const savedHazards = localStorage.getItem('riskpath_hazards')
      const savedOfflineKit = localStorage.getItem('riskpath_offline_kit')
      const onboardingDone = localStorage.getItem('riskpath_onboarding_done') === '1'

      if (savedContacts) {
        const parsedContacts = JSON.parse(savedContacts)
        if (Array.isArray(parsedContacts)) {
          setContacts(parsedContacts)
        }
      }

      if (savedHazards) {
        const parsedHazards = JSON.parse(savedHazards)
        if (Array.isArray(parsedHazards)) {
          setHazards(parsedHazards)
        }
      }

      if (savedOfflineKit) {
        const parsedOfflineKit = parseOfflineKitSnapshot(savedOfflineKit)
        if (parsedOfflineKit) {
          setOfflineKitMeta(parsedOfflineKit.meta)

          if (parsedOfflineKit.routeData?.current) {
            setRouteData(parsedOfflineKit.routeData)
          }
          if (parsedOfflineKit.hotspots.length) {
            setHotspots(parsedOfflineKit.hotspots)
          }
          if (parsedOfflineKit.facilities.length) {
            setFacilities(parsedOfflineKit.facilities)
          }
        }
      }

      if (!onboardingDone) {
        setOnboardingMode('tour')
        setOnboardingOpen(true)
      }
    } catch {
      // Ignore invalid storage payloads and keep defaults.
      setOnboardingMode('tour')
      setOnboardingOpen(true)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('riskpath_contacts', JSON.stringify(contacts))
  }, [contacts])

  useEffect(() => {
    localStorage.setItem('riskpath_hazards', JSON.stringify(hazards))
  }, [hazards])

  useEffect(() => {
    try {
      localStorage.setItem('riskpath_crash_feature', crashDetectionEnabled ? '1' : '0')
    } catch {
      // Ignore storage issues.
    }
  }, [crashDetectionEnabled])

  useEffect(() => {
    try {
      localStorage.setItem('riskpath_compact_ui', compactMode ? '1' : '0')
    } catch {
      // Ignore storage issues.
    }
  }, [compactMode])

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true)
    }

    function handleOffline() {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    if (!toast) return

    const timeout = setTimeout(() => {
      setToast('')
    }, 2600)

    return () => clearTimeout(timeout)
  }, [toast])

  useEffect(() => {
    if (!routeData?.current && !facilities.length && !emergencyProfile) return

    const snapshot = buildOfflineKitSnapshot({
      routeData,
      hotspots,
      facilities,
      emergencyProfile,
    })

    try {
      localStorage.setItem('riskpath_offline_kit', JSON.stringify(snapshot))
      setOfflineKitMeta({
        updatedAt: snapshot.updatedAt,
        facilitiesCount: snapshot.facilities.length,
        hasRoute: Boolean(snapshot.routeData?.current),
      })
    } catch {
      // Ignore storage quota issues.
    }
  }, [routeData, hotspots, facilities, emergencyProfile])

  useEffect(() => {
    if (!judgeDemo.running || judgeDemo.paused) return

    const activeStep = JUDGE_DEMO_STEPS[judgeDemo.index]
    if (!activeStep) return

    setActiveSection(activeStep.section)

    const timer = setTimeout(() => {
      setJudgeDemo((prev) => {
        if (!prev.running) return prev

        if (prev.remaining > 1) {
          return { ...prev, remaining: prev.remaining - 1 }
        }

        const nextIndex = prev.index + 1
        if (nextIndex >= JUDGE_DEMO_STEPS.length) {
          showToast('Judge demo completed.')
          return { running: false, paused: false, index: 0, remaining: 0 }
        }

        return {
          running: true,
          paused: false,
          index: nextIndex,
          remaining: JUDGE_DEMO_STEPS[nextIndex].seconds,
        }
      })
    }, 1000)

    return () => clearTimeout(timer)
  }, [judgeDemo])

  const riskBundle = useMemo(() => {
    if (!routeData?.current) return null

    const currentEval = evaluateRouteRisk(routeData.current, {
      weatherCondition: effectiveCondition,
      trafficLevel,
      isNight: nightMode,
      hotspots,
    })

    const alternative = routeData.alternatives?.[0]
      ? evaluateRouteRisk(routeData.alternatives[0], {
          weatherCondition: effectiveCondition,
          trafficLevel,
          isNight: nightMode,
          hotspots,
        })
      : null

    const forecast = forecastRouteRisk(routeData.current, {
      weatherCondition: effectiveCondition,
      trafficLevel,
      isNight: nightMode,
      hotspots,
    })

    return {
      currentEval,
      alternativeEval: alternative,
      forecast,
    }
  }, [routeData, effectiveCondition, trafficLevel, nightMode, hotspots])

  const isHighRiskZone =
    riskBundle?.currentEval?.risk === 'High' || (riskBundle?.currentEval?.highRiskSegments ?? 0) >= 2

  useVoiceAlert({
    enabled: voiceEnabled && isHighRiskZone,
    text: 'Alert. You are entering a high risk zone. Consider switching to the safer route.',
  })

  const handleAnalyze = useCallback(async (overrideStart, overrideDestination) => {
    const from = overrideStart || start
    const to = overrideDestination || destination

    setLoading(true)
    setMessage('')

    try {
      const [startPoint, endPoint] = await Promise.all([
        geocodePlace(from, { countryCode: routeScope }),
        geocodePlace(to, { countryCode: routeScope }),
      ])
      const routes = await fetchRoutes(startPoint, endPoint)
      const dynamicHotspots = generateHotspotsFromRoute(routes.current.coordinates)

      setHotspots(dynamicHotspots)
      setRouteData(routes)
      setActiveRoute('current')

      const livePoint =
        Number.isFinite(location?.lat) && Number.isFinite(location?.lng)
          ? { lat: location.lat, lng: location.lng }
          : startPoint

      const [liveEssentials, originEssentials, destinationEssentials] = await Promise.all([
        fetchNearbyEssentials({ lat: livePoint.lat, lng: livePoint.lng, radius: 7000, categories: EMERGENCY_CATEGORIES }),
        fetchNearbyEssentials({ lat: startPoint.lat, lng: startPoint.lng, radius: 7000, categories: EMERGENCY_CATEGORIES }),
        fetchNearbyEssentials({ lat: endPoint.lat, lng: endPoint.lng, radius: 7000, categories: EMERGENCY_CATEGORIES }),
      ])

      const merged = new Map()
      ;[...liveEssentials, ...originEssentials, ...destinationEssentials].forEach((item) => {
        merged.set(`${item.osmType}-${item.id}`, item)
      })

      setFacilities([...merged.values()])
    } catch (error) {
      setMessage(error.message || 'Something went wrong while analyzing this route')
    } finally {
      setLoading(false)
    }
  }, [start, destination, routeScope, location?.lat, location?.lng])

  useEffect(() => {
    if (!liveMonitorOn || !routeData?.current) return

    setMonitorPing(120)
    const interval = setInterval(() => {
      setMonitorPing((prev) => {
        if (prev <= 1) {
          handleAnalyze(start, destination)
          return 120
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [liveMonitorOn, routeData, start, destination, handleAnalyze])

  function clearRouteInputs() {
    setStart('')
    setDestination('')
  }

  function showToast(messageText) {
    setToast(messageText)
  }

  function useCurrentLocationAsStart() {
    if (!Number.isFinite(location?.lat) || !Number.isFinite(location?.lng)) {
      setMessage('Current location is not ready yet. Please allow location access.')
      return
    }

    setStart(`${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`)
    setMessage('Current location added as start point.')
  }

  function toggleCrashDetectionFeature() {
    setCrashDetectionEnabled((prev) => {
      const next = !prev
      if (!next) {
        try {
          localStorage.setItem('riskpath_crash_auto', '0')
        } catch {
          // Ignore storage issues.
        }
      }
      return next
    })
  }

  function openSos(reason = 'manual') {
    setSosOpen(true)
    if (reason === 'crash-detection') {
      setMessage('Potential crash detected. SOS opened automatically.')
    }
  }

  function addHazard(payload) {
    const fallbackLat = location?.lat || 13.0827
    const fallbackLng = location?.lng || 80.2707
    const item = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
      lat: payload.lat || fallbackLat,
      lng: payload.lng || fallbackLng,
      type: payload.type || 'General hazard',
      source: payload.source || 'quick-report',
      createdAt: Date.now(),
    }

    setHazards((prev) => [item, ...prev].slice(0, 80))
  }

  function addTrustedContact(contact) {
    setContacts((prev) => [
      {
        id: `${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
        name: contact.name,
        phone: contact.phone,
      },
      ...prev,
    ].slice(0, 8))
  }

  function removeTrustedContact(id) {
    setContacts((prev) => prev.filter((item) => item.id !== id))
  }

  function toggleEmergencyFilter(category) {
    setEmergencyFilters((prev) => ({ ...prev, [category]: !prev[category] }))
  }

  function completeFirstTimeOnboarding(profileData) {
    setEmergencyProfile(profileData)
    setOnboardingOpen(false)
    setActiveSection('overview')

    try {
      localStorage.setItem('riskpath_emergency_profile', JSON.stringify(profileData))
      localStorage.setItem('riskpath_onboarding_done', '1')
    } catch {
      // Ignore storage failures in restricted browser modes.
    }

    if (shouldSeedEmergencyContact(contacts, profileData)) {
      addTrustedContact({
        name: profileData.emergencyContactName,
        phone: profileData.emergencyContactPhone,
      })
    }

    showToast('Emergency profile saved.')
  }

  function skipFirstTimeOnboarding() {
    setOnboardingOpen(false)
    setActiveSection('overview')

    try {
      localStorage.setItem('riskpath_onboarding_done', '1')
    } catch {
      // Ignore storage failures in restricted browser modes.
    }
  }

  function replayOnboardingTour() {
    setOnboardingMode('tour')
    setOnboardingOpen(true)
  }

  function editEmergencyProfile() {
    setOnboardingMode('profile')
    setOnboardingOpen(true)
    setActiveSection('emergency')
  }

  function clearEmergencyProfile() {
    setEmergencyProfile(null)

    try {
      localStorage.removeItem('riskpath_emergency_profile')
    } catch {
      // Ignore storage failures in restricted browser modes.
    }

    showToast('Emergency profile removed from this device.')
  }

  function handleCompactToggle() {
    setCompactMode((prev) => !prev)
    showToast(compactMode ? 'Normal mode enabled.' : 'Compact mode enabled.')
  }

  function handleCopiedEmergencyMessage(success) {
    if (success) {
      showToast('Emergency message copied.')
      return
    }

    showToast('Could not copy. Use call buttons directly.')
  }

  function formatTime(value) {
    if (!value) return 'N/A'
    return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  async function copyPresentationScript() {
    if (!navigator.clipboard) {
      showToast('Clipboard not available.')
      return
    }

    const scriptText = PRESENTATION_SCRIPT.map((line, idx) => `${idx + 1}. ${line}`).join('\n')
    try {
      await navigator.clipboard.writeText(scriptText)
      showToast('Presentation script copied.')
    } catch {
      showToast('Could not copy presentation script.')
    }
  }

  async function togglePresentationMode() {
    if (presentationMode) {
      setPresentationMode(false)
      showToast('Presentation mode stopped.')
      return
    }

    const demoFrom = start || 'IIT Madras, Chennai'
    const demoTo = destination || 'Chennai Central, Chennai'

    setStart(demoFrom)
    setDestination(demoTo)
    setActiveSection('overview')

    try {
      await handleAnalyze(demoFrom, demoTo)
    } catch {
      // Continue even if route service is unavailable.
    }

    setPresentationMode(true)
    showToast('Presentation mode started.')
  }

  function restoreOfflineKit() {
    try {
      const savedOfflineKit = localStorage.getItem('riskpath_offline_kit')
      if (!savedOfflineKit) {
        showToast('No offline kit found on this device.')
        return
      }

      const parsedOfflineKit = parseOfflineKitSnapshot(savedOfflineKit)
      if (!parsedOfflineKit) {
        showToast('Offline kit restore failed.')
        return
      }

      if (parsedOfflineKit.routeData?.current) setRouteData(parsedOfflineKit.routeData)
      if (parsedOfflineKit.hotspots.length) setHotspots(parsedOfflineKit.hotspots)
      if (parsedOfflineKit.facilities.length) setFacilities(parsedOfflineKit.facilities)
      if (parsedOfflineKit.emergencyProfile) setEmergencyProfile(parsedOfflineKit.emergencyProfile)
      showToast('Offline emergency kit restored.')
    } catch {
      showToast('Offline kit restore failed.')
    }
  }

  async function shareGuardianLink() {
    if (!Number.isFinite(location?.lat) || !Number.isFinite(location?.lng)) {
      showToast('Live location is not ready for sharing.')
      return
    }

    const expiresAt = Date.now() + 30 * 60 * 1000
    setGuardianShareExpiresAt(expiresAt)

    const messageText = buildGuardianShareMessage({
      lat: location.lat,
      lng: location.lng,
      start,
      destination,
      expiresAt,
      formatTime,
    })

    try {
      if (navigator.share) {
        await navigator.share({ title: 'RiskPath Guardian Link', text: messageText })
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(messageText)
      }
      showToast('Guardian link shared.')
    } catch {
      showToast('Could not share guardian link.')
    }
  }

  useEffect(() => {
    function onKeyDown(event) {
      if (event.shiftKey && event.key === 'Enter') {
        event.preventDefault()
        handleAnalyze()
      }

      if (event.altKey && event.key.toLowerCase() === 's') {
        event.preventDefault()
        openSos('keyboard')
      }

      if (event.altKey && event.key.toLowerCase() === 'l') {
        event.preventDefault()
        setLiveMonitorOn((prev) => !prev)
      }

    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleAnalyze])

  const currentRouteView = riskBundle
    ? {
        risk: riskBundle.currentEval.risk,
        riskPercent: riskBundle.currentEval.riskPercent,
        timeMin: routeData?.current?.durationMin || 0,
      }
    : null

  const saferRouteView = riskBundle?.alternativeEval
    ? {
        risk: riskBundle.alternativeEval.risk,
        riskPercent: riskBundle.alternativeEval.riskPercent,
        timeMin: routeData?.alternatives?.[0]?.durationMin || 0,
      }
    : null

  const visibleFacilities = facilities.filter((item) => emergencyFilters[item.type] ?? true)

  const sectionLinks = [
    { id: 'overview', label: 'Home' },
    { id: 'route', label: 'Route' },
    { id: 'map', label: 'Map' },
    { id: 'insights', label: 'Insights' },
    { id: 'safety', label: 'Safety' },
    { id: 'emergency', label: 'Emergency' },
  ]

  const showMapOnScreen = activeSection === 'overview' || activeSection === 'map'
  const judgeDemoTotalSeconds = JUDGE_DEMO_STEPS.reduce((sum, step) => sum + step.seconds, 0)
  const judgeDemoActiveStep = JUDGE_DEMO_STEPS[judgeDemo.index]
  const judgeDemoElapsed = useMemo(() => {
    const elapsedBeforeCurrent = JUDGE_DEMO_STEPS.slice(0, judgeDemo.index).reduce((sum, step) => sum + step.seconds, 0)
    const currentStepTotal = JUDGE_DEMO_STEPS[judgeDemo.index]?.seconds || 0
    const elapsedCurrent = Math.max(0, currentStepTotal - judgeDemo.remaining)
    return elapsedBeforeCurrent + elapsedCurrent
  }, [judgeDemo.index, judgeDemo.remaining])
  const judgeDemoProgress = Math.min(100, Math.max(0, Math.round((judgeDemoElapsed / judgeDemoTotalSeconds) * 100)))
  const impactStats = useMemo(() => {
    const riskReduction = Math.max(
      0,
      (riskBundle?.currentEval?.riskPercent || 0) - (riskBundle?.alternativeEval?.riskPercent || 0),
    )

    return {
      riskReduction,
      emergencyCoverage: visibleFacilities.length,
      profileReady: Boolean(emergencyProfile?.fullName && emergencyProfile?.phone),
    }
  }, [riskBundle, visibleFacilities.length, emergencyProfile])

  async function startJudgeDemo() {
    if (judgeDemo.running) return

    const demoFrom = start || 'IIT Madras, Chennai'
    const demoTo = destination || 'Chennai Central, Chennai'

    setStart(demoFrom)
    setDestination(demoTo)

    try {
      await handleAnalyze(demoFrom, demoTo)
    } catch {
      // Keep demo running even if route service is temporarily unavailable.
    }

    setJudgeDemo({ running: true, paused: false, index: 0, remaining: JUDGE_DEMO_STEPS[0].seconds })
    showToast('Judge demo started.')
  }

  function stopJudgeDemo() {
    setJudgeDemo({ running: false, paused: false, index: 0, remaining: 0 })
    setActiveSection('overview')
    showToast('Judge demo stopped.')
  }

  function toggleJudgeDemoPause() {
    if (!judgeDemo.running) return
    setJudgeDemo((prev) => ({ ...prev, paused: !prev.paused }))
    showToast(judgeDemo.paused ? 'Judge demo resumed.' : 'Judge demo paused.')
  }

  function goToJudgeDemoStep(stepIndex) {
    if (!judgeDemo.running) return
    if (stepIndex < 0 || stepIndex >= JUDGE_DEMO_STEPS.length) return

    setJudgeDemo((prev) => ({
      ...prev,
      index: stepIndex,
      remaining: JUDGE_DEMO_STEPS[stepIndex].seconds,
    }))
  }

  function goToNextJudgeDemoStep() {
    if (!judgeDemo.running) return
    const next = Math.min(JUDGE_DEMO_STEPS.length - 1, judgeDemo.index + 1)
    goToJudgeDemoStep(next)
  }

  function goToPreviousJudgeDemoStep() {
    if (!judgeDemo.running) return
    const previous = Math.max(0, judgeDemo.index - 1)
    goToJudgeDemoStep(previous)
  }

  function exportJsonReport() {
    if (!riskBundle?.currentEval) return

    downloadSafetyJson({
      start,
      destination,
      risk: riskBundle.currentEval.risk,
      riskPercent: riskBundle.currentEval.riskPercent,
      confidence: riskBundle.currentEval.confidence,
      highRiskSegments: riskBundle.currentEval.highRiskSegments,
      weather: effectiveCondition,
      traffic: trafficLevel,
      nightMode,
      reasons: riskBundle.currentEval.reasons,
    })
  }

  function exportTextReport() {
    if (!riskBundle?.currentEval) return

    downloadSafetyText({
      start,
      destination,
      risk: riskBundle.currentEval.risk,
      riskPercent: riskBundle.currentEval.riskPercent,
      confidence: riskBundle.currentEval.confidence,
      highRiskSegments: riskBundle.currentEval.highRiskSegments,
      weather: effectiveCondition,
      traffic: trafficLevel,
      nightMode,
      reasons: riskBundle.currentEval.reasons,
    })
  }

  function exportMarkdownReport() {
    if (!riskBundle?.currentEval) return

    downloadSafetyMarkdown({
      start,
      destination,
      risk: riskBundle.currentEval.risk,
      riskPercent: riskBundle.currentEval.riskPercent,
      confidence: riskBundle.currentEval.confidence,
      highRiskSegments: riskBundle.currentEval.highRiskSegments,
      weather: effectiveCondition,
      traffic: trafficLevel,
      nightMode,
      reasons: riskBundle.currentEval.reasons,
    })
  }

  function exportContactsReport() {
    downloadContactsCsv(facilities)
  }

  async function copySummary() {
    if (!riskBundle?.currentEval || !navigator.clipboard) return

    const summary = [
      `RiskPath - Trip Summary`,
      `Route: ${start} -> ${destination}`,
      `Risk: ${riskBundle.currentEval.risk} (${riskBundle.currentEval.riskPercent}%)`,
      `Confidence: ${riskBundle.currentEval.confidence}%`,
      `High-risk segments: ${riskBundle.currentEval.highRiskSegments}`,
      `Weather: ${effectiveCondition}`,
      `Traffic: ${trafficLevel}`,
      `Night mode: ${nightMode ? 'Yes' : 'No'}`,
    ].join('\n')

    try {
      await navigator.clipboard.writeText(summary)
    } catch {
      // Clipboard may fail in some browser contexts.
    }
  }

  const contactShareSummary = [
    'RiskPath emergency alert.',
    emergencyProfile?.fullName ? `User: ${emergencyProfile.fullName}` : null,
    emergencyProfile?.phone ? `User phone: ${emergencyProfile.phone}` : null,
    emergencyProfile?.bloodGroup ? `Blood group: ${emergencyProfile.bloodGroup}` : null,
    emergencyProfile?.allergies ? `Allergies: ${emergencyProfile.allergies}` : null,
    emergencyProfile?.medicalNotes ? `Medical notes: ${emergencyProfile.medicalNotes}` : null,
    `Route: ${start} to ${destination}`,
    `Risk: ${riskBundle?.currentEval?.risk || 'Unknown'} (${riskBundle?.currentEval?.riskPercent || 0}%)`,
    `Location: ${location?.lat?.toFixed(5)}, ${location?.lng?.toFixed(5)}`,
    'Please stay available on call.',
  ].filter(Boolean).join('\n')

  return (
    <div className={`rp-shell min-h-screen text-slate-100 ${compactMode ? 'rp-compact' : ''}`}>
      <div className="rp-ambient-orb one" />
      <div className="rp-ambient-orb two" />
      <Navbar />
      <main className="rp-main mobile-safe pb-8">
        <div className="grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)] xl:items-start">
          <aside className="rp-card dashboard-sidebar sticky top-[86px] hidden h-[calc(100vh-110px)] overflow-auto rounded-3xl p-3 xl:block">
            <div className="mb-3 px-2 pt-1">
              <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-200">Home Dashboard</p>
              <p className="mt-1 text-sm text-slate-400">Simple sections</p>
            </div>
            <nav className="rp-sidebar-nav space-y-1.5">
              {sectionLinks.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  className={`block w-full rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                    activeSection === item.id
                      ? 'border-cyan-200/50 bg-cyan-300/15 text-cyan-50'
                      : 'border-transparent bg-[#081225]/45 text-slate-300 hover:border-slate-600 hover:text-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          <section className="space-y-4">
            <div className="rp-card rp-control-bar rp-float-in flex flex-wrap items-center justify-between gap-2 rounded-2xl px-3 py-2 text-xs">
              <span className={`rp-pill rounded-full border px-2 py-1 font-semibold ${isOnline ? 'border-emerald-300/50 bg-emerald-400/10 text-emerald-200' : 'border-amber-300/50 bg-amber-400/10 text-amber-200'}`}>
                {isOnline ? 'Online' : 'Offline mode'}
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={togglePresentationMode}
                  className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${
                    presentationMode
                      ? 'border-amber-300/55 bg-amber-300/15 text-amber-100'
                      : 'border-cyan-300/50 bg-cyan-300/10 text-cyan-100'
                  }`}
                >
                  {presentationMode ? 'Stop presentation' : 'Presentation mode'}
                </button>
                <button
                  type="button"
                  onClick={handleCompactToggle}
                  className="rounded-lg border border-slate-600 px-2.5 py-1 text-xs font-semibold text-slate-200"
                >
                  {compactMode ? 'Normal view' : 'Compact view'}
                </button>
              </div>
            </div>

            {judgeDemo.running && judgeDemoActiveStep && (
              <div className="rp-card sticky top-[88px] z-[1000] rounded-2xl border border-cyan-300/45 bg-[#061228]/95 p-3 text-xs text-cyan-100 shadow-2xl shadow-cyan-950/40">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold uppercase tracking-[0.18em]">Judge Demo Running</p>
                  <p className="text-[11px] text-cyan-200">Step {judgeDemo.index + 1}/{JUDGE_DEMO_STEPS.length} • {judgeDemo.paused ? 'Paused' : `Next in ${judgeDemo.remaining}s`}</p>
                </div>

                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800/80">
                  <div className="h-full rounded-full bg-cyan-300/85 transition-all" style={{ width: `${judgeDemoProgress}%` }} />
                </div>

                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-cyan-300/30 bg-cyan-300/10 p-2.5">
                    <p className="text-[11px] uppercase tracking-[0.15em] text-cyan-200">Current segment</p>
                    <p className="mt-1 text-sm font-semibold text-white">{judgeDemoActiveStep.label}</p>
                    <p className="mt-1 text-slate-300">{judgeDemoActiveStep.note}</p>
                  </div>
                  <div className="rounded-xl border border-cyan-300/25 bg-[#0b1b34]/70 p-2.5">
                    <p className="text-[11px] uppercase tracking-[0.15em] text-cyan-200">What judges should learn</p>
                    <p className="mt-1 text-slate-200">{judgeDemoActiveStep.judgeLearn}</p>
                    <p className="mt-1 text-[11px] text-cyan-100">Show now: {judgeDemoActiveStep.objective}</p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={goToPreviousJudgeDemoStep}
                    className="rounded-lg border border-slate-500 px-2.5 py-1 text-[11px] font-semibold text-slate-200"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={toggleJudgeDemoPause}
                    className="rounded-lg border border-cyan-300/45 bg-cyan-300/15 px-2.5 py-1 text-[11px] font-semibold text-cyan-100"
                  >
                    {judgeDemo.paused ? 'Resume' : 'Pause'}
                  </button>
                  <button
                    type="button"
                    onClick={goToNextJudgeDemoStep}
                    className="rounded-lg border border-slate-500 px-2.5 py-1 text-[11px] font-semibold text-slate-200"
                  >
                    Next
                  </button>
                  <button
                    type="button"
                    onClick={stopJudgeDemo}
                    className="rounded-lg border border-rose-300/45 bg-rose-500/15 px-2.5 py-1 text-[11px] font-semibold text-rose-100"
                  >
                    Stop
                  </button>
                </div>
              </div>
            )}

            <div className="xl:hidden">
              <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
                {sectionLinks.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveSection(item.id)}
                    className={`whitespace-nowrap rounded-full border px-3 py-2 text-xs transition ${
                      activeSection === item.id
                        ? 'border-cyan-200/50 bg-cyan-300/15 text-cyan-50'
                        : 'border-slate-700 bg-[#081225]/60 text-slate-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {activeSection === 'overview' && (
            <section id="home-overview" className="space-y-4">
              <div className="rp-card rp-hero-card rp-tilt-card rp-float-in rounded-2xl p-5 sm:p-6">
                <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-200">Home Dashboard</p>
                <h1 className="mt-2 font-display text-3xl text-white sm:text-4xl">Know the risk before the road.</h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-300">
                  Know the risk before the road.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => openSos('home-quick')}
                    className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-400"
                  >
                    Open SOS now
                  </button>
                  {judgeDemo.running ? (
                    <button
                      onClick={stopJudgeDemo}
                      className="rounded-xl border border-amber-300/50 bg-amber-300/15 px-4 py-2 text-sm font-semibold text-amber-100"
                    >
                      Stop demo
                    </button>
                  ) : (
                    <button
                      onClick={startJudgeDemo}
                      className="rounded-xl border border-cyan-300/55 bg-cyan-300/15 px-4 py-2 text-sm font-semibold text-cyan-100"
                    >
                      Start {judgeDemoTotalSeconds}s judge demo
                    </button>
                  )}
                </div>
              </div>

              <div className="rp-card rp-tilt-card rounded-2xl border-cyan-300/35 bg-cyan-300/10 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-cyan-100">Impact Snapshot</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div>
                    <p className="text-2xl font-semibold text-white">{impactStats.riskReduction}%</p>
                    <p className="text-xs text-slate-300">Potential risk reduction with safer route</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-white">{impactStats.emergencyCoverage}</p>
                    <p className="text-xs text-slate-300">Nearby emergency points available now</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-white">{impactStats.profileReady ? 'Ready' : 'Pending'}</p>
                    <p className="text-xs text-slate-300">Emergency profile response readiness</p>
                  </div>
                </div>
              </div>

              {presentationMode && (
                <div className="rp-card rounded-2xl border-amber-300/35 bg-amber-300/10 p-4 text-sm text-amber-50">
                  <p className="text-xs uppercase tracking-[0.18em] text-amber-200">Presentation Script</p>
                  <p className="mt-2 text-slate-100">Use this script for a clean 60 to 90 second walkthrough.</p>
                  <ol className="mt-3 space-y-1 text-xs text-slate-200">
                    {PRESENTATION_SCRIPT.map((item, idx) => (
                      <li key={item}>{idx + 1}. {item}</li>
                    ))}
                  </ol>
                  <button
                    type="button"
                    onClick={copyPresentationScript}
                    className="mt-3 rounded-lg border border-amber-200/55 bg-amber-300/15 px-3 py-1.5 text-xs font-semibold text-amber-100"
                  >
                    Copy demo script
                  </button>
                </div>
              )}

              <div className="rp-metric-grid grid gap-4 md:grid-cols-3">
                <div className="rp-card rp-tilt-card rounded-2xl p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Current risk</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{riskBundle?.currentEval?.risk || 'Low'}</p>
                  <p className="mt-1 text-sm text-slate-300">{riskBundle?.currentEval?.riskPercent || 0}% route risk.</p>
                </div>
                <div className="rp-card rp-tilt-card rounded-2xl p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Nearby help</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{visibleFacilities.length}</p>
                  <p className="mt-1 text-sm text-slate-300">Places within reach.</p>
                </div>
                <div className="rp-card rp-tilt-card rounded-2xl p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Crash monitor</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{crashDetectionEnabled ? 'ON' : 'OFF'}</p>
                  <p className="mt-1 text-sm text-slate-300">Auto SOS trigger status.</p>
                </div>
              </div>
            </section>
            )}

            {activeSection === 'route' && (
            <section id="route" className="space-y-4">
              <div className="rp-card rounded-2xl p-3">
                <RouteForm
                  start={start}
                  destination={destination}
                  scope={routeScope}
                  onScopeChange={setRouteScope}
                  onStartChange={setStart}
                  onDestinationChange={setDestination}
                  onAnalyze={handleAnalyze}
                  onClear={clearRouteInputs}
                  onUseCurrentLocation={useCurrentLocationAsStart}
                  hasCurrentLocation={Number.isFinite(location?.lat) && Number.isFinite(location?.lng)}
                  loading={loading}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setLiveMonitorOn((prev) => !prev)}
                  className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                    liveMonitorOn
                      ? 'border-cyan-200/50 bg-cyan-300/15 text-cyan-50'
                      : 'border-slate-600 bg-[#081225]/60 text-slate-200 hover:border-slate-500'
                  }`}
                >
                  {liveMonitorOn ? `Live monitor on (${monitorPing}s)` : 'Start live risk recheck'}
                </button>
              </div>
            </section>
            )}

            {showMapOnScreen && (
            <section id="map" className="space-y-4">
              {locationError && <p className="rounded-xl border border-amber-200/55 bg-amber-300/12 p-3 text-xs text-amber-100">{locationError}</p>}
              {message && <p className="rounded-xl border border-rose-300/55 bg-rose-500/12 p-3 text-xs text-rose-100">{message}</p>}

              {isHighRiskZone && (
                <div className="rounded-xl border border-rose-300/60 bg-rose-500/12 p-3 text-sm text-rose-50">
                  High-risk zone detected.
                </div>
              )}

              {loading ? (
                <div className="rp-card overflow-hidden rounded-2xl p-4">
                  <div className="h-[360px] animate-pulse rounded-xl bg-slate-800 sm:h-[480px]" />
                </div>
              ) : (
                <Suspense
                  fallback={
                    <div className="rp-card overflow-hidden rounded-2xl p-4">
                      <div className="h-[360px] animate-pulse rounded-xl bg-slate-800 sm:h-[480px]" />
                    </div>
                  }
                >
                  <MapPanel
                    center={location}
                    currentRoute={routeData?.current}
                    saferRoute={routeData?.alternatives?.[0]}
                    activeRoute={activeRoute}
                    segmentRisks={riskBundle?.currentEval?.segmentRisks || []}
                    hotspots={hotspots}
                    facilities={visibleFacilities}
                    emergencyFilters={emergencyFilters}
                    onToggleEmergencyFilter={toggleEmergencyFilter}
                    hazards={hazards}
                    hazardClickMode={hazardClickMode}
                    onAddHazard={addHazard}
                    start={start}
                    destination={destination}
                    routeScope={routeScope}
                    onStartChange={setStart}
                    onDestinationChange={setDestination}
                    onAnalyze={handleAnalyze}
                    onClearInputs={clearRouteInputs}
                    onUseCurrentLocation={useCurrentLocationAsStart}
                    hasCurrentLocation={Number.isFinite(location?.lat) && Number.isFinite(location?.lng)}
                    loading={loading}
                    onOpenSos={() => openSos('map-sos')}
                    safetyScore={riskBundle?.currentEval?.safetyScore || 88}
                    highRiskSegments={riskBundle?.currentEval?.highRiskSegments || 0}
                    weatherCondition={effectiveCondition}
                    nightMode={nightMode}
                  />
                </Suspense>
              )}

              <RouteComparison
                currentResult={currentRouteView}
                saferResult={saferRouteView}
                activeRoute={activeRoute}
                onSwitch={setActiveRoute}
              />

              <section className="rp-card rounded-2xl p-4 text-sm text-slate-200 sm:p-5">
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-cyan-100">Route summary</h3>
                <p>Overall risk: <span className="font-semibold text-white">{riskBundle?.currentEval?.risk || 'Low'}</span></p>
                <p>Risk percentage: <span className="font-semibold text-white">{riskBundle?.currentEval?.riskPercent || 0}%</span></p>
                <p>High-risk segments: <span className="font-semibold text-white">{riskBundle?.currentEval?.highRiskSegments || 0}</span></p>
              </section>
            </section>
            )}

            {activeSection === 'insights' && (
            <section id="insights" className="space-y-4">
              <WeatherCard weather={weather} forcedCondition={null} />
              <RiskBar riskPercent={riskBundle?.currentEval?.riskPercent || 0} confidence={riskBundle?.currentEval?.confidence || 0} />
              <InsightPanel
                riskEval={riskBundle?.currentEval || null}
                voiceEnabled={voiceEnabled}
                onToggleVoice={() => setVoiceEnabled((prev) => !prev)}
                onExportJson={exportJsonReport}
                onExportText={exportTextReport}
                onExportMarkdown={exportMarkdownReport}
                onCopySummary={copySummary}
              />
            </section>
            )}

            {activeSection === 'safety' && (
            <section id="safety" className="space-y-4">
              <RoadSoSCompliancePanel facilities={visibleFacilities} routeScope={routeScope} onExportContacts={exportContactsReport} />
              <TrustedContactsPanel
                contacts={contacts}
                onAddContact={addTrustedContact}
                onDeleteContact={removeTrustedContact}
                summaryText={contactShareSummary}
              />
              <HazardReporterPanel onAddHazard={addHazard} clickMode={hazardClickMode} onToggleClickMode={() => setHazardClickMode((prev) => !prev)} />
              {crashDetectionEnabled ? (
                <CrashDetectionPanel onTriggerEmergency={openSos} />
              ) : (
                <section className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4 sm:p-5">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Auto Crash Detection</h2>
                  <p className="mt-2 text-sm text-slate-400">Crash auto-detection is currently turned off from Emergency settings.</p>
                </section>
              )}
            </section>
            )}

            {activeSection === 'emergency' && (
            <section id="emergency" className="space-y-4">
              <div className="rp-card rounded-2xl p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Emergency</p>
                <h2 className="mt-2 font-display text-2xl text-white">Quick access</h2>
                <p className="mt-1 text-sm text-slate-300">Open SOS, share location, or navigate to help.</p>
                <div className="mt-4 rounded-xl border border-slate-700 bg-slate-900/60 p-3 text-sm text-slate-200">
                  <p className="font-semibold text-white">Emergency profile</p>
                  <p className="mt-1 text-xs text-slate-300">
                    {emergencyProfile?.fullName
                      ? `${emergencyProfile.fullName} • ${emergencyProfile.phone || 'No phone'}`
                      : 'Not set yet. Add emergency profile details for faster SOS response.'}
                  </p>
                  {emergencyProfile?.bloodGroup && <p className="mt-1 text-xs text-slate-400">Blood group: {emergencyProfile.bloodGroup}</p>}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={editEmergencyProfile}
                      className="rounded-lg border border-cyan-200/50 bg-cyan-300/15 px-3 py-1.5 text-xs font-semibold text-cyan-50"
                    >
                      {emergencyProfile ? 'Edit emergency info' : 'Add emergency info'}
                    </button>
                    {emergencyProfile && (
                      <button
                        type="button"
                        onClick={clearEmergencyProfile}
                        className="rounded-lg border border-rose-300/50 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-200"
                      >
                        Clear emergency info
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={replayOnboardingTour}
                      className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs font-semibold text-slate-200"
                    >
                      Replay app tour
                    </button>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2">
                  <p className="text-sm text-slate-200">Auto crash detection</p>
                  <button
                    type="button"
                    onClick={toggleCrashDetectionFeature}
                    className={`rounded-lg px-3 py-1 text-xs font-semibold ${
                      crashDetectionEnabled
                        ? 'bg-emerald-400/20 text-emerald-200'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {crashDetectionEnabled ? 'ON' : 'OFF'}
                  </button>
                </div>
                <div className="mt-4 rounded-xl border border-slate-700 bg-slate-900/60 p-3">
                  <p className="text-sm font-semibold text-white">Offline emergency kit</p>
                  <p className="mt-1 text-xs text-slate-300">
                    {offlineKitMeta
                      ? `Ready. Last updated ${new Date(offlineKitMeta.updatedAt).toLocaleString()}`
                      : 'Not ready yet. Analyze one route to prepare offline backup.'}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                    <span className="rounded-full border border-cyan-300/40 bg-cyan-300/10 px-2 py-1 text-cyan-100">
                      Route: {offlineKitMeta?.hasRoute ? 'Saved' : 'Missing'}
                    </span>
                    <span className="rounded-full border border-cyan-300/40 bg-cyan-300/10 px-2 py-1 text-cyan-100">
                      Facilities: {offlineKitMeta?.facilitiesCount || 0}
                    </span>
                    <span className="rounded-full border border-cyan-300/40 bg-cyan-300/10 px-2 py-1 text-cyan-100">
                      Profile: {emergencyProfile ? 'Saved' : 'Missing'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={restoreOfflineKit}
                    className="mt-3 rounded-lg border border-slate-500 px-3 py-1.5 text-xs font-semibold text-slate-200"
                  >
                    Restore offline data
                  </button>
                </div>
                <div className="mt-4 rounded-xl border border-slate-700 bg-slate-900/60 p-3">
                  <p className="text-sm font-semibold text-white">Guardian link</p>
                  <p className="mt-1 text-xs text-slate-300">Share live location with a trusted person. Link expires in 30 minutes.</p>
                  {guardianShareExpiresAt > Date.now() && (
                    <p className="mt-1 text-[11px] text-cyan-200">Active until {formatTime(guardianShareExpiresAt)}</p>
                  )}
                  <button
                    type="button"
                    onClick={shareGuardianLink}
                    className="mt-3 rounded-lg border border-cyan-300/50 bg-cyan-300/15 px-3 py-1.5 text-xs font-semibold text-cyan-100"
                  >
                    Share guardian link
                  </button>
                </div>
                <button onClick={() => openSos('sidebar')} className="mt-4 rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-400">
                  Open SOS panel
                </button>
              </div>
            </section>
            )}
          </section>
        </div>
      </main>

      <SosOverlay
        open={sosOpen}
        location={location}
        emergencyProfile={emergencyProfile}
        onCopyEmergencyMessage={handleCopiedEmergencyMessage}
        onClose={() => setSosOpen(false)}
      />
      {onboardingOpen && (
        <FirstTimeOnboarding
          initialStage={onboardingMode}
          initialProfile={emergencyProfile}
          onGoToSection={setActiveSection}
          onSkip={skipFirstTimeOnboarding}
          onComplete={completeFirstTimeOnboarding}
        />
      )}

      {toast && (
        <div className="fixed bottom-4 right-4 z-[2300] max-w-xs rounded-xl border border-cyan-300/45 bg-slate-950/95 px-3 py-2 text-xs font-semibold text-cyan-100 shadow-lg shadow-cyan-950/40">
          {toast}
        </div>
      )}

      {presentationMode && (
        <div className="fixed bottom-4 left-4 z-[2250] w-[min(92vw,360px)] rounded-xl border border-amber-300/45 bg-[#171208]/95 p-3 text-xs text-amber-100 shadow-2xl shadow-amber-950/40">
          <p className="font-semibold uppercase tracking-[0.18em]">Presentation Mode Active</p>
          <p className="mt-1 text-slate-200">Focused demo layout enabled.</p>
          <button
            type="button"
            onClick={togglePresentationMode}
            className="mt-2 rounded-lg border border-amber-200/55 bg-amber-300/15 px-2.5 py-1 text-xs font-semibold text-amber-100"
          >
            Stop presentation mode
          </button>
        </div>
      )}
    </div>
  )
}
