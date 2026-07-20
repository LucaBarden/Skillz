import { readdir, rm } from "node:fs/promises";
import type { Dirent } from "node:fs";
import { join } from "node:path";
import chalk from "chalk";
import { checkbox } from "@inquirer/prompts";
import { getConfig } from "../config.ts";

export async function removeCommand(): Promise<void> {
  const config = await getConfig();

  if (!config.skillsDir) {
    console.error(
      chalk.red("No skills directory configured. Run"),
      chalk.bold("skillz setup"),
      chalk.red("first."),
    );
    process.exit(1);
  }

  let entries: Dirent[];
  try {
    entries = await readdir(config.skillsDir, { withFileTypes: true });
  } catch {
    console.error(
      chalk.red(`Skills directory not found: ${config.skillsDir}`),
    );
    process.exit(1);
  }

  const installed = entries
    .filter((e) => e.isDirectory())
    .map((e) => e.name);

  if (installed.length === 0) {
    console.log(chalk.dim("No skills installed."));
    return;
  }

  const selected = await checkbox({
    message: "Select skills to remove",
    choices: installed.map((name) => ({
      value: name,
      name,
    })),
  });

  if (selected.length === 0) {
    console.log(chalk.dim("Nothing removed."));
    return;
  }

  for (const name of selected) {
    const dir = join(config.skillsDir!, name);
    await rm(dir, { recursive: true, force: true });
    console.log(chalk.red(`✕ ${name}`));
  }

  console.log();
  console.log(
    chalk.green(
      `Removed ${selected.length} skill${selected.length === 1 ? "" : "s"}`,
    ),
  );
}
