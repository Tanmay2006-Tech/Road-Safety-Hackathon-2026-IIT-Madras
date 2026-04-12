# Vercel Deployment for Stage-1 Submission

Use this when you want to share a live link along with your Stage-1 files.

## Fastest Method (GitHub + Vercel)

1. Push project to GitHub.
2. Open Vercel dashboard and click Add New Project.
3. Import your repository.
4. Confirm settings:
   - Framework preset: Vite
   - Build command: npm run build
   - Output directory: dist
5. Add environment variable only if needed:
   - VITE_OPENWEATHER_API_KEY = your_key
6. Click Deploy.
7. Copy the production URL and submit it as optional live link.

## CLI Method (if you prefer terminal)

1. Install Vercel CLI globally:
   npm i -g vercel
2. Login:
   vercel login
3. Deploy preview:
   vercel
4. Deploy production:
   vercel --prod

## Suggested link note for judges

"Live deployment link (optional): This static frontend demonstrates RiskPath features and RoadSoS compliance checks."

## Important

- Keep .env out of uploads and repo.
- If weather key is absent, app still works with fallback weather logic.
- Build has already been validated locally with npm run build.
