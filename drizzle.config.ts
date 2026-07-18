import { type Config } from "drizzle-kit";

import { env } from "skillz/env";

export default {
  schema: "./src/server/db/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  tablesFilter: ["skillz_*"],
} satisfies Config;
