/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { db } from "skillz/server/db";
import { serverConfig } from "skillz/server/config";
import { verifyToken } from "skillz/server/auth/jwt";
import { verifyApiKey } from "skillz/server/auth/apiKey";
import { findUserById } from "skillz/server/auth/db";

export interface AuthUser {
  id: number;
  username: string;
}

function parseCookie(cookieHeader: string, name: string): string | null {
  const reg = new RegExp(`(?:^|;\\s*)${name}=([^;]*)`);
  const match = reg.exec(cookieHeader);
  return match ? decodeURIComponent(match[1]!) : null;
}

async function extractAuth(headers: Headers): Promise<AuthUser | null> {
  const cookieHeader = headers.get("cookie");
  if (cookieHeader) {
    const token = parseCookie(cookieHeader, "skillz_token");
    if (token) {
      try {
        const payload = await verifyToken(token);
        const user = await findUserById(db, payload.userId);
        if (user) {
          return { id: user.id, username: user.username };
        }
      } catch { /* invalid token */ }
    }
  }

  const authHeader = headers.get("authorization");
  if (authHeader) {
    const parts = authHeader.split(" ");
    if (parts[0] === "Bearer" && parts[1]) {
      const key = parts[1];
      const prefix = key.substring(0, 11);
      const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.apiKeyPrefix, prefix),
      });
      if (user?.apiKeyHash) {
        const isValid = verifyApiKey(key, user.apiKeyHash);
        if (isValid) {
          return { id: user.id, username: user.username };
        }
      }
    }
  }

  return null;
}

/**
 * 1. CONTEXT
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const user = serverConfig.passwordAuth ? await extractAuth(opts.headers) : null;

  return {
    db,
    user,
    ...opts,
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Middleware for timing procedure execution and adding an artificial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    // artificial delay in dev
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure.use(timingMiddleware);

const enforceAuth = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(timingMiddleware).use(enforceAuth);
