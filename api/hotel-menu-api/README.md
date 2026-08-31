# Hotel Digital Menu — Backend API

Single backend serving all **3 independently-deployed frontends**:

| Site | Talks to |
|---|---|
| Public website (`hotelname.com`) | `GET /api/public/hotel` |
| Guest menu app (`menu.hotelname.com`) | `/api/public/*` |
| Admin panel (`admin.hotelname.com`) | `/api/admin/*` (JWT auth) |

Each frontend is a separate repo/deployment. This API is the only thing they share — configure `ALLOWED_ORIGINS` with all three production URLs once deployed.

Stack: **Express + PostgreSQL + Prisma + Socket.io + JWT**.

---

## 1. Setup

```bash
npm install
cp .env.example .env
# edit .env: set DATABASE_URL to your Postgres instance, set JWT_SECRET

npx prisma migrate dev --name init   # creates tables
npm run seed                         # creates a sample hotel, owner login, menu, tables
npm run dev                          # starts on http://localhost:4000
```

The seed script prints the owner login and a sample table QR token — use those to log into the admin panel and test the guest flow immediately.

Postgres options: run locally, use Supabase, Railway, or Neon — anything that gives you a `DATABASE_URL`.

---

## 2. Deployment notes

- Deploy this API anywhere that runs Node (Railway, Render, Fly.io, a VPS). Vercel serverless is a poor fit because of the persistent Socket.io connection — use a platform with long-running processes.
- Point `api.hotelname.com` at this service.
- Set `ALLOWED_ORIGINS` to the 3 production frontend URLs (comma-separated).
- Set `MENU_APP_BASE_URL` (used when generating QR codes) to your live menu subdomain.
- Swap local disk uploads (`/uploads`) for S3 or Supabase Storage before going to production — local disk doesn't survive redeploys on most PaaS platforms. The upload controller (`src/controllers/uploadController.js`) is the only place you'd need to change.
- Run `npx prisma migrate deploy` (not `migrate dev`) in production/CI.

---

## 3. Real-time order flow (Socket.io)

This is the core UX: guest submits → kitchen queue lights up → chef accepts → guest sees live confirmation.

**Server → client events**
- `order:new` — emitted to the `kitchen` room when a guest submits an order
- `order:updated` — emitted to `kitchen` AND to `order:{orderId}` whenever status changes (accepted/ready/served/cancelled)

**Client → server events**
- `kitchen:join` — admin panel calls this once connected, to receive the live queue
- `order:track` — menu app calls this with the order id right after submitting, to receive status pushes for just that order
- `order:untrack` — call when leaving the tracking screen

**Admin panel example:**
```js
import { io } from "socket.io-client";
const socket = io(import.meta.env.VITE_API_BASE_URL);
socket.emit("kitchen:join");
socket.on("order:new", (order) => { /* add to New Orders column */ });
socket.on("order:updated", (order) => { /* move card between columns */ });
```

**Menu app example:**
```js
const socket = io(import.meta.env.VITE_API_BASE_URL);
socket.emit("order:track", orderId);
socket.on("order:updated", (order) => { /* update the stepper UI */ });
```

Order status machine: `PENDING → ACCEPTED → READY → SERVED` (or `→ CANCELLED` from PENDING/ACCEPTED). Enforced server-side in `orderController.updateOrderStatus` — invalid jumps are rejected with 400.

---

## 4. API reference

Base URL: `http://localhost:4000` (dev) — all responses are `{ success, data }` or `{ success: false, message }`.

### Public (guest menu app + public website) — no auth

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/public/hotel` | Hotel profile + theme (branding, colors, logo) |
| GET | `/api/public/menu` | Full menu tree (categories → items → customizations), available items only |
| GET | `/api/public/tables/:qrToken` | Resolve a scanned QR token → table number + hotel |
| POST | `/api/public/orders` | Submit an order (see body shape below) |
| GET | `/api/public/orders/:id?guestSessionId=` | Poll an order's current status |

**POST `/api/public/orders` body:**
```json
{
  "tableId": "uuid",
  "notes": "Window seat, celebrating a birthday",
  "items": [
    {
      "menuItemId": "uuid",
      "quantity": 2,
      "itemNotes": "no onions",
      "optionIds": ["uuid-of-spice-level-option"]
    }
  ]
}
```
Prices are always recalculated server-side from the DB — client-submitted prices are never trusted.

### Admin (admin panel) — JWT required except login

Send `Authorization: Bearer <token>` on every request after login.

| Method | Route | Role |
|---|---|---|
| POST | `/api/admin/auth/login` | — |
| GET | `/api/admin/auth/me` | any |
| GET/POST/PATCH | `/api/admin/auth/staff` | OWNER, MANAGER |
| GET/PATCH | `/api/admin/hotel` | any / OWNER,MANAGER |
| PUT | `/api/admin/hotel/theme` | OWNER, MANAGER |
| GET/POST/PATCH/DELETE | `/api/admin/menu/categories` | any / OWNER,MANAGER |
| GET/POST/PATCH/DELETE | `/api/admin/menu/items` | any / OWNER,MANAGER |
| PATCH | `/api/admin/menu/items/:id/availability` | any (fast 86/sold-out toggle) |
| GET/POST/DELETE | `/api/admin/tables` | any / OWNER,MANAGER |
| GET | `/api/admin/tables/:id/qrcode` | any (returns PNG data URL) |
| POST | `/api/admin/tables/:id/regenerate` | OWNER, MANAGER |
| GET | `/api/admin/orders?status=PENDING,ACCEPTED` | any |
| GET | `/api/admin/orders/stats/today` | any |
| PATCH | `/api/admin/orders/:id/status` | any — `{ "status": "ACCEPTED" }` |
| POST | `/api/admin/uploads` | any — multipart, field name `file` |

---

## 5. Project structure

```
src/
  app.js              Express app: middleware, CORS, routes
  server.js            Entry point: HTTP server + Socket.io
  routes/
    publicRoutes.js     /api/public/*
    adminRoutes.js       /api/admin/* (auth-gated)
  controllers/           Route handlers, one file per resource
  middleware/
    auth.js               JWT verification + role gating
    upload.js             Multer config
    errorHandler.js       Central error formatting
  sockets/
    index.js               Socket.io rooms + emit helpers
  utils/
    prisma.js               Prisma client singleton
    ApiError.js              Custom error class
    catchAsync.js            Async route wrapper
prisma/
  schema.prisma            Full data model
  seed.js                   Sample hotel + menu + tables
```

## 6. Data model notes

- **Single hotel per deployment** — this matches the "sold as a package" model (each hotel gets its own API instance), not multi-tenant SaaS. If you later want to host multiple hotels on one API, most queries already scope by `hotelId`; you'd mainly need to derive `hotelId` from a subdomain/slug instead of from the logged-in staff's own record.
- **Order pricing is always server-computed** from `MenuItem.price` + selected `CustomizationOption.priceDelta` at submit time — never trust client totals.
- **Order items snapshot name/price** at time of order, so editing a menu item later doesn't rewrite order history.
- **QR tokens are UUIDs**, not sequential table numbers — guessing another table's URL isn't feasible, and `regenerate` lets staff invalidate a compromised/lost QR code instantly.
