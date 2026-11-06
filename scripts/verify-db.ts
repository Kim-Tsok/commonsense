import { loadEnvFiles } from "donta/load-env";
import { eq, sql } from "drizzle-orm";
import { getDb } from "../src/lib/donta/db";
import { category, information as content } from "../src/lib/donta/schema";
import { information } from "../src/lib/information";

loadEnvFiles();
async function main() {
  const db = getDb();
  await db.execute(sql`select 1`);
  const sections = await db.select({ id: category.id }).from(category);
  const samples = await db
    .select({
      id: content.id,
      level: content.reviewLevel,
      status: content.status,
    })
    .from(content)
    .where(eq(content.isSample, true));
  const missing = information.filter(
    (item) => !samples.some((row) => row.id === item.id),
  );
  if (sections.length < 5 || missing.length) throw new Error("Seed incomplete");
  if (samples.some((row) => row.level !== 0 || row.status !== "draft"))
    throw new Error("Sample verification status is incorrect");
  console.log(
    `Neon connection verified. ${sections.length} categories; ${samples.length} sample drafts with no actual verification level.`,
  );
}
main().catch(() => {
  console.error(
    "Database verification failed. Check the Neon connection, migrations, and seed. No credentials are printed.",
  );
  process.exitCode = 1;
});
