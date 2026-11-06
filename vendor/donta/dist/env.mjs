//#region src/env.ts
/** Where local PGlite keeps its data when DATABASE_URL is unset. */
const PGLITE_DIR = ".donta/pglite";
/**
* Decides which database to use. This is the only place the choice is made,
* so the app (`donta/db`) and drizzle-kit (`donta/drizzle-config`) always agree:
* Neon when DATABASE_URL is set, otherwise local PGlite.
*/
function resolveDatabase(env = process.env) {
	const url = env.DATABASE_URL?.trim();
	return url ? {
		kind: "neon",
		url
	} : {
		kind: "pglite",
		dir: PGLITE_DIR
	};
}
//#endregion
export { PGLITE_DIR, resolveDatabase };
