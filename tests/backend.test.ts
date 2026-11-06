import { afterEach, beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { requireDatabaseUrl } from "../src/lib/donta/environment";
import { getDb } from "../src/lib/donta/db";

const previous = process.env.DATABASE_URL;
beforeEach(() => {
  delete process.env.DATABASE_URL;
});
afterEach(() => {
  if (previous === undefined) delete process.env.DATABASE_URL;
  else process.env.DATABASE_URL = previous;
});

test("missing Neon credentials fail without creating a local database", () => {
  const localDatabaseExisted = existsSync(".donta/pglite");
  assert.throws(() => getDb(), /Set DATABASE_URL/);
  assert.equal(existsSync(".donta/pglite"), localDatabaseExisted);
});

test("rejects local Postgres instead of silently accepting another backend", () => {
  process.env.DATABASE_URL =
    "postgresql://user:password@localhost/app?sslmode=require";
  assert.throws(requireDatabaseUrl, /Neon database/);
});

test("rejects a hostname that only contains the Neon domain", () => {
  process.env.DATABASE_URL =
    "postgresql://user:password@neon.tech.example.com/app?sslmode=require";
  assert.throws(requireDatabaseUrl, /Neon database/);
});

test("rejects a connection without TLS", () => {
  process.env.DATABASE_URL =
    "postgresql://user:password@ep-example.neon.tech/app";
  assert.throws(requireDatabaseUrl, /sslmode/);
});

test("accepts Neon pooled and direct connection formats without connecting", () => {
  for (const host of [
    "ep-example.eu-west-2.aws.neon.tech",
    "ep-example-pooler.eu-west-2.aws.neon.tech",
  ]) {
    process.env.DATABASE_URL = `postgresql://user:password@${host}/neondb?sslmode=require&channel_binding=require`;
    assert.equal(requireDatabaseUrl(), process.env.DATABASE_URL);
  }
});

test("invalid connection errors do not disclose the connection string", () => {
  process.env.DATABASE_URL =
    "https://user:private-password@example.org/database";
  assert.throws(
    requireDatabaseUrl,
    (error: Error) => !error.message.includes("private-password"),
  );
});
