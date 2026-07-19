import Link from "next/link";
import { marked } from "marked";
import { api } from "skillz/trpc/server";
import { SkillDetail } from "skillz/app/_components/skill-detail";

export default async function SkillPage({
  params,
}: {
  params: Promise<{ owner: string; name: string }>;
}) {
  const { owner, name } = await params;
  const skill = await api.skill.get({ owner, name });

  if (!skill) {
    return (
      <main className="min-h-screen bg-[#090a0d] font-mono text-zinc-100">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-12">
          <p className="text-sm text-zinc-400">Skill not found.</p>
          <Link
            href="/"
            className="text-xs text-zinc-500 underline decoration-zinc-600 underline-offset-2 transition hover:text-zinc-300"
          >
            ← Back to registry
          </Link>
        </div>
      </main>
    );
  }

  const html = await marked(skill.content);

  return (
    <main className="min-h-screen bg-[#090a0d] font-mono text-zinc-100">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <Link
          href="/"
          className="text-xs text-zinc-500 underline decoration-zinc-600 underline-offset-2 transition hover:text-zinc-300"
        >
          ← Back to registry
        </Link>
        <SkillDetail skill={skill} html={html} contentLines={skill.content.split("\n").length} />
      </div>
    </main>
  );
}
