# ConvexZen

A production-grade SaaS starter built for minimal budget. Zero vendor lock-in, free tiers where possible, paid upgrades only when you bill customers.

## Why This Stack?

Most SaaS starters cost $50+/month before you make a single dollar. This one is designed to run $0 until you're ready to charge:

| Service       | This Stack  | Alternatives       | Why It Wins                                       |
| :------------ | :---------- | :----------------- | :------------------------------------------------ |
| **Hosting**   | Cloudflare  | Vercel, Netlify    | Unlimited bandwidth and global edge performance.  |
| **Database**  | Convex      | Supabase, Firebase | End-to-end TypeScript safety with real-time sync. |
| **Email**        | Brevo       | Resend, SendGrid   | Highest free daily sending limit (300/day).       |
| **Localization** | Intlayer    | i18next, next-intl | Type-safe, natively framework-agnostic.           |
| **Payments**     | Polar       | Stripe             | Acts as Merchant of Record; handles global taxes. |

**Total cost to launch: $0** (all free tiers are generous enough for an MVP)

## Stack

- **Convex** – Realtime backend with database, auth, functions, scheduled jobs. Free tier: 1M row writes/month
- **TanStack Start** – Full-stack React with SSR and streaming
- **Cloudflare Workers** – Edge deployment via Wrangler. Free: 100k requests/day on Workers
- **Better Auth** – Open-source auth that works with Convex. No vendor lock-in
- **Polar** – Developer-friendly payments. 0% until $1k, then 5%
- **Brevo** – Email marketing. Free: 300 emails/day
- **Intlayer** – Complete i18n and localization for the entire stack
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
├── project.config.json # Project-specific deploy settings
├── scripts/            # Boilerplate maintenance and deploy helpers
```

## Deployment Model

This boilerplate uses one deploy path:

- **GitHub Actions** deploys both **Convex** and **Cloudflare Workers**
- **Wrangler** deploys the web app
- **Convex CLI** deploys the backend
- **Cloudflare dashboard Git builds should stay disabled**

This avoids frontend/backend drift and keeps deploy behavior predictable across new projects.

## Environment Variables

This project uses environment variables across the backend and frontend.

### 1. Convex Backend (Cloud)
Variables in `packages/backend/.env.convex.example` must be set in your Convex Dashboard (Settings > Environment Variables) or via CLI:
```bash
npx convex env set NAME VALUE
```
These are required for Auth (`SITE_URL`, `AUTH_TRUSTED_ORIGINS`), Email (Brevo), Storage (R2), and Payments (Polar).

> **Note:** For local development, set both `SITE_URL` and `AUTH_TRUSTED_ORIGINS` to `http://localhost:3001` in the Convex Dashboard.

### 2. Frontend (Local)
Vite requires `VITE_CONVEX_URL`. When you run `npx convex dev`, it creates a `.env.local` in `packages/backend/`. You **must** sync this to the frontend:
- Copy `CONVEX_URL` from `packages/backend/.env.local`
- Paste into `apps/web/.env.local` as `VITE_CONVEX_URL`

## Quick Start

```bash
# Install
pnpm install

# Setup Convex (creates project, generates keys)
cd packages/backend && npx convex dev

# Sync Environment Variables
# 1. Set variables from .env.convex.example in Convex Dashboard
# 2. Copy CONVEX_URL from packages/backend/.env.local to apps/web/.env.local as VITE_CONVEX_URL

# Dev
pnpm run dev
```

Open [http://localhost:3001](http://localhost:3001)

## Deployment

```bash
# Sync generated deploy config from project.config.json
pnpm run sync:project-config

# Validate deploy prerequisites
pnpm run doctor:deploy

# Deploy Convex + Cloudflare
pnpm run deploy

# Clean up
pnpm run destroy
```

## New Project Checklist

When turning this boilerplate into a new app, update **one file first**:

- [project.config.json](/home/abdssamie/Projects/convex-zen/project.config.json:1)

Change:

- `projectName`
- `workerName`
- `productionUrl`
- Cloudflare compatibility settings if needed

Then run:

```bash
pnpm run sync:project-config
```

That regenerates:

- [apps/web/wrangler.jsonc](/home/abdssamie/Projects/convex-zen/apps/web/wrangler.jsonc:1)

## Required GitHub Secrets

GitHub Actions expects these repository secrets:

- `CONVEX_DEPLOY_KEY`
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `SITE_URL`
- `VITE_CONVEX_URL`
- `VITE_CONVEX_SITE_URL`

## Required Convex Production Env

These must be set in the **Convex dashboard** for production auth to work:

- `SITE_URL`
- `AUTH_TRUSTED_ORIGINS`

For this repository, both should point at the production Workers URL.

## Deploy Doctor

Run:

```bash
pnpm run doctor:deploy
```

It checks:

- required CI env vars exist
- `SITE_URL` matches `project.config.json`
- `apps/web/wrangler.jsonc` is synced with `project.config.json`
- frontend Convex URLs are present for the build

## Boilerplate Rules

- Keep **GitHub Actions** as the only production deploy path
- Keep **Cloudflare Git auto-builds disabled**
- Keep project-specific deploy naming in `project.config.json`
- Regenerate `apps/web/wrangler.jsonc` after changing project config
- Manage Convex auth origins separately from Cloudflare Worker vars

## Scripts

| Command                        | Description                                    |
| ------------------------------ | ---------------------------------------------- |
| `pnpm run dev`                 | Start frontend and Convex dev server           |
| `pnpm run build`               | Build all packages                             |
| `pnpm run typecheck`           | Type check the main app packages               |
| `pnpm run lint`                | Lint and format source files                   |
| `pnpm run dev:setup`           | Configure Convex project                       |
| `pnpm run sync:project-config` | Regenerate Wrangler config from project config |
| `pnpm run doctor:deploy`       | Validate deploy prerequisites                  |
| `pnpm run deploy`              | Deploy Convex backend, then Cloudflare web     |
| `pnpm run destroy`             | Delete the Cloudflare Worker                   |

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
- Complete i18n & Localization with Intlayer
