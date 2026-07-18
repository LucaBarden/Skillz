import { Command } from "commander";

const program = new Command();

program
  .name("skillz")
  .description("The Open Source Skill Registry CLI")
  .version("0.1.0");

program
  .command("add")
  .description("Add a skill from a GitHub repository")
  .argument("<owner/repo>", "Owner and repository name (e.g. anomalyco/my-skill)")
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

program.parse();
