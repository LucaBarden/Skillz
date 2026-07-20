import { eq } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "skillz/server/db/schema";

type Db = LibSQLDatabase<typeof schema>;

export async function createUser(
  db: Db,
  input: { username: string; email: string; passwordHash: string },
) {
  const [user] = await db
    .insert(schema.users)
    .values(input)
    .returning();
  if (!user) throw new Error("Failed to create user");
  return user;
}

export async function findUserByUsername(db: Db, username: string) {
  return db.query.users.findFirst({
    where: eq(schema.users.username, username),
  });
}

export async function findUserById(db: Db, id: number) {
  return db.query.users.findFirst({
    where: eq(schema.users.id, id),
  });
}

export async function updateUserPassword(
  db: Db,
  userId: number,
  passwordHash: string,
) {
  await db
    .update(schema.users)
    .set({ passwordHash })
    .where(eq(schema.users.id, userId));
}

export async function updateUserEmail(db: Db, userId: number, email: string) {
  await db
    .update(schema.users)
    .set({ email })
    .where(eq(schema.users.id, userId));
}

export async function updateUserApiKey(
  db: Db,
  userId: number,
  apiKeyHash: string | null,
  apiKeyPrefix: string | null,
) {
  await db
    .update(schema.users)
    .set({ apiKeyHash, apiKeyPrefix })
    .where(eq(schema.users.id, userId));
}
