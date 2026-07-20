import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

export interface SkillzConfig {
  registry: string;
  owner?: string;
  skillsDir?: string;
  apiKey?: string;
}

const CONFIG_DIR = join(homedir(), ".config", "skillz");
const CONFIG_PATH = join(CONFIG_DIR, "config.json");

const DEFAULT_CONFIG: SkillzConfig = {
  registry: "",
};

export async function getConfig(): Promise<SkillzConfig> {
  try {
    const data = await readFile(CONFIG_PATH, "utf-8");
    return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export async function saveConfig(config: SkillzConfig): Promise<void> {
  await mkdir(CONFIG_DIR, { recursive: true });
  await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
}

export function configPath(): string {
  return CONFIG_PATH;
}
