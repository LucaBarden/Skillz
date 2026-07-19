import { Command } from "commander";
import { bannerText } from "./banner.js";
import { publishCommand } from "./commands/publish.js";
import { setupCommand } from "./commands/setup.js";

const program = new Command();

program
  .name("skillz")
  .description("The Open Source Skill Registry CLI")
  .version("0.1.0")
  .addHelpText("beforeAll", bannerText());

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
  .action(publishCommand);

program
  .command("setup")
  .description("Configure which Skillz registry to use")
  .action(setupCommand);

program.parse();
