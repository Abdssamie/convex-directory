# ConvexZen

A production-grade SaaS starter built for minimal budget. Zero vendor lock-in, free tiers where possible, paid upgrades only when you bill customers.

## Why This Stack?

Most SaaS starters cost $50+/month before you make a single dollar. This one is designed to run $0 until you're ready to charge:

| Service       | This Stack              | Alternatives                  |
| ------------- | ----------------------- | ----------------------------- |
| Hosting       | Cloudflare (free)       | Vercel $20+, AWS $50+         |
| Database+Auth | Convex (free tier)      | Supabase $25+, Firebase $25+  |
| Email         | Brevo (free 300/day)    | SendGrid $15+, Mailgun $35+   |
| Analytics     | Convalytics (free)      | Mixpanel $75+, Amplitude $70+ |
| Payments      | Polar (0% on first $1k) | Stripe 2.9%+                  |

Total cost to launch: **$0** (all free tiers are generous enough for an MVP)

## Stack

- **Convex** – Realtime backend with database, auth, functions, scheduled jobs. Free tier: 1M row writes/month
- **TanStack Start** – Full-stack React with SSR and streaming
- **Cloudflare** – Edge deployment via Alchemy. Free: 100k requests/day on Workers
- **Better Auth** – Open-source auth that works with Convex. No vendor lock-in
- **Polar** – Developer-friendly payments, 0% platform fee until $1k (then 5%). Stripe alternative
- **Brevo** – Email marketing. Free: 300 emails/day, unlimited contacts
- **Convalytics** – Privacy-first analytics. No cookie banner needed. Free tier included
- **TailwindCSS** – Styling
- **shadcn/ui** – Component primitives in shared package

## Project Structure

```
convex-zen/
├── apps/web/           # Frontend (TanStack Start, React)
├── packages/
│   ├── backend/       # Convex functions & schema
│   ├── ui/            # Shared shadcn components
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
