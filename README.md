# parking-at-boulevard

Next.js dashboard for automated parking permit registration: monthly hour cap (LA timezone), event history, and a cron-driven run in the 2:00–2:55 LA window with a random target minute per day.

## Setup

1. Copy `.env.example` to `.env.local` and set `MONGODB_URI`, `CRON_SECRET`, `DASHBOARD_PASSWORD`, and all `PARKING_*` values you use (URL pieces, Smart Decal number, plate, passcode, home, optional `PARKING_LOCATION_ID` / email, `PARKING_COOKIE` after login). Use `SKIP_PARKING_REGISTRATION=true` to test the app without calling the remote site. Set `PARKING_REQUIRE_FULL_FORM=false` if you are still wiring the HTTP flow and only want to validate URL params.

2. Run MongoDB locally or point `MONGODB_URI` at [MongoDB Atlas](https://www.mongodb.com/atlas).

3. `npm install` then `npm run dev` and open `/login`.

## Automation

- After a successful manual registration, open DevTools → **Network**, copy the **POST** request URL into `PARKING_POST_URL` (or `PARKING_POST_RELATIVE_PATH`). [`lib/register.ts`](lib/register.ts) GETs the permit page (optional `PARKING_SKIP_PAGE_GET=true` then POSTs JSON built in [`lib/parking-post.ts`](lib/parking-post.ts); override with `PARKING_POST_BODY_JSON` using `{{VEHICLE}}` placeholders).

- Cron: [`vercel.json`](vercel.json) runs `GET /api/cron/register` every five minutes between **09:00–11:59 UTC**, which covers the Los Angeles 02:00–02:55 window year-round; the handler enforces LA time and random minute logic.

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

## License

MIT
