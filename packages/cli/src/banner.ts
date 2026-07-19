import chalk from "chalk";

const art = [
  "███████╗██╗  ██╗██╗██╗     ██╗     ███████╗",
  "██╔════╝██║ ██╔╝██║██║     ██║     ╚══███╔╝",
  "███████╗█████╔╝ ██║██║     ██║       ███╔╝",
  "╚════██║██╔═██╗ ██║██║     ██║      ███╔╝",
  "███████║██║  ██╗██║███████╗███████╗███████╗",
  "╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚══════╝",
];

const SUBTITLE = "The Open Source Skill Registry";

export function showBanner(): void {
  const colored = art.map((line) => chalk.cyan(line)).join("\n");
  console.log();
  console.log(colored);
  console.log();
  console.log(chalk.dim(SUBTITLE));
  console.log();
}
