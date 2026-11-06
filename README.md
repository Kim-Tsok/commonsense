# Common Sense

A simple, Nigeria-first information platform. Built with Next.js App Router, React, TypeScript, plain CSS, and Lucide icons. Donta provides the backend foundation with Neon Postgres, Drizzle, and Better Auth.

## Run locally

```sh
npm ci --legacy-peer-deps
# Configure .env.local with your Neon connection; see DONTA_SETUP.md
npm run db:setup
npm run dev
```

Open http://localhost:3000. `npm run build` checks the production build; `npm run typecheck` checks TypeScript; `npm run test:backend` tests Neon configuration and the no-local-fallback requirement.

## Technical decisions

- `src/app/page.tsx` and `layout.tsx` are server components. The site shell and metadata do not need browser state.
- `src/components/information-browser.tsx` is a client component for search, category filters, sorting, dialogs, and the draft form. Its initial content is still pre-rendered by Next.js.
- `src/lib/content.ts` reads information and sources from Neon on the server. `src/lib/information.ts` supplies types and seed fixtures; the page no longer reads its cards directly from fixtures.
- `src/app/globals.css` uses CSS variables and responsive grids. No UI framework, global state library, or remote font requests are needed for this small interface.
- Native `dialog` provides modal focus management and Escape support. Search and category filtering run locally on the small sample collection.
- The public Add info form still saves browser-local drafts. Database tables and auth routes are prepared, but contributor sign-in UI, server submission handlers, and reviewer tools are not implemented yet.
- All card content and review bars are illustrative. Health guidance, emergency numbers, live news, sources, and editorial review are not represented as verified. Search engine indexing is disabled for the prototype.

## Next steps

Configure Neon, apply migrations, and run the idempotent seed using the instructions in [DONTA_SETUP.md](DONTA_SETUP.md). Then build contributor sign-in and server submission handlers, reviewer permissions, moderation tools, and publication workflows. Review levels must be assigned server-side, and health information needs qualified editorial review.

## UI refinement

The direction is a public reference shelf: direct, calm, and readable. The existing neutral surfaces and Nigerian green accent stay. Information cards carry the content; the four review bars are the signature detail.

The refinement removes the oversized introduction, generic slogans, multicoloured category badges, decorative icons, and small captions. A compact search area brings the guides higher on the page. Guide titles name the actual topic. Spacing follows a 4px rhythm, captions start at 12px, controls have visible focus states, and motion is limited to colour feedback with reduced-motion support. No generated images or remote fonts are needed.

Design workflow credit: [Unslop](https://github.com/heydamir/unslop) by [Damir Sokolovsky (@heydamir)](https://x.com/heydamir), used under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

# commonsense

## Database and seed

Neon is required in all environments. Missing credentials never start PGlite. Donta's vendored runtime remains in the repository; its generated schema and auth modules use a standard `pg` connection pool with Drizzle. The app and migration CLI both connect directly to Neon over TLS, avoiding unreliable HTTP/WebSocket connections on this development network. Builds do not connect to a database. Actual requests, migrations, and seed operations require `DATABASE_URL`. Secrets belong in gitignored `.env.local` or deployment environment settings.

Tables cover categories, information, sources, source links, submissions, reviews, and Better Auth's user/session/account/verification records. Constraints bound review levels, preserve referential integrity, and require review metadata before publication. A Postgres full-text index is ready for future server search; the small prototype collection is still filtered in the browser.

`npm run db:setup` applies migrations, seeds five categories and six existing sample guides, then verifies the connection and seed. Samples are stored as drafts at review level 0; their example bars live in a separate `preview_level` field. The seed does not invent sources, reviewers, user accounts, or verification claims. Re-running it inserts only missing records and does not overwrite edits.

`CONTENT_MODE=prototype` explicitly displays those sample drafts. Use `CONTENT_MODE=published` for the public catalogue: only non-sample published records with sources and a review date in the future are returned. With only the initial seed, that catalogue will be empty.

Preview the seed without connecting: `npm run db:seed -- --dry-run`. After schema edits: `npm run donta:generate`, inspect the SQL in `drizzle-donta/`, then apply it with `npm run donta:migrate`. Runtime data lives only in Neon.
