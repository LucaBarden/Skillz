"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { MDEditorProps } from "@uiw/react-md-editor";
import { api } from "skillz/trpc/react";

const MDEditor = dynamic<MDEditorProps>(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false },
);

export function MarkdownEditor() {
  const [owner, setOwner] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [version, setVersion] = useState("");
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const utils = api.useUtils();
  const publish = api.skill.create.useMutation({
    onSuccess: async (data) => {
      await utils.skill.invalidate();
      setContent("");
      setErrors({});
      const action = data.action === "updated" ? "Updated" : "Published";
      alert(`${action} skill: ${data.skill.owner}/${data.skill.name} (v${data.skill.version})`);
    },
    onError: (err) => {
      setErrors({ submit: err.message });
    },
  });

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!owner.trim()) e.owner = "Owner is required";
    if (!name.trim()) e.name = "Name is required";
    if (name.length > 100) e.name = "Name must be 100 characters or less";
    if (!description.trim()) e.description = "Description is required";
    if (description.length > 500) e.description = "Description must be 500 characters or less";
    if (!version.trim()) e.version = "Version is required";
    if (!/^\d+\.\d+\.\d+$/.test(version)) e.version = "Version must be semver (e.g. 1.0.0)";
    if (!content.trim()) e.content = "Content must not be empty";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePublish = () => {
    if (!validate()) return;
    publish.mutate({ owner: owner.trim(), name: name.trim(), description: description.trim(), version: version.trim(), content: content.trim() });
  };

  return (
    <div className="flex flex-col gap-6" data-color-mode="dark">
      <h1 className="text-xl font-semibold tracking-tight text-zinc-100">Publish a Skill</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Owner" value={owner} onChange={setOwner} error={errors.owner} placeholder="anomalyco" />
        <Field label="Name" value={name} onChange={setName} error={errors.name} placeholder="my-skill" />
      </div>

      <Field label="Description" value={description} onChange={setDescription} error={errors.description} placeholder="A short description of what this skill does" />

      <Field label="Version" value={version} onChange={setVersion} error={errors.version} placeholder="1.0.0" className="max-w-[200px]" />

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium tracking-wide text-zinc-400 uppercase">Content</label>
        <MDEditor
          value={content}
          onChange={(val) => setContent(val ?? "")}
          preview="edit"
          height={300}
          visibleDragbar={false}
          hideToolbar
        />
        {errors.content && <p className="text-xs text-red-400">{errors.content}</p>}
      </div>

      {errors.submit && (
        <p className="rounded-md border border-red-800 bg-red-950/40 px-3 py-2 text-sm text-red-400">{errors.submit}</p>
      )}

      <button
        onClick={handlePublish}
        disabled={publish.isPending}
        className="w-full rounded-md border border-zinc-600 bg-zinc-100 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {publish.isPending ? "Publishing..." : "Publish Skill"}
      </button>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  placeholder,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-xs font-medium tracking-wide text-zinc-400 uppercase">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`rounded-md border bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-zinc-500 ${error ? "border-red-700" : "border-zinc-700/80"}`}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
