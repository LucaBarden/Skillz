import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";

import { skillPublishSchema } from "@skillz/shared";
import { createTRPCRouter, publicProcedure } from "skillz/server/api/trpc";
import { skills } from "skillz/server/db/schema";
import { serverConfig } from "skillz/server/config";
import { TRPCError } from "@trpc/server";

export const skillRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: publicProcedure
    .input(skillPublishSchema)
    .mutation(async ({ ctx, input }) => {
      if (serverConfig.loginRequired && !ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      if (ctx.user) {
        if (input.owner !== ctx.user.username) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Owner must match your username",
          });
        }
      }

      const existing = await ctx.db.query.skills.findFirst({
        where: and(eq(skills.owner, input.owner), eq(skills.name, input.name)),
      });

      if (existing) {
        await ctx.db
          .update(skills)
          .set({
            description: input.description,
            version: input.version,
            content: input.content,
            updatedAt: new Date(),
          })
          .where(eq(skills.id, existing.id));

        return {
          action: "updated" as const,
          previousVersion: existing.version,
          skill: { owner: input.owner, name: input.name, version: input.version },
        };
      }

      await ctx.db.insert(skills).values({
        owner: input.owner,
        name: input.name,
        description: input.description,
        version: input.version,
        content: input.content,
      });

      return {
        action: "created" as const,
        skill: { owner: input.owner, name: input.name, version: input.version },
      };
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    const all = await ctx.db.query.skills.findMany({
      orderBy: desc(skills.createdAt),
    });
    return all;
  }),

  get: publicProcedure
    .input(z.object({ owner: z.string(), name: z.string() }))
    .query(async ({ ctx, input }) => {
      const skill = await ctx.db.query.skills.findFirst({
        where: and(eq(skills.owner, input.owner), eq(skills.name, input.name)),
      });
      return skill ?? null;
    }),
});
