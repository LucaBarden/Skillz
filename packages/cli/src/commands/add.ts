import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import chalk from "chalk";
import { input } from "@inquirer/prompts";
import { getConfig, saveConfig } from "../config.js";

export async function addCommand(owner: string, name: string): Promise<void> {
  const config = await getConfig();

  if (!config.registry) {
    console.error(chalk.red("No registry configured. Run"), chalk.bold("skillz setup"), chalk.red("first."));
    process.exit(1);
  }

  // 1. Ensure skills directory is configured
  let skillsDir = config.skillsDir;
  if (!skillsDir) {
    console.log(chalk.dim("No skills directory configured."));
    skillsDir = await input({
      message: "Where should skills be installed?",
      validate: (value: string) => {
        if (!value.trim()) return "Path is required";
        return true;
      },
    });
    await saveConfig({ ...config, skillsDir });
    console.log(chalk.dim(`Saved to config: ${skillsDir}`));
    console.log();
  }

  // 2. Fetch skill from registry
  const url = new URL(`/api/skills/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`, config.registry);
  console.log(chalk.dim(`Fetching ${owner}/${name} from registry...`));

  let response: Response;
  try {
    response = await fetch(url.toString());
  } catch {
    console.error(chalk.red(`Failed to reach registry: ${config.registry}`));
    process.exit(1);
  }

  if (response.status === 404) {
    console.error(chalk.red(`Skill not found: ${owner}/${name}`));
    process.exit(1);
  }

  if (!response.ok) {
    console.error(chalk.red(`Registry error: ${response.status}`));
    process.exit(1);
  }

  const skill = await response.json() as { name: string; content: string };

  // 3. Create directory and write SKILL.md
  const targetDir = join(skillsDir, name);
  await mkdir(targetDir, { recursive: true });

  const skillMdPath = join(targetDir, "SKILL.md");
  await writeFile(skillMdPath, skill.content, "utf-8");

  console.log(chalk.green(`Installed ${owner}/${name} to ${targetDir}`));
  console.log(chalk.dim(`  SKILL.md written`));
}
