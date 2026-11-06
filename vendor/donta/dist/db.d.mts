import { Database } from "./env.mjs";
import { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
//#region src/db.d.ts
export type DontaDatabase<TSchema extends Record<string, unknown>> = PgDatabase<PgQueryResultHKT, TSchema>;
export type CreateDbOptions<TSchema extends Record<string, unknown>> = {
  schema: TSchema;
  /** Override the database chosen from DATABASE_URL (mainly for tests). */
  database?: Database;
};
/**
 * Creates the project's Drizzle client: Neon over HTTP when DATABASE_URL is
 * set, local PGlite otherwise. It connects on first use rather than on import,
 * so builds that load the module in several workers never open PGlite.
 */
export declare function createDb<TSchema extends Record<string, unknown>>({ schema, database }: CreateDbOptions<TSchema>): {
  db: DontaDatabase<TSchema>;
  driver: "neon" | "pglite";
};
//#endregion