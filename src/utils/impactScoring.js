function riskToScore(label) {
  if (label === 'High') return 3
  if (label === 'Medium') return 2
  return 1
}

export function buildImpactSummary({ currentEval, alternativeEval, currentDuration, alternativeDuration }) {
  if (!currentEval) {
    return {
      verdict: 'Analyze a route to compute safety impact.',
      recommendation: 'Run analysis first.',
      riskDeltaPercent: 0,
      timeDeltaMin: 0,
      impactScore: 0,
      confidence: 0,
      saferWorthSwitch: false,
    }
  }

  if (!alternativeEval) {
    return {
      verdict: 'No alternate route found for this trip.',
      recommendation: 'Proceed with caution and monitor red segments.',
      riskDeltaPercent: 0,
      timeDeltaMin: 0,
      impactScore: Math.max(0, 100 - currentEval.riskPercent),
      confidence: currentEval.confidence,
      saferWorthSwitch: false,
    }
  }

  const riskDeltaPercent = currentEval.riskPercent - alternativeEval.riskPercent
  const timeDeltaMin = alternativeDuration - currentDuration
  const rankGap = riskToScore(currentEval.risk) - riskToScore(alternativeEval.risk)

  const impactScore = Math.max(
    0,
    Math.min(100, Math.round(50 + riskDeltaPercent * 1.8 + rankGap * 8 - Math.max(0, timeDeltaMin) * 1.4)),
  )

  const saferWorthSwitch = riskDeltaPercent >= 8 || rankGap >= 1

  const verdict = saferWorthSwitch
    ? 'Switching route provides meaningful risk reduction.'
    : 'Current route is acceptable under present conditions.'

  const recommendation = saferWorthSwitch
    ? `Estimated risk reduction: ${Math.max(0, riskDeltaPercent)}% for ~${Math.max(0, timeDeltaMin)} extra minutes.`
    : 'Stay on the current route but keep alerts enabled near hotspot segments.'

  return {
    verdict,
    recommendation,
    riskDeltaPercent,
    timeDeltaMin,
    impactScore,
    confidence: Math.round((currentEval.confidence + alternativeEval.confidence) / 2),
    saferWorthSwitch,
  }
}
