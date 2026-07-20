import { describe, it, expect, beforeAll } from "vitest";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "skillz/server/db/schema";
import { createUser, findUserByUsername, findUserById, updateUserPassword, updateUserEmail, updateUserApiKey } from "./db";

describe("user DB helpers", () => {
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

  it("createUser inserts and returns a user", async () => {
    const user = await createUser(db, {
      username: "newuser",
      email: "new@example.com",
      passwordHash: "hashed",
    });
    expect(user.id).toBeGreaterThan(0);
    expect(user.username).toBe("newuser");
    expect(user.email).toBe("new@example.com");
    expect(user.passwordHash).toBe("hashed");
    expect(user.apiKeyHash).toBeNull();
    expect(user.apiKeyPrefix).toBeNull();
  });

  it("createUser rejects duplicate username", async () => {
    await expect(
      createUser(db, {
        username: "newuser",
        email: "other@example.com",
        passwordHash: "pw",
      }),
    ).rejects.toThrow();
  });

  it("findUserByUsername returns user", async () => {
    const user = await findUserByUsername(db, "newuser");
    expect(user).not.toBeNull();
    expect(user!.username).toBe("newuser");
  });

  it("findUserByUsername returns undefined for unknown", async () => {
    const user = await findUserByUsername(db, "nobody");
    expect(user).toBeUndefined();
  });

  it("findUserById returns user", async () => {
    const created = await findUserByUsername(db, "newuser");
    const user = await findUserById(db, created!.id);
    expect(user).not.toBeNull();
    expect(user!.id).toBe(created!.id);
  });

  it("findUserById returns undefined for unknown", async () => {
    const user = await findUserById(db, 99999);
    expect(user).toBeUndefined();
  });

  it("updateUserPassword changes the hash", async () => {
    const user = await findUserByUsername(db, "newuser");
    await updateUserPassword(db, user!.id, "newhash");
    const updated = await findUserById(db, user!.id);
    expect(updated!.passwordHash).toBe("newhash");
  });

  it("updateUserEmail changes email", async () => {
    const user = await findUserByUsername(db, "newuser");
    await updateUserEmail(db, user!.id, "changed@example.com");
    const updated = await findUserById(db, user!.id);
    expect(updated!.email).toBe("changed@example.com");
  });

  it("updateUserApiKey sets hash and prefix", async () => {
    const user = await findUserByUsername(db, "newuser");
    await updateUserApiKey(db, user!.id, "hashed_key", "skz_1234567");
    const updated = await findUserById(db, user!.id);
    expect(updated!.apiKeyHash).toBe("hashed_key");
    expect(updated!.apiKeyPrefix).toBe("skz_1234567");
  });

  it("updateUserApiKey nulls both fields", async () => {
    const user = await findUserByUsername(db, "newuser");
    await updateUserApiKey(db, user!.id, null, null);
    const updated = await findUserById(db, user!.id);
    expect(updated!.apiKeyHash).toBeNull();
    expect(updated!.apiKeyPrefix).toBeNull();
  });
});
