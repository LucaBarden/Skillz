import { SkillList } from "skillz/app/_components/skill-list";
import { api, HydrateClient } from "skillz/trpc/server";

export default async function Home() {
  void api.skill.getAll.prefetch();

  return (
    <HydrateClient>
      <main className="min-h-screen bg-[#090a0d] font-mono text-zinc-100">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <section className="grid grid-cols-1 gap-8 lg:grid-cols-[auto_1fr] lg:gap-14">
            <div className="flex flex-col gap-4">
              <pre className="select-none overflow-x-auto text-[11px] leading-[1.15] tracking-[-0.06em] text-zinc-400 sm:text-[13px] lg:text-[15px]">
                {`███████╗██╗  ██╗██╗██╗     ██╗     ███████╗
██╔════╝██║ ██╔╝██║██║     ██║     ╚══███╔╝
███████╗█████╔╝ ██║██║     ██║       ███╔╝
╚════██║██╔═██╗ ██║██║     ██║      ███╔╝
███████║██║  ██╗██║███████╗███████╗███████╗
╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚══════╝`}
              </pre>
              <p className="text-center text-sm font-medium tracking-wide text-zinc-200 uppercase lg:text-left">
                The Open Source Skill Registry
              </p>
            </div>

            <div className="flex flex-col gap-7">
              <p className="max-w-3xl text-lg leading-tight tracking-tight text-zinc-300 sm:text-2xl lg:text-3xl">
                Skills are reusable capabilities for AI agents. Install with a
                single command and compose your ideal workflow.
              </p>

              <div className="w-full max-w-md rounded-md border border-zinc-800 bg-zinc-950/70 px-4 py-3">
                <p className="mb-2 text-xs tracking-wide text-zinc-500 uppercase">
                  Try it now
                </p>
                <code className="text-sm text-zinc-100">
                  <span className="text-zinc-500">$ </span>
                  npx skillz add &lt;owner/repo&gt;
                </code>
              </div>

              <a
                href="/publish"
                className="text-xs text-zinc-500 underline decoration-zinc-600 underline-offset-2 transition hover:text-zinc-300"
              >
                Publish a skill →
              </a>
            </div>
          </section>

          <section className="w-full">
            <p className="mb-4 text-xs font-medium tracking-wide text-zinc-500 uppercase">
              Skills
            </p>
            <SkillList />
          </section>
        </div>
      </main>
    </HydrateClient>
  );
}
