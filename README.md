# yhangry Bookings Dashboard

A small full-stack TypeScript app modelled on **yhangry** — a UK marketplace for booking
private chefs and catering at home. Customers browse chefs, get a live price quote for an
event, and book a chef for a date. This repo is an internal bookings dashboard for that
product.

## Stack

- **API** — Node + Express + TypeScript, Prisma ORM on SQLite, Zod for input validation,
  Vitest + Supertest for tests.
- **Web** — React 18 + Vite + TypeScript, React Router 6. Plain CSS, no UI library.
- **Monorepo** — pnpm workspaces (`apps/api`, `apps/web`).

## Architecture map

- **API routes** live in `apps/api/src/routes/` (chefs, quote, bookings), with pricing logic
  in `apps/api/src/services/` and the Express app wired up in `apps/api/src/app.ts`.
- **Prisma schema & seed** live in `apps/api/prisma/` (`schema.prisma`, `seed.ts`).
- **React pages** live in `apps/web/src/pages/` (BrowseChefs, ChefDetail, MyBookings), with
  shared components in `apps/web/src/components/` and the fetch client in `apps/web/src/api.ts`.
- The Vite dev server proxies `/api` → `http://localhost:4000`, so the web client just calls
  `/api/...`.

## Setup

Requires **Node 20+** and **pnpm** (`npm i -g pnpm`, or `corepack enable`). From the repo root,
run these three commands in order:

```bash
pnpm install       # install all workspace dependencies
pnpm bootstrap     # prisma generate + db push + seed the SQLite database
pnpm dev           # start API on :4000 and web on :5173 together
```

Then open http://localhost:5173 (if 5173 is busy, Vite picks the next free port — check the
`web` line in the console).

Other useful commands:

```bash
pnpm test          # run the API test suite (Vitest) — requires `pnpm bootstrap` first
pnpm typecheck     # typecheck both api and web
pnpm db:reset      # wipe and re-seed the database
```

The app simulates four logged-in customers. Use the **"Logged in as"** switcher in the header
to change which customer you are browsing as; My Bookings shows that customer's bookings.

## Reported issues / Your tasks

We've had a batch of reports from the team and from customers. These are described as the
symptoms people are seeing — your job is to investigate, find the cause, and fix what you can.
Treat them as a prioritised list; we do **not** expect you to finish everything in the time we
have. Please narrate your thinking as you go — how you reproduce, how you locate the cause, and
why you choose a fix — that's what we're most interested in.

Some of these are reproduced by **failing tests** — run `pnpm test` and you'll see a handful of red
tests that pin the expected behaviour; that's a good place to start, and the suite going green tells
you they're fixed. Others won't show up as a failing test (a display glitch, a performance smell) —
you'll find those by **using the app** and **watching the API server logs**.

Roughly in priority order:

1. **A customer reported being able to see another customer's booking by changing the URL.**
   Logged in as one customer, they were able to view a booking that belongs to someone else.
   This is a privacy/security concern, so it's top of the list.

2. **Quote totals look far too high for small parties.** Customers booking for a small number
   of guests say the quoted price comes out much higher than expected. Larger bookings seem to
   look fine.

3. **The first few chefs never appear in the listing.** On the Browse page, the chefs at the
   very start of the list seem to be missing, and the last page sometimes comes back empty.

4. **The chef listing makes far more database queries than it should, and it gets worse as we
   add more chefs.** It's noisier against the database than it needs to be. Take a look at what
   the database is actually doing when the list loads.

5. **Event dates display the wrong month.** On My Bookings, the month shown for each event is
   off — a booking we know is in July shows up as June, and so on.

### Feature

6. **Add availability so a chef can't be double-booked on the same date.** Right now the system
   will happily confirm a second booking for the same chef on a date they're already booked.
   Add availability handling so a clashing booking is rejected with a clear error, and surface
   this in the booking UI. There's at least one existing confirmed booking in the seed data you
   can use to reproduce the clash. If you have time, we'd love to hear how you'd make this robust
   under real concurrent traffic.
