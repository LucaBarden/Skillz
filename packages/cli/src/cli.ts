import { Command } from "commander";
import { bannerText } from "./banner.ts";
import { addCommand } from "./commands/add.ts";
import { findCommand } from "./commands/find.ts";
import { listCommand } from "./commands/list.ts";
import { publishCommand } from "./commands/publish.ts";
import { removeCommand } from "./commands/remove.ts";
import { setupCommand } from "./commands/setup.ts";
import { updateCommand } from "./commands/update.ts";

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
  .option("-g, --global", "Install to global skills directory")
  .action((repo: string, opts: { global?: boolean }) => {
    const [owner, name] = repo.split("/");
    if (!owner || !name) {
      console.error(
        'Error: Invalid format. Expected "<owner/repo>" (e.g. "anomalyco/my-skill")',
      );
      process.exit(1);
    }
    addCommand(owner, name, opts.global ?? false);
  });

program
  .command("find")
  .description("Search for skills in the registry")
  .argument("[query]", "Search query (optional, shows all if omitted)")
  .option("-g, --global", "Install to global skills directory")
  .action((query: string | undefined, opts: { global?: boolean }) =>
    findCommand(opts.global ?? false, query),
  );

program
  .command("list")
  .alias("ls")
  .description("List installed skills")
  .action(listCommand);

program
  .command("remove")
  .alias("rm")
  .description("Remove installed skills")
  .action(removeCommand);

program
  .command("publish")
  .description("Publish a skill to the registry")
  .argument("<skill-md>", "Path to a SKILL.md file")
  .action(publishCommand);

program
  .command("setup")
  .description("Configure which Skillz registry to use")
  .action(setupCommand);

program
  .command("update")
  .alias("up")
  .description("Update installed skills to latest versions")
  .action(updateCommand);

program.parse();
