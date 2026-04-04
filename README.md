# parking-at-boulevard

Next.js dashboard for automated parking permit registration: monthly hour cap (LA timezone), event history, and a daily cron-driven registration (see **Cron** below for Hobby vs Pro).

## Setup

1. Copy `.env.example` to `.env.local` and set `MONGODB_URI`, `CRON_SECRET`, `DASHBOARD_PASSWORD`, and all `PARKING_*` values you use (URL pieces, Smart Decal number, plate, passcode, home, optional `PARKING_LOCATION_ID` / email, `PARKING_COOKIE` after login). Use `SKIP_PARKING_REGISTRATION=true` to test the app without calling the remote site. Set `PARKING_REQUIRE_FULL_FORM=false` if you are still wiring the HTTP flow and only want to validate URL params.

2. Run MongoDB locally or point `MONGODB_URI` at [MongoDB Atlas](https://www.mongodb.com/atlas).

3. `npm install` then `npm run dev` and open `/login`.

## Automation

- After a successful manual registration, open DevTools → **Network**, copy the **POST** request URL into `PARKING_POST_URL` (or `PARKING_POST_RELATIVE_PATH`). [`lib/register.ts`](lib/register.ts) GETs the permit page (optional `PARKING_SKIP_PAGE_GET=true` then POSTs JSON built in [`lib/parking-post.ts`](lib/parking-post.ts); override with `PARKING_POST_BODY_JSON` using `{{VEHICLE}}` placeholders).

- **Cron (Vercel Hobby):** [`vercel.json`](vercel.json) uses **`30 7 * * *`** — **once per day** at **07:30 UTC**. Los Angeles midnight lines up with **06:30 UTC** (PDT, UTC−7) or **07:30 UTC** (PST, UTC−8); this single cron matches **07:30 UTC** (PST). [`lib/schedule.ts`](lib/schedule.ts) accepts the matching LA wall times (including **23:30** in winter when the UTC instant falls on the previous local evening). Default `CRON_SCHEDULE_MODE` is **`hobby`**.

- **Cron (Vercel Pro):** set `CRON_SCHEDULE_MODE=pro` in env and replace the `crons[0].schedule` in `vercel.json` with a multi-minute pattern (e.g. `*/5 9-11 * * *`) so random target minutes work again.

- On Vercel, set `CRON_SECRET`; Vercel sends `Authorization: Bearer <CRON_SECRET>` to cron invocations.

## Scripts

| Command        | Description        |
| -------------- | ------------------ |
| `npm run dev`  | Development server |
| `npm run build`| Production build    |
| `npm run start`| Production server   |
| `npm run lint` | ESLint              |
| `npm test`     | Vitest (unit tests) |
| `npm run test:watch` | Vitest watch mode |

## Vercel

1. **Project → Settings → General → Build & Development Settings**
   - **Framework Preset:** **Next.js** (not “Other” or Create React App).
   - **Root Directory:** `./` (repo root).
   - **Build Command:** leave **empty** (uses `next build` from `package.json`).
   - **Output Directory:** leave **empty**. If you see `build` here, **delete it** — Next.js on Vercel does not use a `build` folder; a wrong value causes *No Output Directory named "build" found*.
   - **Install Command:** leave **empty** (default `npm install`), unless you know you need otherwise.

2. The repo [`vercel.json`](vercel.json) only defines **Cron**; it does not set `outputDirectory` or CRA-style paths.

3. Copy env vars from `.env.local` into **Settings → Environment Variables** (including Atlas `MONGODB_URI`). Leave `CRON_SCHEDULE_MODE` unset or `hobby` on Hobby; use `pro` only with Pro cron schedules.

### “Server error” / dashboard won’t load

- **Cause:** usually missing or invalid `MONGODB_URI` on Vercel, or Atlas blocking connections.
- **Fix:** use an **Atlas** `mongodb+srv://…` URI (not `127.0.0.1`), allow **Network Access** in Atlas, **Redeploy** after saving env vars.

## License

MIT
