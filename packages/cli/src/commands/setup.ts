import { input } from "@inquirer/prompts";
import chalk from "chalk";
import { showBanner } from "../banner.ts";
import { getConfig, saveConfig } from "../config.ts";

export async function setupCommand(): Promise<void> {
  showBanner();

  console.log(chalk.bold("Configure your Skillz registry\n"));

  const existing = await getConfig();

  const registry = await input({
    message: "Registry URL:",
    default: existing.registry || undefined,
    validate: (value: string) => {
      if (!value.trim()) return "Registry URL is required";
      try {
        new URL(value);
        return true;
      } catch {
        return "Enter a valid URL (e.g. https://skillz.sh)";
      }
    },
  });

  const skillsDir = await input({
    message: "Skills directory:",
    default: existing.skillsDir || "~/.skillz",
    validate: (value: string) => {
      if (!value.trim()) return "Skills directory is required";
      return true;
    },
  });

  await saveConfig({ ...existing, registry, skillsDir });

  console.log();
  console.log(chalk.green("Saved!"));
  console.log(chalk.dim(`Registry: ${registry}`));
  console.log(chalk.dim(`Skills dir: ${skillsDir}`));
}
