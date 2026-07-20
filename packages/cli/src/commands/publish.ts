import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import chalk from "chalk";
import { parseSkillMd, skillPublishSchema } from "../../../shared/src/index.ts";
import { getConfig } from "../config.ts";

export async function publishCommand(skillMdPath: string): Promise<void> {
  // 1. Resolve and read file
  const filePath = resolve(skillMdPath);
  let raw: string;
  try {
    raw = await readFile(filePath, "utf-8");
  } catch {
    console.error(chalk.red(`Error: File not found: ${filePath}`));
    process.exit(1);
  }

  // 2. Parse frontmatter + body
  const parsed = parseSkillMd(raw);
  if ("error" in parsed) {
    console.error(chalk.red(`Error: ${parsed.error}`));
    process.exit(1);
  }

  // 3. Validate
  const result = skillPublishSchema.safeParse({
    name: parsed.frontmatter.name,
    description: parsed.frontmatter.description,
    version: parsed.frontmatter.version,
    owner: parsed.frontmatter.owner || "",
    content: parsed.body,
  });

  if (!result.success) {
    console.error(chalk.red("SKILL.md validation failed:"));
    for (const issue of result.error.issues) {
      console.error(chalk.dim(`  - ${issue.path.join(".")}: ${issue.message}`));
    }
    process.exit(1);
  }

  const input = result.data;

  // 4. Read registry URL
  const config = await getConfig();
  if (!config.registry) {
    console.error(chalk.red("No registry configured. Run"), chalk.bold("skillz setup"), chalk.red("first."));
    process.exit(1);
  }

  // 5. Publish to registry
  console.log(chalk.dim(`Publishing to ${config.registry}...`));

  try {
    const url = new URL("/api/publish", config.registry);
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (config.apiKey) {
      headers["Authorization"] = `Bearer ${config.apiKey}`;
    }
    const response = await fetch(url.toString(), {
      method: "POST",
      headers,
      body: JSON.stringify(input),
    });

    const json = await response.json() as { action?: string; skill?: { owner: string; name: string; version: string }; previousVersion?: string; error?: string };

    if (!response.ok) {
      console.error(chalk.red(`Registry error (${response.status}): ${json.error ?? "Unknown error"}`));
      process.exit(1);
    }

    if (!json.action || !json.skill) {
      console.error(chalk.red("Unexpected response from registry."));
      process.exit(1);
    }

    if (json.action === "updated") {
      console.log(chalk.green(`Updated skill: ${json.skill.owner}/${json.skill.name} (v${json.skill.version})`));
    } else {
      console.log(chalk.green(`Published skill: ${json.skill.owner}/${json.skill.name} (v${json.skill.version})`));
    }
  } catch (err) {
    console.error(chalk.red(`Failed to reach registry: ${config.registry}`));
    console.error(chalk.dim((err as Error).message));
    process.exit(1);
  }
}
