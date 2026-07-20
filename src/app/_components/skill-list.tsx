"use client";

import Link from "next/link";
import { api } from "skillz/trpc/react";

export function SkillList() {
  const [skills] = api.skill.getAll.useSuspenseQuery();

  return (
    <div className="w-full">
      {skills.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-500">
          No skills published yet.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-800">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/60">
                <th className="px-4 py-2.5 text-left text-xs font-medium tracking-wide text-zinc-500 uppercase">
                  Skill
                </th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium tracking-wide text-zinc-500 uppercase sm:table-cell">
                  Description
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-medium tracking-wide text-zinc-500 uppercase">
                  Version
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {skills.map((skill) => (
                <tr
                  key={skill.id}
                  className="bg-zinc-950/40 transition-colors hover:bg-zinc-900/60"
                >
                  <td className="relative px-4 py-3">
                    <span className="text-sm font-semibold text-zinc-100">
                      {skill.owner}/{skill.name}
                    </span>
                    <Link
                      href={`/skill/${skill.owner}/${skill.name}`}
                      className="absolute inset-0 z-10"
                      aria-label={`View ${skill.owner}/${skill.name}`}
                    />
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <span className="text-sm text-zinc-400">
                      {skill.description}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-mono text-xs text-zinc-500">
                      v{skill.version}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
