import { type Config } from "drizzle-kit";

import { serverConfig } from "skillz/server/config";

export default {
  schema: "./src/server/db/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: serverConfig.DATABASE_URL,
  },
  tablesFilter: ["skillz_*"],
} satisfies Config;
