# CLAUDE.md — yhangry Bookings Dashboard

Project guide for engineers (and Claude Code) working in this repo.

## Project overview

This is the internal **bookings dashboard** for yhangry, a UK marketplace for booking private
chefs and catering at home. Customers browse chefs, get a live price quote for an event, and
confirm a booking for a date. It is a small full-stack TypeScript app:

- `apps/api` — Express + Prisma (SQLite) JSON API on port **4000**.
- `apps/web` — React 18 + Vite single-page app on port **5173**.

It's a pnpm-workspaces monorepo; run everything from the repo root.

## Running and testing

```bash
pnpm install       # install all workspace dependencies
pnpm bootstrap     # prisma generate + db push + seed the database (run this once after install)
pnpm dev           # run api (:4000) and web (:5173) concurrently
```

The Vite dev server proxies `/api` → `http://localhost:4000`, so the web client calls `/api/...`
with no CORS setup needed (the API also enables `cors()` as a backup).

```bash
pnpm test          # API test suite (Vitest + Supertest against the Express app)
pnpm typecheck     # typecheck both api and web
pnpm db:reset      # delete the SQLite db and re-seed it from scratch
```

The tests run against the seeded SQLite database, so make sure `pnpm bootstrap` has been run at
least once before `pnpm test`. Tests import the Express `app` directly and do not bind a port.

You can also run a single workspace: `pnpm dev:api`, `pnpm dev:web`, or
`pnpm --filter @yhangry/api run test`.

## Where things live

```
apps/api/
  prisma/
    schema.prisma     # data model: Customer, Chef, Menu, Review, Booking
    seed.ts           # deterministic seed data (no randomness)
  src/
    db.ts             # Prisma client
    server.ts         # boots Express and listens on :4000
    app.ts            # builds the Express app and mounts routers
    types.ts          # API DTO types
    services/
      quoteService.ts # pricing / quote calculation
    routes/
      chefs.ts        # GET /api/chefs, GET /api/chefs/:id
      quote.ts        # POST /api/quote
      bookings.ts     # bookings CRUD
    __tests__/        # Vitest + Supertest tests

apps/web/
  src/
    main.tsx          # React root + router
    api.ts            # fetch client; sends x-customer-id; typed helpers
    types.ts          # shared response types
    format.ts         # formatMoney, formatEventDate
    styles.css        # all styling
    components/       # Header, ChefCard, Pagination
    pages/            # BrowseChefs, ChefDetail, MyBookings
```

## API surface

Base path `/api`. Inputs are validated with Zod (invalid body/params → `400`).

- `GET /api/chefs` — paginated chef list. Query: `cuisine?`, `location?`, `sort?`
  (`rating`|`price`, default `rating`), `page?` (1-indexed, default 1), `pageSize?` (default 6).
- `GET /api/chefs/:id` — full chef with menus and reviews.
- `POST /api/quote` — `{ chefId, menuId?, guestCount }` → a quote breakdown.
- `POST /api/bookings` — create a confirmed booking (pricing snapshot from quoteService).
- `GET /api/bookings` — the current customer's bookings.
- `GET /api/bookings/:id` — a single booking.
- `PATCH /api/bookings/:id/cancel` — cancel a booking.
- `GET /api/health` — `{ ok: true }`.

## Conventions

### Money is always integer pence

Every monetary value in the codebase — in the database, in API payloads, and in calculations —
is an **integer number of pence** (e.g. `£12.34` is stored and passed around as `1234`). Never
use floats for money. Convert to a human-readable string only at the very edge of the UI via
`formatMoney(pence)` in `apps/web/src/format.ts`. Field names that hold money end in `Pence`
(`pricePerHeadPence`, `subtotalPence`, `totalPence`, …) — keep that suffix when you add new ones.

### Pricing

A quote breakdown is computed in `apps/api/src/services/quoteService.ts` from the chef (or the
selected menu) and the guest count. It's made up of a per-head subtotal, a minimum-spend
adjustment, a 10% platform service fee, and a total — see `quoteService.ts` for the exact
calculation. All amounts are integer pence.

When a booking is created the breakdown is snapshotted onto the `Booking` row, so historical
bookings keep the price they were quoted.

### Auth simulation: `x-customer-id`

There is no real login. The "authenticated customer" is whichever id is sent in the
**`x-customer-id`** request header (an integer). The web app stores the active customer id in
`localStorage` and the header is set automatically by the fetch client in `apps/web/src/api.ts`;
the **"Logged in as"** switcher in the header changes it. Endpoints that are scoped to a customer
(their bookings) should derive the customer from this header. The four seeded customers have ids
`1`–`4`.

### Code style

- TypeScript strict mode is on across both apps. Keep `pnpm typecheck` green.
- Validate request input with Zod in the route handlers; return `400` on invalid input.
- React: function components and hooks; keep data-fetching in the page components and pass plain
  props to the presentational components in `components/`.
- Prefer small, readable functions and explicit return types on exported functions.

### Notes for working with Claude Code here

- Don't introduce a second money representation — keep everything in integer pence.
- After changing the schema, run `pnpm bootstrap` (or `pnpm db:reset`) to apply it and re-seed.
