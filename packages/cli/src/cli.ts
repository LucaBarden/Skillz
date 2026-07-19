import { Command } from "commander";
import { createInterface } from "node:readline/promises";
import { getConfig, saveConfig } from "./config.js";

const program = new Command();

program
  .name("skillz")
  .description("The Open Source Skill Registry CLI")
  .version("0.1.0");

program
  .command("add")
  .description("Add a skill from a Skillz Registry")
  .argument("<owner/repo>", "Owner and skill name (e.g. anomalyco/my-skill)")
  .action((repo: string) => {
    const [owner, name] = repo.split("/");
    if (!owner || !name) {
      console.error(
        'Error: Invalid format. Expected "<owner/repo>" (e.g. "anomalyco/my-skill")',
      );
      process.exit(1);
    }
    console.log("TODO: Implement Add");
    console.log(`  owner: ${owner}`);
    console.log(`  repo: ${name}`);
  });

program
  .command("publish")
  .description("Publish a skill to the registry")
  .argument("<skill-md>", "Path to a SKILL.md file")
  .action((skillMd: string) => {
    console.log("TODO: Implement Publish");
    console.log(`  file: ${skillMd}`);
  });

program
  .command("setup")
  .description("Configure which Skillz registry to use")
  .action(async () => {
    const existing = await getConfig();
    const rl = createInterface({ input: process.stdin, output: process.stdout });

    console.log("Skillz Setup\n");

    const prompt = existing.registry
      ? `Registry URL [${existing.registry}]: `
      : "Registry URL: ";

    const answer = await rl.question(prompt);
    rl.close();

    const registry = answer.trim() || existing.registry;

    if (!registry) {
      console.log("\nSetup cancelled. No registry URL provided.");
      return;
    }

    await saveConfig({ ...existing, registry });

    console.log(`\nSaved! Registry set to: ${registry}`);
  });

program.parse();
