export { skillFrontmatterSchema, skillPublishSchema } from "./schemas";
export type { SkillFrontmatter, SkillPublishInput } from "./schemas";
export { parseSkillMd } from "./parse";
export type { ParseResult, ParseError } from "./parse";

export interface SkillManifest {
  name: string;
  description: string;
  version: string;
  owner: string;
  repo: string;
  files: string[];
}
