# Convex Backend

This package contains the Convex schema and functions for the directory.

## Environment Variables

Copy `.env.convex.example` to the Convex Dashboard (Settings > Environment Variables).

| Key                  | Description                                                                           |
| -------------------- | ------------------------------------------------------------------------------------- |
| `ADMIN_EMAIL`        | The email address of the project owner (you). Only this user can approve submissions. |
| `BETTER_AUTH_SECRET` | Secret for Better Auth session signing.                                               |
| `R2_PUBLIC_BASE_URL` | Public base URL for R2 assets, e.g. `https://media.yourdomain.com`.                   |
| `SITE_URL`           | The URL of your web frontend (e.g., http://localhost:3001).                           |

## Storage (R2)

Set R2 credentials in Convex dashboard for uploads.

If you want stable public asset URLs for screenshots and logos, also set `R2_PUBLIC_BASE_URL` to
the public bucket domain you expose from Cloudflare R2.

## Payments (Polar)

Set Polar tokens and sandbox server for subscription handling.
