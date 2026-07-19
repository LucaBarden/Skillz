export { skillFrontmatterSchema, skillPublishSchema } from "./schemas.js";
export type { SkillFrontmatter, SkillPublishInput } from "./schemas.js";
export { parseSkillMd } from "./parse.js";
export type { ParseResult, ParseError } from "./parse.js";

export interface SkillManifest {
  name: string;
  description: string;
  version: string;
  owner: string;
  repo: string;
  files: string[];
}
