# Convex Backend

This package contains the Convex schema and functions for the directory.

## Environment Variables

Copy `.env.convex.example` to the Convex Dashboard (Settings > Environment Variables).

| Key                  | Description                                                                           |
| -------------------- | ------------------------------------------------------------------------------------- |
| `ADMIN_EMAIL`        | The email address of the project owner (you). Only this user can approve submissions. |
| `BETTER_AUTH_SECRET` | Secret for Better Auth session signing.                                               |
| `SITE_URL`           | The URL of your web frontend (e.g., http://localhost:3001).                           |

## Storage (R2)

Set R2 credentials in Convex dashboard for project image uploads.

## Payments (Polar)

Set Polar tokens and sandbox server for subscription handling.
