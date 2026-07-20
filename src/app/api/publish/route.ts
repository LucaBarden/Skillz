import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { skillPublishSchema } from "@skillz/shared";
import { db } from "skillz/server/db";
import { skills } from "skillz/server/db/schema";
import { serverConfig } from "skillz/server/config";
import { verifyApiKey } from "skillz/server/auth/apiKey";

async function authenticate(req: Request): Promise<string | null> {
  if (!serverConfig.passwordAuth || !serverConfig.loginRequired) {
    return null;
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;

  const parts = authHeader.split(" ");
  if (parts[0] !== "Bearer" || !parts[1]) return null;

  const key = parts[1];
  const prefix = key.substring(0, 11);
  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.apiKeyPrefix, prefix),
  });
  if (!user?.apiKeyHash) return null;

  const valid = verifyApiKey(key, user.apiKeyHash);
  if (!valid) return null;

  return user.username;
}

export async function POST(req: Request) {
  const username = await authenticate(req);
  if (serverConfig.loginRequired && !username) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const result = skillPublishSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        issues: result.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      },
      { status: 400 },
    );
  }

  const input = result.data;

  if (username && input.owner !== username) {
    return NextResponse.json(
      { error: "Owner must match your username" },
      { status: 403 },
    );
  }

  const existing = await db.query.skills.findFirst({
    where: and(eq(skills.owner, input.owner), eq(skills.name, input.name)),
  });

  if (existing) {
    await db
      .update(skills)
      .set({
        description: input.description,
        version: input.version,
        content: input.content,
        updatedAt: new Date(),
      })
      .where(eq(skills.id, existing.id));

    return NextResponse.json({
      action: "updated",
      previousVersion: existing.version,
      skill: { owner: input.owner, name: input.name, version: input.version },
    });
  }

  await db.insert(skills).values({
    owner: input.owner,
    name: input.name,
    description: input.description,
    version: input.version,
    content: input.content,
  });

  return NextResponse.json({
    action: "created",
    skill: { owner: input.owner, name: input.name, version: input.version },
  });
}
