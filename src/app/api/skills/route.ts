import { NextResponse } from "next/server";
import { like, or } from "drizzle-orm";
import { db } from "skillz/server/db";
import { skills } from "skillz/server/db/schema";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";

  if (!q.trim()) {
    const all = await db.query.skills.findMany({
      orderBy: (skills, { desc }) => [desc(skills.createdAt)],
    });
    return NextResponse.json(all);
  }

  const pattern = `%${q}%`;
  const results = await db.query.skills.findMany({
    where: or(like(skills.name, pattern), like(skills.description, pattern)),
    orderBy: (skills, { desc }) => [desc(skills.createdAt)],
  });

  return NextResponse.json(results);
}
