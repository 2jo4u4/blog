import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

describe("D1 Database Migrations", () => {
  const migrationsDir = path.resolve(__dirname, "../migrations");
  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  it("should find migration files in migrations directory", () => {
    expect(files.length).toBeGreaterThanOrEqual(4);
    expect(files).toContain("0001_initial.sql");
    expect(files).toContain("0002_post_revisions.sql");
    expect(files).toContain("0003_add_is_ai_generated.sql");
    expect(files).toContain("0004_admin_user.sql");
  });

  it("should apply all migrations sequentially to an in-memory SQLite database without syntax errors", () => {
    const db = new DatabaseSync(":memory:");

    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
      expect(() => db.exec(sql)).not.toThrow();
    }

    // Verify all expected tables exist
    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
      .all() as { name: string }[];
    const tableNames = tables.map((t) => t.name);

    expect(tableNames).toContain("posts");
    expect(tableNames).toContain("post_revisions");
    expect(tableNames).toContain("admin_users");

    // Verify posts table columns
    const postColumns = db.prepare("PRAGMA table_info(posts)").all() as {
      name: string;
      type: string;
    }[];
    const columnNames = postColumns.map((c) => c.name);

    expect(columnNames).toContain("id");
    expect(columnNames).toContain("slug");
    expect(columnNames).toContain("title");
    expect(columnNames).toContain("summary");
    expect(columnNames).toContain("content");
    expect(columnNames).toContain("tags");
    expect(columnNames).toContain("is_published");
    expect(columnNames).toContain("is_ai_generated");
    expect(columnNames).toContain("views");
    expect(columnNames).toContain("created_at");
    expect(columnNames).toContain("updated_at");

    // Verify post_revisions table columns
    const revisionColumns = db.prepare("PRAGMA table_info(post_revisions)").all() as {
      name: string;
    }[];
    const revisionColumnNames = revisionColumns.map((c) => c.name);
    expect(revisionColumnNames).toContain("id");
    expect(revisionColumnNames).toContain("post_slug");
    expect(revisionColumnNames).toContain("updated_at");
    expect(revisionColumnNames).toContain("note");

    // Verify admin_users table columns
    const userColumns = db.prepare("PRAGMA table_info(admin_users)").all() as {
      name: string;
    }[];
    const userColumnNames = userColumns.map((c) => c.name);
    expect(userColumnNames).toContain("username");
    expect(userColumnNames).toContain("password_hash");

    // Verify seeded admin user exists with valid schema
    const adminUser = db
      .prepare("SELECT username, password_hash FROM admin_users LIMIT 1")
      .get() as { username: string; password_hash: string } | undefined;

    expect(adminUser).toBeDefined();
    expect(adminUser?.username?.length).toBeGreaterThan(0);
    // SHA-256 hash format (64-character hex string)
    expect(adminUser?.password_hash).toMatch(/^[a-f0-9]{64}$/i);
  });
});
