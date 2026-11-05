# Common Sense

A simple, Nigeria-first information platform. This first version is a UI prototype, built with Next.js App Router, React, TypeScript, plain CSS, and Lucide icons.

## Run locally

```sh
npm install
npm run dev
```

Open http://localhost:3000. `npm run build` checks the production build; `npm run typecheck` checks TypeScript.

## Technical decisions

- `src/app/page.tsx` and `layout.tsx` are server components. The site shell and metadata do not need browser state.
- `src/components/information-browser.tsx` is a client component for search, category filters, sorting, dialogs, and the draft form. Its initial content is still pre-rendered by Next.js.
- `src/lib/information.ts` contains typed fixtures passed into the browser component. This can later be replaced by server-side database reads without changing the card data contract.
- `src/app/globals.css` uses CSS variables and responsive grids. No UI framework, global state library, or remote font requests are needed for this small interface.
- Native `dialog` provides modal focus management and Escape support. Search and category filtering run locally on the small sample collection.
- Drafts are saved only to this browser's local storage. No submission API, account system, moderation queue, or publishing backend exists yet. Successful saving is explicitly described as local.
- All card content and review bars are illustrative. Health guidance, emergency numbers, live news, sources, and editorial review are not represented as verified. Search engine indexing is disabled for the prototype.

## Next steps

Agree on the content schema and editorial standards before adding a database. Real records should include source URLs, geographic scope, review status, reviewer, checked-at date, and next review date. Public search should return approved content only. Contributions should enter a separate moderation queue; review levels must be assigned server-side.

## UI refinement

The direction is a public reference shelf: direct, calm, and readable. The existing neutral surfaces and Nigerian green accent stay. Information cards carry the content; the four review bars are the signature detail.

The refinement removes the oversized introduction, generic slogans, multicoloured category badges, decorative icons, and small captions. A compact search area brings the guides higher on the page. Guide titles name the actual topic. Spacing follows a 4px rhythm, captions start at 12px, controls have visible focus states, and motion is limited to colour feedback with reduced-motion support. No generated images or remote fonts are needed.

Design workflow credit: [Unslop](https://github.com/heydamir/unslop) by [Damir Sokolovsky (@heydamir)](https://x.com/heydamir), used under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
# commonsense
