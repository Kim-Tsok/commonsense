import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import { requireDatabaseUrl } from "./environment";
import { configureNeonNetwork } from "./network";

// Donta's schema/auth foundation, using Neon's standard Postgres transport.
// Share the pool across development hot reloads; connect only on the first query.
const globalDatabase = globalThis as typeof globalThis & {
  commonSensePool?: Pool;
};
let database: ReturnType<typeof drizzle<typeof schema>> | undefined;
export function getDb() {
  configureNeonNetwork();
  const url = new URL(requireDatabaseUrl());
  // Configure TLS explicitly; URL SSL parameters otherwise override pg options.
  url.searchParams.delete("sslmode");
  url.searchParams.delete("channel_binding");
  if (!globalDatabase.commonSensePool) {
    globalDatabase.commonSensePool = new Pool({
      connectionString: url.toString(),
      ssl: { rejectUnauthorized: true },
      enableChannelBinding: true,
      max: 5,
      connectionTimeoutMillis: 15000,
      idleTimeoutMillis: 10000,
      statement_timeout: 15000,
      allowExitOnIdle: true,
    });
    globalDatabase.commonSensePool.on("error", () => {
      console.error(
        "An idle Neon connection closed unexpectedly; the pool will replace it.",
      );
    });
  }
  database ??= drizzle(globalDatabase.commonSensePool, { schema });
  return database;
}
