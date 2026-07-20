import { describe, it, expect, beforeAll } from "vitest";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq } from "drizzle-orm";
import * as schema from "skillz/server/db/schema";

describe("skillz_user table", () => {
  const client = createClient({ url: ":memory:" });
  const db = drizzle(client, { schema });

  beforeAll(async () => {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS skillz_user (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL,
        passwordHash TEXT NOT NULL,
        apiKeyHash TEXT,
        apiKeyPrefix TEXT,
        createdAt INTEGER NOT NULL DEFAULT (unixepoch()),
        updatedAt INTEGER NOT NULL DEFAULT (unixepoch())
      )
    `);
  });

  it("should have the users table in the schema", () => {
    expect(schema.users).toBeDefined();
  });

  it("can insert and read a user", async () => {
    await db.insert(schema.users).values({
      username: "testuser",
      email: "test@example.com",
      passwordHash: "hashed_pw",
      apiKeyHash: null,
      apiKeyPrefix: null,
    });

    const row = await db.query.users.findFirst({
      where: eq(schema.users.username, "testuser"),
    });
    expect(row).not.toBeNull();
    expect(row!.username).toBe("testuser");
    expect(row!.email).toBe("test@example.com");
    expect(row!.createdAt).toBeInstanceOf(Date);
  });

  it("enforces unique username", async () => {
    await expect(
      db.insert(schema.users).values({
        username: "testuser",
        email: "other@b.com",
        passwordHash: "pw",
        apiKeyHash: null,
        apiKeyPrefix: null,
      }),
    ).rejects.toThrow();
  });

  it("saves apiKey prefix", async () => {
    await db.insert(schema.users).values({
      username: "keyuser",
      email: "key@b.com",
      passwordHash: "pw",
      apiKeyHash: "abc_hashed",
      apiKeyPrefix: "skz_1234",
    });

    const row = await db.query.users.findFirst({
      where: eq(schema.users.username, "keyuser"),
    });
    expect(row!.apiKeyHash).toBe("abc_hashed");
    expect(row!.apiKeyPrefix).toBe("skz_1234");
  });
});
