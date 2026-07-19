import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "skillz/server/db";
import { skills } from "skillz/server/db/schema";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ owner: string; name: string }> }
) {
  const { owner, name } = await params;
  const skill = await db.query.skills.findFirst({
    where: and(eq(skills.owner, owner), eq(skills.name, name)),
  });

  if (!skill) {
    return NextResponse.json({ error: "Skill not found" }, { status: 404 });
  }

  return NextResponse.json({
    owner: skill.owner,
    name: skill.name,
    description: skill.description,
    version: skill.version,
    content: skill.content,
  });
}
