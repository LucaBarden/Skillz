import { input } from "@inquirer/prompts";
import chalk from "chalk";
import { showBanner } from "../banner.js";
import { getConfig, saveConfig } from "../config.js";

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

  await saveConfig({ ...existing, registry });

  console.log();
  console.log(chalk.green("Saved!"));
  console.log(chalk.dim(`Registry set to: ${registry}`));
}
