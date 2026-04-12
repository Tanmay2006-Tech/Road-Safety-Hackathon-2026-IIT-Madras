# RiskPath

RiskPath is a SaaS-style AI road safety platform for India that predicts accident risk before travel, highlights dangerous route segments, suggests safer alternatives, and provides instant emergency support.

## Problem Statement (RoadSoS + AI Context)

Road accidents in India often become fatal not because of the accident itself, but due to:

- lack of real-time awareness of dangerous routes
- no system to predict accident risk before travel
- delays in accessing nearby emergency services
- poor visibility conditions (rain, fog, night driving)
- fragmented access to hospitals, police, and rescue services

Most existing systems are reactive. They respond only after accidents.

### Core Problem

There is no intelligent, real-time system that can predict road risk, guide users to safer routes, and provide instant emergency support in a unified platform.

## Solution Overview

RiskPath is an AI-powered road safety system that predicts accident risk, visualizes dangerous route segments, suggests safer alternatives, and provides instant SOS support using real-time data like weather and location.

## Core Features

- Route Risk Analyzer with segment-level scoring
- Color-coded route segments (Green, Yellow, Red)
- Overall risk label, risk percentage, confidence, and high-risk segment count
- Safer route comparison and route switch
- Real-time weather context (OpenWeather + fallback)
- Predictive high-risk alert (visual + voice)
- Smart Departure Advisor (leave now / delay / safer-route recommendation)
- Crash Detection Mode with auto-SOS countdown
- Trusted Contacts panel with WhatsApp/SMS emergency sharing
- 2-minute live trip risk recheck mode
- SOS emergency panel with India helplines (108, 100, 101)
- Hotspot layer for accident-prone zones
- Expanded emergency network on map:
  - hospitals
  - police stations
  - fire stations
  - clinics
  - pharmacies
  - ambulance stations
- Category filters with live counts and marker clustering
- Emergency service logos/icons directly on map markers
- Emergency quick-action panel (instant call + nearest hospital/police navigation)
- Mobile quick-control strip on map for analyze/SOS
- Community hazard reporting (quick report + map click placement)
- Hazard markers shown directly on map
- AI model lab scenarios and demo toggles
- Downloadable route safety reports (.json and .txt)
- One-click judge demo mode
- Admin analytics snapshot (trips, SOS events, hazards, emergency points)
- Predictive Risk Timeline (15/30/45 min forward risk projection)
- Power-user Command Center with keyboard shortcuts
- Judge Impact Snapshot with quantified safety-vs-ETA tradeoff
- Competition Edge panel with one-click 30-second pitch copy
- RoadSoS Compliance Board with live criterion checks
- PWA installability + offline cache support
- Runtime safety layer with React Error Boundary fallback
- Connection-aware status banner (offline/online/update state)
- Lazy-loaded map module for faster first paint
- Evidence Pack export in Markdown for presentations and submission docs
- Contacts CSV export for fetched-service proof in evaluation

## Tech Stack

- React + Vite
- Tailwind CSS
- Leaflet + React Leaflet
- OpenStreetMap / Nominatim / OSRM
- Overpass API
- OpenWeather API
- JavaScript AI risk engine (frontend only)

## Project Structure

```
src/
  components/
  pages/
  utils/
  hooks/
docs/
README.md
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Optional weather API setup:

- Copy `.env.example` to `.env`
- Add key:

```bash
VITE_OPENWEATHER_API_KEY=your_key
```

3. Run app:

```bash
npm run dev
```

4. Build app:

```bash
npm run build
```

5. Optional quality checks:

```bash
npm run lint
npm run check
```

## Compliance Matrix

- Stage-1 and RoadSoS requirement mapping:
  - `docs/STAGE1_COMPLIANCE_MATRIX.md`

## Keyboard Shortcuts

- `Shift + Enter` -> analyze route immediately
- `Alt + S` -> open SOS overlay
- `Alt + L` -> toggle live monitor
- `Alt + D` -> run one-click judge demo

## Production-Grade Upgrades (2026)

- PWA support with `manifest.webmanifest` and service worker caching
- Graceful UI crash handling via Error Boundary with recovery action
- Predictive timeline engine for near-future risk outlook
- Accessibility upgrades (`:focus-visible`, reduced-motion support)
- Improved metadata for better link previews and presentation

## Why This Project Stands Out

- Prevention-first architecture: predicts and visualizes risk before incidents
- India-grounded operational utility: emergency routing + contact workflows
- Demo-ready and recruiter-ready product quality: modern UX + measurable signals
- Designed for real adoption constraints (rate limits, network loss, offline fallback)

## Risk Logic (AI Engine)

Inputs:
- weather (`Clear`, `Rain`, `Fog`)
- time context (`day`, `night`)
- traffic simulation (`moderate`, `heavy`)
- hotspot proximity
- deterministic segment variance

Outputs:
- risk label (`Low`, `Medium`, `High`)
- risk percentage
- confidence score
- high-risk segment count
- factor-level reason list

Sample output:

```json
{
  "risk": "High",
  "confidence": 78,
  "reasons": [
    { "factor": "Rain", "impact": "+25%" },
    { "factor": "Night", "impact": "+20%" }
  ]
}
```

## India-Focused Usability

- emergency numbers mapped to India services
- route/place queries biased toward India
- nearby hospitals and police discovery in practical radius
- emergency service coverage fetched around route origin, destination, and mid-corridor
- mobile-first UI for commuter context

## Assumptions

- free public APIs can rate-limit occasionally
- OSRM alternatives may not exist for every route
- traffic is simulated in demo mode
- hotspot data is demo/dummy generated
- weather falls back if API key is unavailable

## Stage 1 Submission Requirements

### 1) Code
- complete and working project
- clear structure and runnable setup

### 2) Presentation (Strict 7 Slides)
Exactly these sections:
1. Welcome
2. Problem
3. Solution
4. Working
5. Tech Stack
6. Results/Demo
7. Thank You

Prepared content file:
- `docs/PPT_7_SLIDES_CONTENT.md`

### 3) Word Document
Must include:
- project description
- software packages used
- assumptions
- implementation details

Prepared content file:
- `docs/STAGE1_WORD_DOCUMENT_CONTENT.md`

## Evaluation Focus

- meaningful AI usage
- real-world impact
- innovation
- working demo quality
- clear explanation during presentation

## Deployment

Static frontend app. No backend required.

- Vercel: build command `npm run build`, output `dist`
- Netlify: build command `npm run build`, publish `dist`

## Demo Flow (Recommended)

1. Enter source and destination
2. Analyze route risk
3. Show red/yellow/green route segments
4. Enable rain/night/heavy traffic toggles
5. Compare with safer route and switch
6. Show voice warning and predictive alert
7. Trigger SOS panel and emergency links
8. Export trip safety report

---
Built for prevention-first road safety impact.
