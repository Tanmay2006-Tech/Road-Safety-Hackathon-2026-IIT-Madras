# RiskPath - Hackathon PPT Content (Strict 7 Slides)

Use exactly 7 slides.
Do not add slide 8.

## Slide 1 - Welcome
Title: RiskPath
Subtitle: Proactive Road Safety Intelligence for India
Team: Tanmay + Team Members
Tagline: Predict risk before accidents happen

Speaker points:
- We are solving road safety with AI-assisted prevention
- Focus is India-first usability and emergency readiness

## Slide 2 - Problem
Title: Why this matters

Road accidents in India often become fatal not only because of impact, but because of:
- Lack of real-time awareness of dangerous routes
- No system to predict accident risk before travel
- Delays in finding nearby emergency services
- Delays in the golden-hour response window
- Poor visibility in rain, fog, and night driving
- Fragmented access to hospitals, police, rescue

Speaker points:
- Most current systems are reactive
- We need proactive prevention + rapid response in one place

## Slide 3 - Solution
Title: RiskPath Solution

RiskPath is an AI-powered road safety platform that:
- predicts accident risk in real time
- visualizes dangerous route segments
- suggests safer alternative routes
- provides instant SOS support with location context
- fetches towing/puncture/showroom and emergency service access points
- supports India-focused mode and global mode

Speaker points:
- One unified platform for pre-trip risk and emergency readiness

## Slide 4 - Working
Title: How it works

Flow:
1. User enters start and destination
2. Route is fetched and split into segments
3. AI risk engine scores each segment using:
   - weather
   - day/night context
   - traffic simulation
   - hotspot proximity
4. App shows:
   - risk color map (green/yellow/red)
   - overall risk + confidence
   - safer route comparison
5. SOS and nearby emergency services are one tap away

RoadSoS-aligned coverage shown in demo:
- nearest police, hospital, ambulance services
- towing support, puncture repair, and showroom discovery
- low-network continuity via offline PWA mode
- global applicability by switching route scope

Live demo points:
- Toggle demo mode: rain, night, heavy traffic
- Risk updates instantly
- Voice warning triggers in high-risk zones

## Slide 5 - Tech Stack
Title: Technology Used

Frontend:
- React + Vite
- Tailwind CSS
- Leaflet + OpenStreetMap

APIs / Data:
- Nominatim (geocoding)
- OSRM (routing + alternatives)
- OpenWeather (weather context)
- Overpass API (hospitals/police)

AI / Logic:
- JavaScript risk scoring engine
- confidence and factor impact output

## Slide 6 - Results / Demo
Title: Results and Impact

What is working now:
- Full route risk analyzer with segment-level highlights
- Safer route suggestion and switch
- Predictive high-risk alert + voice alert
- SOS overlay with 108, 100, 101
- Dashboard + model lab + exportable safety reports
- Judge impact snapshot: quantified risk reduction vs ETA tradeoff
- Number of contacts fetched shown in analytics/map service counters

Expected impact:
- Better route decisions before travel
- Faster emergency response initiation
- Practical for urban commuters in India
- Robust behavior in low-network conditions (offline cache)

## Slide 7 - Thank You
Title: Thank You

Closing line:
RiskPath aims to reduce accidents through prevention-first intelligence.

Add:
- Team names
- Contact details
- QR to project demo if available

Speaker close:
- We are ready for questions and live demo.
