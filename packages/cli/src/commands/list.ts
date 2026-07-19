import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import chalk from "chalk";
import { parseSkillMd } from "../../../shared/src/index.js";
import type { ParseResult } from "../../../shared/src/index.js";
import { getConfig } from "../config.js";

export async function listCommand(): Promise<void> {
  const config = await getConfig();

  if (!config.skillsDir) {
    console.error(
      chalk.red("No skills directory configured. Run"),
      chalk.bold("skillz setup"),
      chalk.red("first."),
    );
    process.exit(1);
  }

  let entries: { name: string }[];
  try {
    entries = await readdir(config.skillsDir, { withFileTypes: true });
  } catch {
    console.error(
      chalk.red(`Skills directory not found: ${config.skillsDir}`),
    );
    process.exit(1);
  }

  const dirs = entries.filter((e) => e.isDirectory());

  if (dirs.length === 0) {
    console.log(chalk.dim("No skills installed."));
    return;
  }

  const skills: { name: string; description?: string; version?: string; owner?: string }[] = [];

  for (const dir of dirs) {
    const skillMdPath = join(config.skillsDir, dir.name, "SKILL.md");
    try {
      const raw = await readFile(skillMdPath, "utf-8");
      const parsed = parseSkillMd(raw);
      if ("error" in parsed) {
        skills.push({ name: dir.name });
      } else {
        skills.push({
          name: parsed.frontmatter.name ?? dir.name,
          description: parsed.frontmatter.description,
          version: parsed.frontmatter.version,
          owner: parsed.frontmatter.owner,
        });
      }
    } catch {
      skills.push({ name: dir.name });
    }
  }

  for (const skill of skills) {
    console.log(chalk.cyan.bold(skill.name));
    if (skill.description) {
      console.log(chalk.dim(`  ${skill.description}`));
    }
    if (skill.version) {
      console.log(chalk.dim(`  v${skill.version}`));
    }
    console.log();
  }

  console.log(
    chalk.dim(
      `${skills.length} skill${skills.length === 1 ? "" : "s"} installed in ${config.skillsDir}`,
    ),
  );
}
