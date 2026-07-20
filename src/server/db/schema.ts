import { sql } from "drizzle-orm";
import { index, sqliteTableCreator, unique } from "drizzle-orm/sqlite-core";

export const createTable = sqliteTableCreator((name) => `skillz_${name}`);

export const skills = createTable(
  "skill",
  (d) => ({
    id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
    name: d.text({ length: 256 }).notNull(),
    description: d.text({ length: 512 }).notNull(),
    version: d.text({ length: 32 }).notNull(),
    owner: d.text({ length: 256 }).notNull(),
    content: d.text().notNull(),
    createdAt: d
      .integer({ mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: d.integer({ mode: "timestamp" }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("owner_name_idx").on(t.owner, t.name),
    unique("owner_name_unique").on(t.owner, t.name),
  ],
);

export const users = createTable("user", (d) => ({
  id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  username: d.text({ length: 256 }).notNull().unique(),
  email: d.text({ length: 256 }).notNull(),
  passwordHash: d.text().notNull(),
  apiKeyHash: d.text(),
  apiKeyPrefix: d.text(),
  createdAt: d
    .integer({ mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: d.integer({ mode: "timestamp" }).$onUpdate(() => new Date()),
}));
