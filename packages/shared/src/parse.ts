export interface ParseResult {
  frontmatter: Record<string, string>;
  body: string;
}

export interface ParseError {
  error: string;
}

export function parseSkillMd(raw: string): ParseResult | ParseError {
  const trimmed = raw.trimStart();

  if (!trimmed.startsWith("---")) {
    return { error: "SKILL.md must start with YAML frontmatter (---)" };
  }

  const endIndex = trimmed.indexOf("\n---", 3);
  if (endIndex === -1) {
    return { error: "Missing closing --- for frontmatter" };
  }

  const frontmatterBlock = trimmed.slice(4, endIndex).trim();
  const body = trimmed.slice(endIndex + 4).trim();

  if (!body) {
    return { error: "Skill body must not be empty" };
  }

  const frontmatter: Record<string, string> = {};

  for (const line of frontmatterBlock.split("\n")) {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;

    const key = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim();

    if (key && value) {
      frontmatter[key] = value;
    }
  }

  return { frontmatter, body };
}
