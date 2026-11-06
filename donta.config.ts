import { loadEnvFiles } from "donta/load-env";
import { defineConfig } from "drizzle-kit";
import { requireDatabaseUrl } from "./src/lib/donta/environment";
import { configureNeonNetwork } from "./src/lib/donta/network";

loadEnvFiles();
configureNeonNetwork();
// Generating SQL is offline; migrate/studio must have an actual Neon connection.
const offline =
  process.argv.includes("generate") || process.argv.includes("check");
const databaseUrl = offline ? undefined : new URL(requireDatabaseUrl());
databaseUrl?.searchParams.set("sslmode", "verify-full");
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/donta/schema.ts",
  out: "./drizzle-donta",
  ...(databaseUrl ? { dbCredentials: { url: databaseUrl.toString() } } : {}),
});
