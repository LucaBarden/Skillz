import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { skillPublishSchema } from "@skillz/shared";
import { db } from "skillz/server/db";
import { skills } from "skillz/server/db/schema";

export async function POST(req: Request) {
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
