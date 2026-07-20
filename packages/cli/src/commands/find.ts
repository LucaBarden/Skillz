import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import chalk from "chalk";
import { checkbox, input } from "@inquirer/prompts";
import { getConfig, saveConfig, type SkillzConfig } from "../config.ts";

interface SkillResult {
  owner: string;
  name: string;
  description: string;
  version: string;
  content: string;
}

export async function findCommand(
  global: boolean,
  query?: string,
): Promise<void> {
  const config = await getConfig();

  if (!config.registry) {
    console.error(
      chalk.red("No registry configured. Run"),
      chalk.bold("skillz setup"),
      chalk.red("first."),
    );
    process.exit(1);
  }

  async function resolveDir(): Promise<string> {
    if (global && config.skillsDir) return config.skillsDir;
    if (global) return await promptSkillsDir(config);
    return await promptDir();
  }

  const skillsDir = await resolveDir();

  const url = new URL("/api/skills", config.registry);
  if (query) url.searchParams.set("q", query);

  const label = query
    ? `Searching for "${query}"...`
    : "Fetching all skills...";
  console.log(chalk.dim(label));

  let response: Response;
  try {
    response = await fetch(url.toString());
  } catch {
    console.error(chalk.red(`Failed to reach registry: ${config.registry}`));
    process.exit(1);
  }

  if (!response.ok) {
    console.error(chalk.red(`Registry error: ${response.status}`));
    process.exit(1);
  }

  const results = (await response.json()) as SkillResult[];

  if (results.length === 0) {
    console.log(
      query
        ? chalk.dim(`No skills found for "${query}"`)
        : chalk.dim("No skills in registry"),
    );
    return;
  }

  console.log(
    chalk.dim(
      `${results.length} skill${results.length === 1 ? "" : "s"} found\n`,
    ),
  );

  const selected = await checkbox({
    message: "Select skills to install",
    pageSize: 10,
    choices: results.map((r) => ({
      value: `${r.owner}/${r.name}`,
      name: `${r.owner}/${r.name}  ${chalk.dim(`v${r.version}`)}`,
      description: r.description,
    })),
  });

  if (selected.length === 0) {
    console.log(chalk.dim("Nothing installed."));
    return;
  }

  console.log();

  for (const slug of selected) {
    const [owner, name] = slug.split("/");
    if (!name) continue;
    const skill = results.find((r) => r.owner === owner && r.name === name);
    if (!skill) continue;

    const targetDir = join(skillsDir, name);
    await mkdir(targetDir, { recursive: true });
    const skillMdPath = join(targetDir, "SKILL.md");
    await writeFile(skillMdPath, skill.content, "utf-8");

    console.log(
      chalk.green(`Installed ${owner}/${name} to ${targetDir}`),
    );
  }

  console.log();
  console.log(
    chalk.green(
      `Installed ${selected.length} skill${selected.length === 1 ? "" : "s"}`,
    ),
  );
}

async function promptSkillsDir(config: SkillzConfig) {
  const dir = await input({
    message: "Where should skills be installed?",
    validate: (value: string) => {
      if (!value.trim()) return "Path is required";
      return true;
    },
  });
  await saveConfig({ ...config, skillsDir: dir });
  console.log(chalk.dim(`Saved to config: ${dir}`));
  console.log();
  return dir;
}

async function promptDir(): Promise<string> {
  return input({
    message: "Where should these skills be installed?",
    validate: (value: string) => {
      if (!value.trim()) return "Path is required";
      return true;
    },
  });
}
