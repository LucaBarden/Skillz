"use client";

import { useState, useCallback } from "react";

interface Skill {
  owner: string;
  name: string;
  description: string;
  version: string;
}

const PREVIEW_LINES = 20;

export function SkillDetail({ skill, html, contentLines }: { skill: Skill; html: string; contentLines: number }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const installCmd = `npx skillz add ${skill.owner}/${skill.name}`;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(installCmd);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }, [installCmd]);

  const showMore = contentLines > PREVIEW_LINES;
  const collapsed = !expanded && showMore;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
          {skill.owner}/{skill.name}
        </h1>
        <p className="mt-1 font-mono text-xs text-zinc-500">v{skill.version}</p>
      </div>

      <p className="text-sm leading-relaxed text-zinc-300">
        {skill.description}
      </p>

      <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-4">
        <p className="mb-2 text-xs font-medium tracking-wide text-zinc-500 uppercase">
          Install
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 rounded bg-zinc-900 px-3 py-2 text-sm text-zinc-200">
            <span className="text-zinc-500">$ </span>
            {installCmd}
          </code>
          <button
            onClick={handleCopy}
            className="shrink-0 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-zinc-300 transition hover:border-zinc-600 hover:text-zinc-100"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
          Skill.md
        </p>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/70">
          <div
            className={
              collapsed ? "relative max-h-[32rem] overflow-hidden p-6 pb-0" : "p-6"
            }
          >
            <div
              className="wmde-markdown"
              dangerouslySetInnerHTML={{ __html: html }}
            />
            {collapsed && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-zinc-950 to-transparent" />
            )}
          </div>
          {showMore && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full px-6 pb-4 pt-1 text-center text-sm font-medium text-zinc-400 transition hover:text-zinc-200"
            >
              {expanded ? "Show less ↑" : "Show more ↓"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
