import { resolveDatabase } from "./env.mjs";
import { mkdirSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { drizzle as drizzle$1 } from "drizzle-orm/pglite";
//#region src/db.ts
const g = globalThis;
function pglite(dir) {
	g.__dontaPglite ??= /* @__PURE__ */ new Map();
	let client = g.__dontaPglite.get(dir);
	if (!client) {
		if (!dir.includes("://")) mkdirSync(dir, { recursive: true });
		client = new PGlite(dir);
		g.__dontaPglite.set(dir, client);
	}
	return client;
}
/**
* Creates the project's Drizzle client: Neon over HTTP when DATABASE_URL is
* set, local PGlite otherwise. It connects on first use rather than on import,
* so builds that load the module in several workers never open PGlite.
*/
function createDb({ schema, database = resolveDatabase() }) {
	let instance;
	const connect = () => database.kind === "neon" ? drizzle({
		client: neon(database.url),
		schema
	}) : drizzle$1({
		client: pglite(database.dir),
		schema
	});
	return {
		db: new Proxy({}, { get(_, prop) {
			instance ??= connect();
			const value = Reflect.get(instance, prop, instance);
			return typeof value === "function" ? value.bind(instance) : value;
		} }),
		driver: database.kind
	};
}
//#endregion
export { createDb };
