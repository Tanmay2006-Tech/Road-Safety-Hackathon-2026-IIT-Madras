function createBlobAndDownload(filename, content, mime = 'application/json') {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  link.click()

  URL.revokeObjectURL(url)
}

export function downloadSafetyJson(payload) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  createBlobAndDownload(`riskpath-report-${timestamp}.json`, JSON.stringify(payload, null, 2))
}

export function downloadSafetyText(payload) {
  const reasons = Array.isArray(payload?.reasons) ? payload.reasons : []
  const lines = [
    'RiskPath - Route Safety Snapshot',
    '-----------------------------------',
    `Generated: ${new Date().toLocaleString()}`,
    `Route: ${payload.start} -> ${payload.destination}`,
    `Risk: ${payload.risk}`,
    `Risk Percent: ${payload.riskPercent}%`,
    `Confidence: ${payload.confidence}%`,
    `High-Risk Segments: ${payload.highRiskSegments}`,
    `Weather: ${payload.weather}`,
    `Traffic: ${payload.traffic}`,
    `Night mode: ${payload.nightMode ? 'Yes' : 'No'}`,
    '',
    'Reasons:',
    ...reasons.map((item) => `- ${item.factor}: ${item.impact}`),
  ]

  createBlobAndDownload('riskpath-brief.txt', lines.join('\n'), 'text/plain')
}

export function downloadSafetyMarkdown(payload) {
  const reasons = Array.isArray(payload?.reasons) ? payload.reasons : []
  const lines = [
    '# RiskPath Safety Evidence Pack',
    '',
    `Generated: ${new Date().toLocaleString()}`,
    '',
    '## Trip',
    `- Route: ${payload.start} -> ${payload.destination}`,
    `- Risk: ${payload.risk} (${payload.riskPercent}%)`,
    `- Confidence: ${payload.confidence}%`,
    `- High-risk segments: ${payload.highRiskSegments}`,
    '',
    '## Context',
    `- Weather: ${payload.weather}`,
    `- Traffic: ${payload.traffic}`,
    `- Night mode: ${payload.nightMode ? 'Yes' : 'No'}`,
    '',
    '## Why The Model Flagged Risk',
    ...reasons.map((item) => `- ${item.factor}: ${item.impact}`),
  ]

  createBlobAndDownload('riskpath-evidence-pack.md', lines.join('\n'), 'text/markdown')
}

export function downloadContactsCsv(facilities = []) {
  const header = ['id', 'name', 'type', 'lat', 'lng']
  const rows = facilities.map((item) => [
    item.id,
    `"${(item.name || '').replaceAll('"', '""')}"`,
    item.type,
    item.lat,
    item.lng,
  ])

  const csv = [header.join(','), ...rows.map((row) => row.join(','))].join('\n')
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  createBlobAndDownload(`riskpath-contacts-${timestamp}.csv`, csv, 'text/csv')
}
