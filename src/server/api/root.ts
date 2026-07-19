import { skillRouter } from "skillz/server/api/routers/skill";
import { createCallerFactory, createTRPCRouter } from "skillz/server/api/trpc";

export const appRouter = createTRPCRouter({
  skill: skillRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
