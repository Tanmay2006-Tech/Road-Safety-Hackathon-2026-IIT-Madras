# RiskPath

<p align="center">
  <img src="public/riskpath-logo.svg" alt="RiskPath logo" width="120" />
</p>

RiskPath is a prevention-first road safety platform that predicts route risk before travel, highlights dangerous segments on a live map, suggests safer alternatives, and exposes emergency support when it matters.

## Hackathon Pitch

Road safety tools are usually reactive. RiskPath is designed to be the opposite: it helps a user understand risk before starting the trip, shows why that route is risky, and gives immediate actions for emergency response.

In one flow, the app does three things:

1. checks the route risk
2. explains the reason behind the score
3. helps the user act fast with map-based support and SOS options

## What It Solves

India's road-safety problem is not only about accidents. It is also about:

- delayed access to nearby hospitals, police, and support services
- poor visibility conditions like rain, fog, and night travel
- lack of route-level risk awareness before travel
- fragmented access to emergency tools during a stressful event

RiskPath unifies those needs in one interface.

## Core Features

- Route risk analysis with current vs safer route comparison
- Clear route reasons with factor-level explanations
- Live map with route, hotspots, hazards, and emergency services
- Destination pin and current-location marker on the map
- Nearby services panel with fallback when external APIs fail
- Crash detection and SOS support
- Trusted contacts and shareable emergency details
- Offline emergency kit with route/profile restore
- Downloadable route safety reports
- PWA support, offline cache, and error-boundary recovery
- Presentation/demo friendly walkthrough flow

## Why This Project Is Strong For Judging

- It solves a real and easy-to-understand problem.
- It has a complete user journey from route entry to emergency action.
- It looks and behaves like a deployable product, not just a prototype.
- It has resilience: API fallback, offline support, and crash recovery.
- It is demoable in under a minute and still explainable in detail.

## Tech Stack

- React 19 + Vite 8
- Tailwind CSS
- Leaflet / React Leaflet / Leaflet cluster
- OpenStreetMap, Nominatim, OSRM, Overpass
- OpenWeather API
- Frontend-only JavaScript risk engine

## How It Works

1. Enter start and destination.
2. Click Show risk.
3. Review the score, route reasons, and nearby services.
4. Switch to the map to inspect routes and service markers.
5. Open insights for a cleaner explanation and exports.
6. Use SOS, contacts, or the offline emergency kit if needed.

## Demo Flow For Judges

1. Open the app.
2. Enter a sample route.
3. Show the result card in the Route section.
4. Open the map and point out route segments and destination pin.
5. Explain how nearby services and emergency links work.
6. Trigger SOS to show emergency readiness.
7. Mention offline fallback and error recovery.

## Reliability and Fallback Behavior

- Geocoding/search uses country-scoped lookup with global fallback.
- Routing uses OSRM with user-visible error handling if unavailable.
- Nearby services query multiple Overpass endpoints.
- If Overpass is unavailable, the app generates fallback emergency points for demo continuity.
- Offline mode preserves cached UI and restores saved route/profile snapshots.
- Error Boundary prevents a hard crash and offers recovery.

## Known Limitations

- Public APIs can rate-limit or return partial data.
- Live traffic is simulated in this frontend-only build.
- Fallback nearby points are continuity placeholders, not official verified facilities.
- Real dispatch integration is outside the scope of this prototype.

## Assumptions

- Free public APIs may occasionally be slow or unavailable.
- Route alternatives may not exist for every route.
- Traffic is simulated for the demo experience.
- Hotspot data is generated for visual risk modeling.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Optional weather setup:

```bash
VITE_OPENWEATHER_API_KEY=your_key
```

3. Run locally:

```bash
npm run dev
```

4. Build for submission:

```bash
npm run build
```

5. Quality checks:

```bash
npm run lint
npm run check
```

## Deployment

Static frontend app.

- Vercel: build command `npm run build`, output `dist`
- Netlify: build command `npm run build`, publish `dist`

## Keyboard Shortcuts

- `Shift + Enter` -> analyze route immediately
- `Alt + S` -> open SOS overlay
- `Alt + L` -> toggle live monitor
- `Alt + D` -> run demo

## Project Structure

```text
src/
  components/
  pages/
  utils/
  hooks/
public/
README.md
```

## Sharing Notes

- This submission is intended to include the active app source plus this README.
- Unused starter panels and placeholder SVGs were removed to keep review simple.
- Docs-folder submission materials have been removed because you only want to submit the README.

---
Built for prevention-first road safety impact.
