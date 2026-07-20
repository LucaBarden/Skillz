import { readFileSync } from "fs";
import { resolve } from "path";
import { z } from "zod";

const configFileSchema = z.object({
  database_url: z.string().optional(),
});

type ConfigFile = z.infer<typeof configFileSchema>;

function loadFileConfig(): ConfigFile {
  try {
    const path = resolve(process.cwd(), "server-config.json");
    const raw = readFileSync(path, "utf-8");
    const parsed: unknown = JSON.parse(raw);
    return configFileSchema.parse(parsed);
  } catch {
    return {};
  }
}

const fileConfig = loadFileConfig();

const DATABASE_URL =
  process.env.DATABASE_URL ?? fileConfig.database_url ?? "file:./db.sqlite";

const NODE_ENV = process.env.NODE_ENV ?? "development";

export const serverConfig = {
  DATABASE_URL,
  NODE_ENV,
};
