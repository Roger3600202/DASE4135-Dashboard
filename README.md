# Brick Quality Dashboard

Realtime dashboard for monitoring brick quality checks. The backend is ready to plug in a Supabase project that stores counts from the vision system; the frontend renders the live defect rate with mock data until Supabase credentials are supplied.

## Project layout
- `backend/` — Express API that reads the latest metrics from Supabase (or serves mock data) and exposes `/api/metrics` plus `/api/metrics/history`.
- `frontend/` — Vite + React single-page dashboard that polls the API every few seconds and visualizes throughput, defects, and trend.

## Prerequisites
- Node.js 18+ recommended.
- Supabase project (URL + service role key) once available.

## Backend setup
1) Copy `backend/.env.example` to `backend/.env` and fill in:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:4173
PORT=4000
```
2) Install and run:
```
cd backend
npm install
npm run dev   # or `npm start`
```
3) API endpoints (default `http://localhost:4000`):
   - `GET /api/metrics` → `{ totalBricks, defectCount, goodCount, defectRate, capturedAt, source }`
   - `GET /api/metrics/history?limit=48` → `{ data: [...], source }` (oldest-first entries)
   - `GET /health` → uptime info

### Expected Supabase table
The backend queries `brick_quality_events`:
```
captured_at    timestamp   default now()
total_bricks   int         not null
defect_count   int         not null
```
Rows should represent the latest aggregate from the vision system (e.g., per minute). The backend computes `goodCount` and `defectRate` on the fly. If Supabase credentials are missing, the API serves deterministic mock data so the UI still works.

## Frontend setup (Next.js)
1) Copy `frontend/.env.example` to `frontend/.env` and set `NEXT_PUBLIC_API_BASE_URL` to the backend URL (default `http://localhost:4000`).
2) Install and run:
```
cd frontend
npm install
npm run dev
```
The app opens on `http://localhost:3000` (Next.js dev). It polls the backend every ~4s. Cards show totals and defect rate; the chart plots recent history. For a production build, use `npm run build` then `npm start`.

## Connecting the vision system
- Insert rows into `brick_quality_events` with `total_bricks` and `defect_count` for each interval.
- The dashboard will auto-refresh once Supabase URL + service key are present in the backend `.env`.

## Notes / Next steps
- Add Supabase Realtime subscriptions if you want push updates instead of polling.
- Tighten CORS by setting `ALLOWED_ORIGINS` to your deployed frontend domain.
- Extend history endpoint if you need longer windows or location filters.
