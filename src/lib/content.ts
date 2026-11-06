import "server-only";
import { and, asc, eq, gt, inArray, isNotNull, sql } from "drizzle-orm";
import { getDb } from "./donta/db";
import {
  category,
  information,
  informationSource,
  source,
} from "./donta/schema";
import type { Information } from "./information";

export async function getInformation(): Promise<Information[]> {
  const prototype = process.env.CONTENT_MODE === "prototype";
  const rows = await getDb()
    .select({
      id: information.id,
      title: information.title,
      summary: information.summary,
      body: information.body,
      keywords: information.keywords,
      category: category.name,
      reviewLevel: information.reviewLevel,
      previewLevel: information.previewLevel,
      checkedAt: information.checkedAt,
    })
    .from(information)
    .innerJoin(category, eq(information.categoryId, category.id))
    .where(
      prototype
        ? and(
            eq(information.isSample, true),
            eq(information.status, "draft"),
            isNotNull(information.previewLevel),
          )
        : and(
            eq(information.isSample, false),
            eq(information.status, "published"),
            gt(information.nextReviewAt, new Date()),
            sql`exists (select 1 from information_source where information_id = ${information.id})`,
          ),
    )
    .orderBy(
      asc(category.position),
      asc(information.createdAt),
      asc(information.id),
    );
  const sources = rows.length
    ? await getDb()
        .select({
          informationId: informationSource.informationId,
          url: source.url,
          title: source.title,
          publisher: source.publisher,
        })
        .from(informationSource)
        .innerJoin(source, eq(source.id, informationSource.sourceId))
        .where(
          inArray(
            informationSource.informationId,
            rows.map((row) => row.id),
          ),
        )
    : [];
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    summary: row.summary,
    body: row.body,
    keywords: row.keywords,
    category: row.category as Information["category"],
    level: (prototype
      ? row.previewLevel
      : row.reviewLevel) as Information["level"],
    checkedAt: row.checkedAt?.toISOString(),
    sources: sources
      .filter((source) => source.informationId === row.id)
      .map(({ url, title, publisher }) => ({ url, title, publisher })),
  }));
}
