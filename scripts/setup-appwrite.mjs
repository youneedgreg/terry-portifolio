#!/usr/bin/env node
/**
 * Appwrite Setup Script — creates the database, collections, attributes, and bucket
 * for the terry masila portfolio.
 *
 * Usage:
 *   APPWRITE_API_KEY=<your-api-key> node scripts/setup-appwrite.mjs
 *
 * Get an API key from: Appwrite Console → Project → API Keys → Create Key
 * Required scopes: databases.write, collections.write, attributes.write, buckets.write
 */

import { Client, Databases, Storage } from "node-appwrite";

const ENDPOINT = "https://fra.cloud.appwrite.io/v1";
const PROJECT_ID = "6a685c5a003dc6fc982e";
const API_KEY = process.env.APPWRITE_API_KEY;

if (!API_KEY) {
  console.error("❌  Set APPWRITE_API_KEY environment variable first.");
  console.error("   Get one from Appwrite Console → Project → API Keys");
  process.exit(1);
}

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const databases = new Databases(client);
const storage = new Storage(client);

const DB_ID = "portfolio_db";
const BUCKET_ID = "portfolio";

const COLLECTIONS = {
  photos: "photos",
  clients: "clients",
  social_links: "social_links",
  site_content: "site_content",
};

async function createOrSkip(label, fn) {
  try {
    const result = await fn();
    console.log(`  ✅ Created ${label}`);
    return result;
  } catch (e) {
    if (e.code === 409) {
      console.log(`  ⏭  ${label} already exists, skipping`);
    } else {
      throw e;
    }
  }
}

async function main() {
  console.log("\n🚀 Setting up Appwrite for terry masila portfolio...\n");

  // ── Database ─────────────────────────────────────────────────────────────
  try {
    await databases.get(DB_ID);
    console.log(`  ⏭  Database (${DB_ID}) already exists, skipping`);
  } catch {
    try {
      await databases.create(DB_ID, "Portfolio DB");
      console.log(`  ✅ Created Database (${DB_ID})`);
    } catch (e) {
      console.error("  ❌ Could not create database:", e.message);
      console.error("     If on free plan, make sure you have no other databases.");
      process.exit(1);
    }
  }

  // ── photos collection ─────────────────────────────────────────────────────
  console.log("\n📁 photos");
  await createOrSkip("collection", () =>
    databases.createCollection(DB_ID, COLLECTIONS.photos, "Photos", [
      'read("any")',
      'create("users")',
      'update("users")',
      'delete("users")',
    ])
  );
  for (const [key, size, required, def] of [
    ["url",        255, false, ""],
    ["caption",    255, false, ""],
    ["credit",     255, false, ""],
    ["section",    100, false, "editorial"],
  ]) {
    await createOrSkip(`attr: ${key}`, () =>
      databases.createStringAttribute(DB_ID, COLLECTIONS.photos, key, size, required, def)
    );
  }
  await createOrSkip("attr: sort_order", () =>
    databases.createIntegerAttribute(DB_ID, COLLECTIONS.photos, "sort_order", false, 0)
  );
  await createOrSkip("attr: is_visible", () =>
    databases.createBooleanAttribute(DB_ID, COLLECTIONS.photos, "is_visible", false, true)
  );

  // ── clients collection ────────────────────────────────────────────────────
  console.log("\n📁 clients");
  await createOrSkip("collection", () =>
    databases.createCollection(DB_ID, COLLECTIONS.clients, "Clients", [
      'read("any")',
      'create("users")',
      'update("users")',
      'delete("users")',
    ])
  );
  for (const [key, size, required, def] of [
    ["name",     255, true,  null],
    ["logo_url", 255, false, ""],
    ["link",     255, false, ""],
  ]) {
    await createOrSkip(`attr: ${key}`, () =>
      databases.createStringAttribute(DB_ID, COLLECTIONS.clients, key, size, required, def)
    );
  }
  await createOrSkip("attr: sort_order", () =>
    databases.createIntegerAttribute(DB_ID, COLLECTIONS.clients, "sort_order", false, 0)
  );

  // ── social_links collection ───────────────────────────────────────────────
  console.log("\n📁 social_links");
  await createOrSkip("collection", () =>
    databases.createCollection(DB_ID, COLLECTIONS.social_links, "Social Links", [
      'read("any")',
      'create("users")',
      'update("users")',
      'delete("users")',
    ])
  );
  for (const [key, size, required, def] of [
    ["platform", 100, true,  null],
    ["url",      255, true,  null],
  ]) {
    await createOrSkip(`attr: ${key}`, () =>
      databases.createStringAttribute(DB_ID, COLLECTIONS.social_links, key, size, required, def)
    );
  }
  await createOrSkip("attr: sort_order", () =>
    databases.createIntegerAttribute(DB_ID, COLLECTIONS.social_links, "sort_order", false, 0)
  );

  // ── site_content collection ───────────────────────────────────────────────
  console.log("\n📁 site_content");
  await createOrSkip("collection", () =>
    databases.createCollection(DB_ID, COLLECTIONS.site_content, "Site Content", [
      'read("any")',
      'create("users")',
      'update("users")',
      'delete("users")',
    ])
  );
  for (const [key, size, required] of [
    ["key",   255, true],
    ["value", 5000, false],
  ]) {
    await createOrSkip(`attr: ${key}`, () =>
      databases.createStringAttribute(DB_ID, COLLECTIONS.site_content, key, size, required)
    );
  }

  // ── Storage bucket ────────────────────────────────────────────────────────
  console.log("\n🪣  storage bucket");
  await createOrSkip(`Bucket (${BUCKET_ID})`, () =>
    storage.createBucket(
      BUCKET_ID,
      "Portfolio",
      ['read("any")', 'create("users")', 'update("users")', 'delete("users")'],
      undefined, // fileSecurity
      true,      // enabled
      50 * 1024 * 1024, // 50 MB max file size
      ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]
    )
  );

  console.log("\n✅ All done! Your Appwrite backend is ready.\n");
}

main().catch((e) => {
  console.error("\n❌ Setup failed:", e.message ?? e);
  process.exit(1);
});
