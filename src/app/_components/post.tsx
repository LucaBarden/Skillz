"use client";

import { useState } from "react";

import { api } from "skillz/trpc/react";

export function LatestPost() {
  const [latestPost] = api.post.getLatest.useSuspenseQuery();

  const utils = api.useUtils();
  const [name, setName] = useState("");
  const createPost = api.post.create.useMutation({
    onSuccess: async () => {
      await utils.post.invalidate();
      setName("");
    },
  });

  return (
    <div className="w-full max-w-md">
      {latestPost ? (
        <p className="truncate text-sm text-zinc-300">
          Latest entry: <span className="text-zinc-100">{latestPost.name}</span>
        </p>
      ) : (
        <p className="text-sm text-zinc-400">No skills added yet.</p>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          createPost.mutate({ name });
        }}
        className="mt-3 flex flex-col gap-3"
      >
        <input
          type="text"
          placeholder="Skill name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border border-zinc-700/80 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-zinc-500"
        />
        <button
          type="submit"
          className="rounded-md border border-zinc-600 bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-white"
          disabled={createPost.isPending}
        >
          {createPost.isPending ? "Adding..." : "Add skill"}
        </button>
      </form>
    </div>
  );
}
