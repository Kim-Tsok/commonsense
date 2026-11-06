import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// Tables Better Auth needs. Add your own tables below them, then run
// `pnpm db:generate` to write a migration.

const timestamps = {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
};

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  role: text("role").default("contributor").notNull(),
  ...timestamps,
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (t) => [index("session_user_id_idx").on(t.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    ...timestamps,
  },
  (t) => [index("account_user_id_idx").on(t.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    ...timestamps,
  },
  (t) => [index("verification_identifier_idx").on(t.identifier)],
);

export const publicationStatus = pgEnum("publication_status", [
  "draft",
  "published",
  "withdrawn",
]);
export const submissionStatus = pgEnum("submission_status", [
  "pending",
  "accepted",
  "rejected",
  "duplicate",
]);

export const category = pgTable("category", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  position: integer("position").notNull(),
});

export const information = pgTable(
  "information",
  {
    id: text("id").primaryKey(),
    categoryId: text("category_id")
      .notNull()
      .references(() => category.id),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    body: text("body").notNull(),
    country: text("country").default("NG").notNull(),
    location: text("location").default("Nigeria").notNull(),
    keywords: text("keywords")
      .array()
      .default(sql`'{}'::text[]`)
      .notNull(),
    status: publicationStatus("status").default("draft").notNull(),
    isSample: boolean("is_sample").default(false).notNull(),
    reviewLevel: integer("review_level").default(0).notNull(),
    // A UI example is separate from the actual verification state.
    previewLevel: integer("preview_level"),
    reviewedBy: text("reviewed_by").references(() => user.id, {
      onDelete: "restrict",
    }),
    checkedAt: timestamp("checked_at", { withTimezone: true }),
    nextReviewAt: timestamp("next_review_at", { withTimezone: true }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    index("information_publication_idx").on(t.status, t.isSample),
    index("information_category_idx").on(t.categoryId),
    index("information_search_idx").using(
      "gin",
      sql`to_tsvector('english', ${t.title} || ' ' || ${t.summary} || ' ' || ${t.body})`,
    ),
    check("information_level_range", sql`${t.reviewLevel} between 0 and 4`),
    check(
      "information_preview_range",
      sql`${t.previewLevel} is null or (${t.isSample} and ${t.previewLevel} between 1 and 4)`,
    ),
    check(
      "information_publish_requires_review",
      sql`${t.status} <> 'published' or (not ${t.isSample} and ${t.reviewLevel} >= 1 and ${t.reviewedBy} is not null and ${t.checkedAt} is not null and ${t.nextReviewAt} is not null and ${t.publishedAt} is not null)`,
    ),
    check(
      "information_review_dates",
      sql`${t.nextReviewAt} is null or (${t.checkedAt} is not null and ${t.nextReviewAt} > ${t.checkedAt})`,
    ),
  ],
);

export const source = pgTable(
  "source",
  {
    id: text("id").primaryKey(),
    url: text("url").notNull().unique(),
    title: text("title").notNull(),
    publisher: text("publisher").notNull(),
    accessedAt: timestamp("accessed_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [check("source_http_url", sql`${t.url} ~ '^https?://'`)],
);

export const informationSource = pgTable(
  "information_source",
  {
    informationId: text("information_id")
      .notNull()
      .references(() => information.id, { onDelete: "cascade" }),
    sourceId: text("source_id")
      .notNull()
      .references(() => source.id, { onDelete: "restrict" }),
    note: text("note"),
  },
  (t) => [primaryKey({ columns: [t.informationId, t.sourceId] })],
);

export const submission = pgTable(
  "submission",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    contributorId: text("contributor_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    categoryId: text("category_id")
      .notNull()
      .references(() => category.id),
    title: text("title").notNull(),
    body: text("body").notNull(),
    sourceUrl: text("source_url").notNull(),
    location: text("location").default("Nigeria").notNull(),
    status: submissionStatus("status").default("pending").notNull(),
    informationId: text("information_id").references(() => information.id, {
      onDelete: "restrict",
    }),
    moderatedBy: text("moderated_by").references(() => user.id, {
      onDelete: "restrict",
    }),
    moderatedAt: timestamp("moderated_at", { withTimezone: true }),
    moderationNote: text("moderation_note"),
    ...timestamps,
  },
  (t) => [
    index("submission_queue_idx").on(t.status, t.createdAt),
    index("submission_contributor_idx").on(t.contributorId),
    check("submission_source_url", sql`${t.sourceUrl} ~ '^https?://'`),
    check(
      "submission_moderated",
      sql`${t.status} = 'pending' or (${t.moderatedBy} is not null and ${t.moderatedAt} is not null)`,
    ),
    check(
      "submission_resolved_information",
      sql`${t.status} not in ('accepted', 'duplicate') or ${t.informationId} is not null`,
    ),
  ],
);

export const review = pgTable(
  "review",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    informationId: text("information_id")
      .notNull()
      .references(() => information.id, { onDelete: "restrict" }),
    reviewerId: text("reviewer_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    level: integer("level").notNull(),
    note: text("note").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("review_information_idx").on(t.informationId, t.createdAt),
    check("review_level_range", sql`${t.level} between 0 and 4`),
  ],
);
