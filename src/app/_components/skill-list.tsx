"use client";

import { api } from "skillz/trpc/react";

export function SkillList() {
  const [skills] = api.skill.getAll.useSuspenseQuery();

  return (
    <div className="w-full max-w-md">
      {skills.length === 0 ? (
        <p className="text-sm text-zinc-400">No skills published yet.</p>
      ) : (
        <ul className="divide-y divide-zinc-800">
          {skills.map((skill) => (
            <li key={skill.id} className="py-2 first:pt-0 last:pb-0">
              <p className="text-sm font-semibold text-zinc-100">
                {skill.owner}/{skill.name}
              </p>
              <p className="text-xs text-zinc-400">{skill.description}</p>
              <p className="mt-0.5 font-mono text-[10px] text-zinc-500">
                v{skill.version}
              </p>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4">
        <a
          href="/publish"
          className="text-xs text-zinc-500 underline decoration-zinc-600 underline-offset-2 transition hover:text-zinc-300"
        >
          Publish a skill →
        </a>
      </div>
    </div>
  );
}
