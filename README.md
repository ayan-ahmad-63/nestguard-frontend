# NestGuard Dashboard (Next.js)

Staff console for the NestGuard hostel access-control system: sign in (password or fingerprint), enrol residents,
watch live gate scans, review logs and alerts. Talks to the FastAPI backend (`nestguard-backend`).

## Run
```bash
npm install
cp .env.local.example .env.local      # set JWT_SECRET to the SAME value as the backend's JWT_SECRET
npm run dev                            # http://localhost:5000
```
Start the backend first (`uvicorn app.asgi:app --port 3000`), then open the dashboard.

## Phase-I scope
| Page | Status |
|---|---|
| Login (email/password and thumb login with the Live20R) | Phase-I, live |
| Dashboard (live scan feed), Access Logs, Security Alerts | Phase-I, live |
| Enrollment (enrol, update finger, edit, de-enrol) | Phase-I, live |
| Gates & Readers (gate list, live connection, recent scans) | Phase-I, live |
| Visitors, Analytics, Live Camera, Device Health | Phase-II preview (marked "P2", sample/incomplete data) |

The gate is verify-and-log: the reader shows VERIFIED or REJECTED, the guard opens the door. There is no lock control.

## Roles
Route access is enforced in `src/middleware.ts` from the signed JWT only (cookies like `ng_role` are never trusted):
Admin = every page, Warden = no Gates/Devices, Security = no Alerts/Analytics. The backend re-checks every API call.

## Stack
Next.js 16, React 19, TypeScript, Tailwind CSS 4, `socket.io-client`.

## Deploy to Cloudflare (CI/CD)
Pushing to `main` runs `.github/workflows/deploy.yml`: type-check, OpenNext build, deploy to Cloudflare Workers.

One-time setup:
1. `npm i -D @opennextjs/cloudflare wrangler` and commit the updated `package.json` + `package-lock.json`.
2. Cloudflare dashboard > My Profile > API Tokens > create a token from the "Edit Cloudflare Workers" template; copy your Account ID.
3. GitHub repo > Settings > Secrets and variables > Actions:
   - Secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `JWT_SECRET` (must equal the backend's `JWT_SECRET`)
   - Variables: `NEXT_PUBLIC_API_URL` (public HTTPS URL of the FastAPI backend), `NEXT_PUBLIC_MARKETING_URL`
4. On the backend set `CLIENT_URL` to the deployed `https://nestguard-frontend.<account>.workers.dev` URL so CORS and Socket.IO accept it.

Note: Next.js 16 `proxy.ts` is not yet supported by the Cloudflare adapter, so the route guard lives in `src/middleware.ts`.
