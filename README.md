# ConvexZen

A production-grade SaaS starter built for minimal budget. Zero vendor lock-in, free tiers where possible, paid upgrades only when you bill customers.

## Why This Stack?

Most SaaS starters cost $50+/month before you make a single dollar. This one is designed to run $0 until you're ready to charge:

| Service       | This Stack  | Alternatives       | Why It Wins                                       |
| :------------ | :---------- | :----------------- | :------------------------------------------------ | ---------------------------------------------------------------------------- |
| **Hosting**   | Cloudflare  | Vercel, Netlify    | Unlimited bandwidth and global edge performance.  |
| **Database**  | Convex      | Supabase, Firebase | End-to-end TypeScript safety with real-time sync. |
| **Email**     | Brevo       | Resend, SendGrid   | Highest free daily sending limit (300/day).       |
| **Analytics** | Convalytics | PostHog, Mixpanel  | Simple, privacy-focused, and stays free.          |
| **Payments**  | Polar       | Stripe             | Acts as Merchant of Record; handles global taxes. | Total cost to launch: **$0** (all free tiers are generous enough for an MVP) |

## Stack

- **Convex** – Realtime backend with database, auth, functions, scheduled jobs. Free tier: 1M row writes/month
- **TanStack Start** – Full-stack React with SSR and streaming
- **Cloudflare** – Edge deployment via Alchemy. Free: 100k requests/day on Workers
- **Better Auth** – Open-source auth that works with Convex. No vendor lock-in
- **Polar** – Developer-friendly payments. 0% until $1k, then 5%
- **Brevo** – Email marketing. Free: 300 emails/day
- **Convalytics** – Privacy-first web + product analytics
- **TailwindCSS** – Styling
- **TanStack Start** + **Convex** – Full-stack React with SSR, streaming, and realtime backend

## Project Structure

```
convex-zen/
├── apps/web/           # Frontend (TanStack Start, React)
├── packages/
│   ├── backend/       # Convex functions & schema
│   ├── ui/            # Shared UI components
│   ├── env/           # Environment types
│   └── config/        # Shared config
```

## Quick Start

```bash
# Install
pnpm install

# Setup Convex (creates project, generates keys)
pnpm run dev:setup

# Copy env examples
cp packages/backend/.env.local.example apps/web/.env.local
cp packages/backend/.env.convex.example packages/backend/.env.convex
cp apps/web/.env.example apps/web/.env.local

# Dev
pnpm run dev
```

Open [http://localhost:3001](http://localhost:3001)

## Deployment

```bash
# Dev server (Cloudflare)
cd apps/web && pnpm run alchemy dev

# Deploy
cd apps/web && pnpm run deploy

# Clean up
cd apps/web && pnpm run destroy
```

## Scripts

| Command              | Description              |
| -------------------- | ------------------------ |
| `pnpm run dev`       | Start all apps           |
| `pnpm run build`     | Build all                |
| `pnpm run typecheck` | Type check               |
| `pnpm run lint`      | Lint & format            |
| `pnpm run dev:setup` | Configure Convex project |

## Features Included

- Email/password authentication with Better Auth
- OAuth (Google, GitHub ready)
- Team-based multi-tenancy
- Role-based access control
- Subscription billing with Polar
- Email sequences via Brevo
- File uploads to Cloudflare R2
- SEO meta tags with Unhead
- Analytics with Convalytics
