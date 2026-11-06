import { resolveDatabase } from "./env.mjs";
import { loadEnvFiles } from "./load-env.mjs";
import { mkdirSync } from "node:fs";
//#region src/drizzle-config.ts
/**
* drizzle-kit config that targets the same database as `createDb`: Neon when
* DATABASE_URL is set (from the environment or .env files), PGlite otherwise.
*/
function defineConfig({ schema, out = "./drizzle" }) {
	loadEnvFiles();
	const database = resolveDatabase();
	if (database.kind === "neon") return {
		dialect: "postgresql",
		schema,
		out,
		dbCredentials: { url: database.url }
	};
	mkdirSync(database.dir, { recursive: true });
	return {
		dialect: "postgresql",
		driver: "pglite",
		schema,
		out,
		dbCredentials: { url: database.dir }
	};
}
//#endregion
export { defineConfig };
