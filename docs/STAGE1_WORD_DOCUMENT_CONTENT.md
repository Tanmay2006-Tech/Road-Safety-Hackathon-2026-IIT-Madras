# RiskPath - Stage 1 Word Document Content

## 1. Project Description
RiskPath is a web-based AI-assisted road safety platform built for India-focused travel conditions. The application predicts route risk before travel begins, highlights dangerous map segments, suggests safer route alternatives, and offers emergency SOS support from the same interface.

The key objective is to shift from reactive accident handling to proactive accident prevention. Users can analyze their trip, understand risk factors such as weather and night driving, and take safer route decisions in advance.

## 2. Problem Statement
Road accidents in India often become fatal not because of the accident alone, but due to delayed response and lack of pre-travel intelligence.

Major issues addressed:
- lack of real-time awareness of dangerous routes
- no prediction system for accident risk before travel
- delays in accessing nearby emergency services
- poor visibility conditions (rain, fog, night)
- fragmented access to hospitals, police, and rescue
- limited visibility of towing, puncture repair, and vehicle support services

Current systems are mostly reactive. RiskPath addresses this gap with a unified proactive platform.

## 3. Solution Summary
RiskPath combines geospatial routing, contextual risk scoring, and emergency support in one product.

Main capabilities:
- route risk analyzer with segment color coding
- safer route alternative suggestion
- weather-aware and context-aware risk scoring
- predictive high-risk alerts (visual and voice)
- SOS panel with emergency helplines and location
- nearby hospitals and police station mapping
- nearest ambulance, towing, puncture-repair, and showroom support points
- global route scope option for cross-country applicability
- low-network continuity through offline-capable PWA shell

## 4. Software Packages and Technologies Used
Frontend:
- React
- Vite
- Tailwind CSS

Mapping and Geo:
- Leaflet
- React Leaflet
- OpenStreetMap tiles

APIs:
- Nominatim API (location search)
- OSRM API (route and alternatives)
- OpenWeather API (weather context)
- Overpass API (nearby emergency services)

Icons/UI:
- Lucide React

## 5. Implementation Details
### 5.1 Route Processing
- user enters source and destination
- places are geocoded to coordinates
- primary and alternative routes are fetched
- route geometry is split into multiple segments

### 5.2 AI Risk Engine
Each route segment is assigned a risk score using weighted factors:
- weather impact (rain/fog/clear)
- time impact (day/night)
- traffic impact (simulated in demo mode)
- hotspot proximity impact
- deterministic variance for segment realism

Outputs generated:
- risk label (Low, Medium, High)
- risk percentage
- confidence score
- risk reasons with factor impact percentages
- high-risk segment count

### 5.3 Visualization Layer
- segment colors: green/yellow/red
- gradient risk bar with pointer
- route comparison table (current vs safer route)
- dashboard cards for risk metrics

### 5.4 Emergency and Safety Layer
- predictive alert banner in high-risk scenarios
- voice alert option for immediate warning
- SOS overlay with one-tap calling links:
  - Ambulance 108
  - Police 100
  - Fire 101
- nearest hospitals and police shown on map with clustering
- nearest ambulance stations, towing assistance, puncture repair, and showrooms shown with category filters

### 5.5 Reliability and Evaluation Fit
- reliability: app includes fallback weather, resilient API handling, and offline cache layer
- data accuracy: contacts are fetched live from OpenStreetMap/Overpass around origin, destination, and route midpoint
- number of contacts fetched: shown in analytics and map-side counters
- offline functionality: service worker and cached shell continue core access in low-network mode
- innovation: predictive risk timeline + quantified safer-route impact score
- cross-country information integration: route scope supports India mode and global mode

## 6. Assumptions
- free public APIs may have occasional rate limits
- OSRM may not always provide alternatives for all trips
- traffic data is simulated for hackathon demo mode
- hotspot incidents are dummy/generated for demonstration
- weather API is optional; app works with fallback logic

## 7. Real-World Relevance and Innovation
- prevention-first safety approach
- India-specific emergency integration
- unified interface for prediction + routing + SOS
- lightweight, deployable, and practical for daily commuters

## 8. Working Status
The project is fully working frontend application.

Run commands:
- npm install
- npm run dev
- npm run build

Deployment:
- Vercel or Netlify without backend setup

## 9. Conclusion
RiskPath demonstrates how contextual AI and mapping can proactively reduce road risk exposure and improve emergency readiness. It is built as a deployable and demo-ready system aligned with hackathon evaluation focus: AI usage, real-world impact, innovation, and working prototype.
