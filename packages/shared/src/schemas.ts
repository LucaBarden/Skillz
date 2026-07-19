import { z } from "zod";

export const skillFrontmatterSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, "Version must be semver (e.g. 1.0.0)"),
});

export const skillPublishSchema = skillFrontmatterSchema.extend({
  owner: z.string().min(1).max(100),
  content: z.string().min(1, "Skill body must not be empty"),
});

export type SkillFrontmatter = z.infer<typeof skillFrontmatterSchema>;
export type SkillPublishInput = z.infer<typeof skillPublishSchema>;
