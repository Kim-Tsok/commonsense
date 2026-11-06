CREATE TYPE "public"."publication_status" AS ENUM('draft', 'published', 'withdrawn');--> statement-breakpoint
CREATE TYPE "public"."submission_status" AS ENUM('pending', 'accepted', 'rejected', 'duplicate');--> statement-breakpoint
CREATE TABLE "category" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"position" integer NOT NULL,
	CONSTRAINT "category_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "information" (
	"id" text PRIMARY KEY NOT NULL,
	"category_id" text NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"body" text NOT NULL,
	"country" text DEFAULT 'NG' NOT NULL,
	"location" text DEFAULT 'Nigeria' NOT NULL,
	"keywords" text[] DEFAULT '{}'::text[] NOT NULL,
	"status" "publication_status" DEFAULT 'draft' NOT NULL,
	"is_sample" boolean DEFAULT false NOT NULL,
	"review_level" integer DEFAULT 0 NOT NULL,
	"preview_level" integer,
	"reviewed_by" text,
	"checked_at" timestamp with time zone,
	"next_review_at" timestamp with time zone,
	"published_at" timestamp with time zone,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "information_level_range" CHECK ("information"."review_level" between 0 and 4),
	CONSTRAINT "information_preview_range" CHECK ("information"."preview_level" is null or ("information"."is_sample" and "information"."preview_level" between 1 and 4)),
	CONSTRAINT "information_publish_requires_review" CHECK ("information"."status" <> 'published' or (not "information"."is_sample" and "information"."review_level" >= 1 and "information"."reviewed_by" is not null and "information"."checked_at" is not null and "information"."next_review_at" is not null and "information"."published_at" is not null)),
	CONSTRAINT "information_review_dates" CHECK ("information"."next_review_at" is null or ("information"."checked_at" is not null and "information"."next_review_at" > "information"."checked_at"))
);
--> statement-breakpoint
CREATE TABLE "information_source" (
	"information_id" text NOT NULL,
	"source_id" text NOT NULL,
	"note" text,
	CONSTRAINT "information_source_information_id_source_id_pk" PRIMARY KEY("information_id","source_id")
);
--> statement-breakpoint
CREATE TABLE "review" (
	"id" text PRIMARY KEY NOT NULL,
	"information_id" text NOT NULL,
	"reviewer_id" text NOT NULL,
	"level" integer NOT NULL,
	"note" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "review_level_range" CHECK ("review"."level" between 0 and 4)
);
--> statement-breakpoint
CREATE TABLE "source" (
	"id" text PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"title" text NOT NULL,
	"publisher" text NOT NULL,
	"accessed_at" timestamp with time zone,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "source_url_unique" UNIQUE("url"),
	CONSTRAINT "source_http_url" CHECK ("source"."url" ~ '^https?://')
);
--> statement-breakpoint
CREATE TABLE "submission" (
	"id" text PRIMARY KEY NOT NULL,
	"contributor_id" text NOT NULL,
	"category_id" text NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"source_url" text NOT NULL,
	"location" text DEFAULT 'Nigeria' NOT NULL,
	"status" "submission_status" DEFAULT 'pending' NOT NULL,
	"information_id" text,
	"moderated_by" text,
	"moderated_at" timestamp with time zone,
	"moderation_note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "submission_source_url" CHECK ("submission"."source_url" ~ '^https?://'),
	CONSTRAINT "submission_moderated" CHECK ("submission"."status" = 'pending' or ("submission"."moderated_by" is not null and "submission"."moderated_at" is not null)),
	CONSTRAINT "submission_resolved_information" CHECK ("submission"."status" not in ('accepted', 'duplicate') or "submission"."information_id" is not null)
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" text DEFAULT 'contributor' NOT NULL;--> statement-breakpoint
ALTER TABLE "information" ADD CONSTRAINT "information_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "information" ADD CONSTRAINT "information_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "information_source" ADD CONSTRAINT "information_source_information_id_information_id_fk" FOREIGN KEY ("information_id") REFERENCES "public"."information"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "information_source" ADD CONSTRAINT "information_source_source_id_source_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."source"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_information_id_information_id_fk" FOREIGN KEY ("information_id") REFERENCES "public"."information"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_reviewer_id_user_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission" ADD CONSTRAINT "submission_contributor_id_user_id_fk" FOREIGN KEY ("contributor_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission" ADD CONSTRAINT "submission_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission" ADD CONSTRAINT "submission_information_id_information_id_fk" FOREIGN KEY ("information_id") REFERENCES "public"."information"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission" ADD CONSTRAINT "submission_moderated_by_user_id_fk" FOREIGN KEY ("moderated_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "information_publication_idx" ON "information" USING btree ("status","is_sample");--> statement-breakpoint
CREATE INDEX "information_category_idx" ON "information" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "information_search_idx" ON "information" USING gin (to_tsvector('english', "title" || ' ' || "summary" || ' ' || "body"));--> statement-breakpoint
CREATE INDEX "review_information_idx" ON "review" USING btree ("information_id","created_at");--> statement-breakpoint
CREATE INDEX "submission_queue_idx" ON "submission" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "submission_contributor_idx" ON "submission" USING btree ("contributor_id");