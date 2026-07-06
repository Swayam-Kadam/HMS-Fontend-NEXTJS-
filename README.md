# Apollo Hospital Management System

A full-stack **Hospital Management System (HMS)** built with **Next.js 16** and an **Express** backend. The app includes a public hospital website, patient portal, and admin dashboard — with production-grade **BFF authentication**, **TanStack Query** for client data, and **SEO** optimizations.

**Live demo:** [https://hms-fontend-nextjs.vercel.app](https://hms-fontend-nextjs.vercel.app)

---

## Overview

This project demonstrates modern full-stack web development patterns used in industry:

- **Backend-for-Frontend (BFF)** auth with HttpOnly cookies (no JWT in `localStorage`)
- **Next.js App Router** with route groups, middleware, and API routes
- **TanStack Query** for cached client-side API state (profile, admin, appointments)
- **SSG** for the home, about, and contact pages; **ISR** for doctors and donations
- **Role-based access** — `user` (patient) and `admin` dashboards
- **Stripe** integration for appointment payments
- **Open Graph metadata**, `robots.txt`, and `sitemap.xml` for shareable URLs and SEO

---

## Features

### Public website (guest)

| Feature | Route |
|---------|-------|
| Home page with featured doctors | `/` |
| Browse doctors by department | `/doctors` |
| About hospital | `/details` |
| Blood & heart donor registry | `/donation` |
| Contact form | `/contact-us` |
| User registration & login | `/signup`, `/login` |

### Patient portal (authenticated user)

| Feature | Route |
|---------|-------|
| View & edit profile | `/profile` |
| Book appointment (with Stripe checkout) | `/appointment` |
| View / cancel / edit appointments | `/profile` (appointments tab) |
| Send messages & feedback to hospital | `/profile` (messages tab) |

### Admin dashboard (authenticated admin)

| Feature | Route |
|---------|-------|
| Analytics dashboard (charts & stats) | `/dashboard` |
| Add / manage doctors | `/add-doctor`, `/manage-doctor` |
| Manage registered users | `/manage-user` |
| Manage all appointments & update status | `/manage-appointment` |
| Reply to patient messages | `/user-messages` |
| View contact form submissions | `/contact-messages` |

---

## Tech stack

### Frontend

| Technology | Purpose |
|------------|---------|
| [Next.js 16](https://nextjs.org/) | App Router, SSR/ISR, API routes (BFF) |
| [React 19](https://react.dev/) | UI library |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [Tailwind CSS 4](https://tailwindcss.com/) | Styling |
| [TanStack Query v5](https://tanstack.com/query) | Server state, caching, mutations |
| [Axios](https://axios-http.com/) | HTTP client via `/api/proxy` |
| [Formik](https://formik.org/) + [Yup](https://github.com/jquense/yup) | Form validation |
| [Recharts](https://recharts.org/) | Admin dashboard charts |
| [Framer Motion](https://www.framer.com/motion/) | Login/signup animations |
| [Stripe.js](https://stripe.com/) | Appointment payment checkout |
| [Lucide React](https://lucide.dev/) | Icons |

### Backend (separate Express repo)

| Technology | Purpose |
|------------|---------|
| Node.js + Express | REST API |
| MongoDB | Database |
| JWT + refresh tokens | Auth (access 15 min, refresh 7 days) |

### DevOps & tooling

| Tool | Purpose |
|------|---------|
| Vercel | Frontend deployment |
| ESLint | Linting |
| React Compiler | Performance (Next.js config) |

---

## Architecture

```
Browser
   │
   ├── Public pages ──────────► Server Components + ISR (fetch on server)
   │
   ├── Login / Signup ────────► Next.js /api/auth/* (sets HttpOnly cookies)
   │
   └── Authenticated pages ───► TanStack Query → Axios → /api/proxy → Express API
                                      │
                               Middleware (route guard)
                               Auth Context (session UI)
```

| Concern | Implementation |
|---------|----------------|
| Public SEO data | ISR via `src/lib/server/fetch.ts` (`revalidate: 60`) |
| Auth session | HttpOnly cookies + `AuthProvider` (Context) |
| Client API data | TanStack Query hooks in `src/hooks/queries.ts` |
| Route protection | Edge middleware + `src/conf/routes.config.ts` |
| Social sharing | Open Graph, canonical URLs, `metadataBase` |
| Crawlers | `src/app/robots.ts`, `src/app/sitemap.ts` |

**Detailed docs:**

- [Authentication & BFF guide](docs/AUTH_SYSTEM.md)
- [TanStack Query & API integration guide](docs/TANSTACK_QUERY.md)

---

## Project structure

```
hospital_management_system/
├── src/
│   ├── app/
│   │   ├── (user)/          # Public + patient routes
│   │   ├── (admin)/         # Admin dashboard routes
│   │   ├── (auth)/          # Login & signup
│   │   └── api/
│   │       ├── auth/        # Login, logout, session, refresh
│   │       └── proxy/       # BFF proxy to Express API
│   ├── components/          # Feature UI (admin, profile, forms, …)
│   ├── hooks/
│   │   ├── queries.ts       # TanStack Query hooks
│   │   └── useAuthQueryEnabled.ts
│   ├── services/            # API modules (doctor, appointment, …)
│   ├── lib/                 # Auth, metadata, server fetchers
│   ├── conf/                # Env + route ACL config
│   └── middleware.ts        # Edge auth & redirects
├── docs/
│   ├── AUTH_SYSTEM.md
│   └── TANSTACK_QUERY.md
├── public/images/           # Static assets
├── .env.example
└── package.json
```

---

## Getting started

### Prerequisites

- Node.js 18+
- npm
- Express backend running (see backend repo / set `NEXT_PUBLIC_API_URL`)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/hospital_management_system.git
cd hospital_management_system
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

### Available scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 3000) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript type check |

---

## Environment variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Express backend base URL (e.g. `http://localhost:3001/api`) |
| `NEXT_PUBLIC_SITE_URL` | Public site URL for SEO, OG tags, sitemap |
| `NEXT_PUBLIC_COOKIE_PATH` | Cookie path (default `/`) |
| `NEXT_PUBLIC_COOKIE_DOMAIN` | Cookie domain |
| `NEXT_PUBLIC_COOKIE_EXPIRES` | Cookie expiry (days) |
| `NEXT_PUBLIC_REDIRECT_URL` | Fallback redirect URL |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key for payments |

---

## Rendering strategy

| Pages | Strategy | Why |
|-------|----------|-----|
| `/`, `/details`, `/contact-us` | **SSG** (static at build time) | Fast landing + about pages |
| `/doctors`, `/donation` | **ISR** (server fetch + 60s revalidate) | SEO + fresh public data |
| `/login`, `/signup` | **CSR** (client components) | Interactive forms |
| `/profile`, `/dashboard`, admin | **SSG shell + TanStack Query** | Auth-gated dynamic data |
| Auth API routes | **Server** (Route Handlers) | Secure cookie handling |

---

## Security highlights

- JWT stored in **HttpOnly cookies** — not accessible to JavaScript (XSS mitigation)
- All authenticated API calls go through **same-origin BFF proxy**
- **Access + refresh token** rotation with reuse detection (backend)
- **Middleware** blocks unauthenticated access to protected routes
- **Admin routes** require `admin` role
- Admin and private pages use `robots: noindex`

---

## Why this project stands out (for recruiters)

1. **Real auth pattern** — BFF + HttpOnly cookies, not tutorial-level `localStorage` JWT
2. **Clear separation of concerns** — services → hooks → components
3. **Modern data fetching** — TanStack Query instead of scattered `useEffect` fetches
4. **SEO-ready** — metadata, Open Graph, sitemap, robots.txt
5. **Scalable folder structure** — App Router route groups, centralized route config
6. **Documented architecture** — in-repo guides for auth and TanStack Query
7. **Full product scope** — public site + patient portal + admin CRUD + payments

---

## API integration flow

```
Component  →  useQuery / useMutation  →  service/*.ts  →  axios  →  /api/proxy  →  Express
```

Example: loading doctors on the admin page

1. `ManageDoctorContent` calls `useAdminDoctorsQuery(search)`
2. Hook runs `fetchDoctors()` from `doctorService.ts`
3. Axios sends `GET /api/proxy/doctor/` with auth cookie
4. Proxy forwards to Express with `auth-token` header
5. TanStack Query caches result; UI shows data or loading state

See [docs/TANSTACK_QUERY.md](docs/TANSTACK_QUERY.md) for the full step-by-step guide.

---

## Deployment

**Frontend:** Deploy to [Vercel](https://vercel.com) (recommended for Next.js)

1. Connect GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy — Vercel auto-detects Next.js

**Backend:** Deploy Express API separately (e.g. Render, Railway) and set `NEXT_PUBLIC_API_URL` to the production API URL.

