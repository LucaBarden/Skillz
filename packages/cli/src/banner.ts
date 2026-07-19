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

export function bannerText(): string {
  const colored = art.map((line) => chalk.cyan(line)).join("\n");
  return `\n${colored}\n\n${chalk.dim(SUBTITLE)}\n`;
}

export function showBanner(): void {
  console.log(bannerText());
}
