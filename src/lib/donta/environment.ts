/** Require a Neon connection; never fall back to a local database. */
export function requireDatabaseUrl(): string {
  const value = process.env.DATABASE_URL;
  if (!value)
    throw new Error(
      "Set DATABASE_URL to your Neon connection string in .env.local before using the database.",
    );
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(
      "DATABASE_URL must be a valid Neon Postgres connection string.",
    );
  }
  if (
    !["postgres:", "postgresql:"].includes(url.protocol) ||
    !url.hostname.endsWith(".neon.tech") ||
    !url.password ||
    !url.username ||
    url.pathname.length < 2
  ) {
    throw new Error(
      "DATABASE_URL must point to a Neon database and include a username, password, and database name.",
    );
  }
  if (
    url.searchParams.get("sslmode") !== "require" &&
    url.searchParams.get("sslmode") !== "verify-full"
  ) {
    throw new Error(
      "The Neon connection string must include sslmode=require or sslmode=verify-full.",
    );
  }
  return value;
}
