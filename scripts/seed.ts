import { loadEnvFiles } from "donta/load-env";
import { getDb } from "../src/lib/donta/db";
import {
  category,
  information as informationTable,
} from "../src/lib/donta/schema";
import { categories, information } from "../src/lib/information";

loadEnvFiles();
const sections = categories.slice(1).map((name, position) => ({
  id: [
    "get-help",
    "health",
    "everyday-life",
    "money-online-safety",
    "whats-happening",
  ][position],
  name,
  position,
}));

async function main() {
  if (process.argv.includes("--dry-run")) {
    console.log(
      `Seed plan: ${sections.length} categories, ${information.length} sample drafts, 0 published records. No database connection or writes.`,
    );
    return;
  }
  const db = getDb();
  await db.insert(category).values(sections).onConflictDoNothing();
  await db
    .insert(informationTable)
    .values(
      information.map((item) => ({
        id: item.id,
        categoryId: sections.find((section) => section.name === item.category)!
          .id,
        title: item.title,
        summary: item.summary,
        body: item.body,
        keywords: item.keywords,
        status: "draft" as const,
        isSample: true,
        reviewLevel: 0,
        previewLevel: item.level,
      })),
    )
    .onConflictDoNothing();
  console.log(
    "Seed complete: categories and sample drafts inserted where absent. Existing records were left unchanged.",
  );
}
main().catch(() => {
  console.error(
    "Seed failed. Check DATABASE_URL, Neon connectivity, and that migrations were applied. Database credentials are never printed.",
  );
  process.exitCode = 1;
});
