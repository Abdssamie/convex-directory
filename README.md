# ConvexZen

A production-grade SaaS starter with Convex, TanStack Start, and Cloudflare deployment.

## Stack

- **Convex** – Realtime backend (database, auth, functions, scheduled jobs)
- **TanStack Start** – Full-stack React with SSR
- **Cloudflare** – Edge deployment via Alchemy
- **Better Auth** – Authentication
- **Polar** – Billing & subscriptions
- **TailwindCSS** – Styling
- **shadcn/ui** – Component primitives
- **Brevo** – Email marketing

## Project Structure

```
convex-zen/
├── apps/web/           # Frontend (TanStack Start)
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

# Setup Convex
pnpm run dev:setup

# Copy env vars
cp packages/backend/.env.local.example apps/web/.env.local
cp packages/backend/.env.convex.example packages/backend/.env.convex
cp apps/web/.env.example apps/web/.env.local

# Dev
pnpm run dev
```

Open [http://localhost:3001](http://localhost:3001)

## Deployment

```bash
# Dev server
cd apps/web && pnpm run alchemy dev

# Deploy to Cloudflare
pnpm run deploy
```

## Scripts

| Command              | Description      |
| -------------------- | ---------------- |
| `pnpm run dev`       | Start all apps   |
| `pnpm run build`     | Build all        |
| `pnpm run typecheck` | Type check       |
| `pnpm run lint`      | Lint & format    |
| `pnpm run dev:setup` | Configure Convex |
