# Common Sense backend setup

Donta is integrated into `src/lib/donta`. This project requires **Neon from the start**; the generated local PGlite fallback has been disabled.

## Connect Neon

1. Create or select the intended Neon database and copy its Postgres connection string from the Connect dialog. Use a fresh database or review existing tables before applying these migrations, because Better Auth creates user, session, account, and verification tables.
2. Put the connection string in gitignored `.env.local` as `DATABASE_URL`. It must target `.neon.tech` and include `sslmode=require` or `sslmode=verify-full`. Do not put credentials in source control.
3. Keep the generated `BETTER_AUTH_SECRET`; set `BETTER_AUTH_URL` to the actual application origin, including its local port. Use a fresh random secret for a production deployment.
4. Set `CONTENT_MODE=prototype` to display the seeded sample drafts, or `CONTENT_MODE=published` to display only the public catalogue.

See `.env.example` for the environment variable names.

## Apply and seed

```sh
npm ci --legacy-peer-deps
npm run db:setup
npm run dev
```

`db:setup` runs reviewed SQL migrations, the idempotent seed, and a connection/data check. The seed contains **five sections and six sample drafts**, with actual review level 0. Example bars are separate from verification. No user accounts, sources, or review claims are fabricated. Existing rows are not overwritten.

Offline checks:

```sh
npm run db:seed -- --dry-run
npm run test:backend
npm run typecheck
npm run build
```

A successful build does not prove a Neon connection: builds deliberately avoid database access. `npm run db:verify` performs the live check. Missing credentials cause migration, seed, and runtime requests to fail rather than creating a local database.

## Authentication and contributions

Better Auth is mounted at `/api/auth/*`. New accounts default to contributor; role input is disabled in public sign-up. Server code uses `getAuth()`, `getSession()`, and `requireSession()`. The latter redirects to `/sign-in`, which still needs a UI. Email delivery, password reset, reviewer authorization, and moderation handlers remain future work.

The current Add info form is still a browser-local draft form. Its text says this explicitly. Creating a database table does not make this form submit to the server.

## Schema changes and deployment

Edit `src/lib/donta/schema.ts`, run `npm run donta:generate`, inspect the SQL in `drizzle-donta/`, and run `npm run donta:migrate`. The normal dev command never applies migrations automatically.

Deploy on the Node.js runtime with `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, and `CONTENT_MODE` set on the host. Run migrations as a release step. Keep `vendor/donta` committed.

## Connection timing

The runtime and migration configuration give Node dual-stack connection attempts 3 seconds instead of the short default. This prevents premature connection failures on higher-latency networks. The app and migration CLI use the `pg` driver with Drizzle over standard Postgres TLS. This preserves Donta’s schema/auth integration while avoiding the HTTP/WebSocket transports that proved intermittent on this network. No database URLs or passwords belong in logs.

On networks with unreliable DNS64/dual-stack routing, set `DATABASE_IPV4_ONLY=true` in `.env.local` to prefer IPv4 and disable Node family autoselection. This is an environment-specific workaround and is not required on every deployment.

The `dev` and `start` scripts use a small launcher that applies this local IPv4 preference before Next starts its server worker. No manual shell flags are needed.
