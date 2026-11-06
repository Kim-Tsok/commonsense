import { Config } from "drizzle-kit";
//#region src/drizzle-config.d.ts
export type DontaConfigOptions = {
  /** Path to the Drizzle schema, e.g. "./lib/schema.ts". */
  schema: string;
  /** Where migrations are written. Defaults to "./drizzle". */
  out?: string;
};
/**
 * drizzle-kit config that targets the same database as `createDb`: Neon when
 * DATABASE_URL is set (from the environment or .env files), PGlite otherwise.
 */
export declare function defineConfig({ schema, out }: DontaConfigOptions): Config;
//#endregion