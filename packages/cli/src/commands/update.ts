import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import chalk from "chalk";
import { parseSkillMd } from "../../../shared/src/index.js";
import { getConfig } from "../config.js";

function compareVersions(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] ?? 0;
    const nb = pb[i] ?? 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
}

interface SkillInfo {
  dirName: string;
  owner: string;
  name: string;
  version: string;
}

export async function updateCommand(): Promise<void> {
  const config = await getConfig();

  if (!config.registry) {
    console.error(
      chalk.red("No registry configured. Run"),
      chalk.bold("skillz setup"),
      chalk.red("first."),
    );
    process.exit(1);
  }

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

  const installed: SkillInfo[] = [];

  for (const dir of dirs) {
    const skillMdPath = join(config.skillsDir, dir.name, "SKILL.md");
    try {
      const raw = await readFile(skillMdPath, "utf-8");
      const parsed = parseSkillMd(raw);
      if ("error" in parsed) continue;

      const { owner, name, version } = parsed.frontmatter;
      if (!owner || !name || !version) continue;

      installed.push({ dirName: dir.name, owner, name, version });
    } catch {
      continue;
    }
  }

  if (installed.length === 0) {
    console.log(chalk.dim("No skills with valid SKILL.md found."));
    return;
  }

  console.log(chalk.dim(`Checking ${installed.length} skill${installed.length === 1 ? "" : "s"} for updates...\n`));

  let updated = 0;

  for (const skill of installed) {
    const url = new URL(
      `/api/skills/${encodeURIComponent(skill.owner)}/${encodeURIComponent(skill.name)}`,
      config.registry,
    );

    let response: Response;
    try {
      response = await fetch(url.toString());
    } catch {
      console.log(chalk.yellow(`⚠ ${skill.owner}/${skill.name}: failed to reach registry`));
      continue;
    }

    if (response.status === 404) {
      console.log(chalk.dim(`  ${skill.owner}/${skill.name}: not found in registry`));
      continue;
    }

    if (!response.ok) {
      console.log(chalk.yellow(`⚠ ${skill.owner}/${skill.name}: registry error ${response.status}`));
      continue;
    }

    const remote = await response.json() as { version: string; content: string };

    if (compareVersions(remote.version, skill.version) <= 0) {
      console.log(chalk.dim(`✓ ${skill.owner}/${skill.name}: up to date (v${skill.version})`));
      continue;
    }

    console.log(
      chalk.cyan(`↑ ${skill.owner}/${skill.name}: v${skill.version} → v${remote.version}`),
    );

    const targetDir = join(config.skillsDir!, skill.dirName);
    await mkdir(targetDir, { recursive: true });
    const skillMdPath = join(targetDir, "SKILL.md");
    await writeFile(skillMdPath, remote.content, "utf-8");
    updated++;
  }

  console.log();
  if (updated === 0) {
    console.log(chalk.green("All skills up to date."));
  } else {
    console.log(
      chalk.green(
        `Updated ${updated} skill${updated === 1 ? "" : "s"}`,
      ),
    );
  }
}
