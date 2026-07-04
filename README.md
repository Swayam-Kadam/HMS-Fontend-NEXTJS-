# Apollo Hospital Management System

Next.js 16 frontend for a hospital management platform with a BFF auth layer, public marketing pages, patient portal, and admin dashboard.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **TanStack Query** — client API data (profile, admin, appointments)
- **Context + middleware** — auth session and route protection
- **Express backend** — REST API (`NEXT_PUBLIC_API_URL`)

## Getting started

1. Copy environment variables:

```bash
cp .env.example .env.local
```

2. Install dependencies and run:

```bash
npm install
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |

## Architecture

- **Public pages** (`/`, `/doctors`, `/details`, …) — ISR server fetch for SEO
- **Auth** — HttpOnly cookies via `/api/auth/*` and `/api/proxy/*` (see [docs/AUTH_SYSTEM.md](docs/AUTH_SYSTEM.md))
- **Client API data** — TanStack Query for profile, admin, appointments (see [docs/TANSTACK_QUERY.md](docs/TANSTACK_QUERY.md))
- **Protected routes** — middleware + `routes.config.ts`
- **SEO** — `robots.ts`, `sitemap.ts`, Open Graph metadata

## Project structure

```
src/
  app/           # Routes, layouts, API routes
  components/    # UI and feature components
  hooks/         # TanStack Query hooks, auth helpers
  lib/           # Auth, metadata, server fetchers
  services/      # API client modules
  conf/          # Env and route config
  middleware.ts  # Edge route guards
```
