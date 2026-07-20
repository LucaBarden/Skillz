"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface User {
  id: number;
  username: string;
  email: string;
  apiKeyPrefix: string | null;
}

interface MeResponse { user: User }
interface ErrorResponse { error?: string }

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [emailMsg, setEmailMsg] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");

  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [keyMsg, setKeyMsg] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => {
        if (!r.ok) throw new Error("Not authenticated");
        return r.json() as Promise<MeResponse>;
      })
      .then((d) => {
        setUser(d.user);
        setEmail(d.user.email);
      })
      .catch(() => setError("Not authenticated"))
      .finally(() => setLoading(false));
  }, []);

  async function handleChangeEmail(e: React.FormEvent) {
    e.preventDefault();
    setEmailMsg("");
    const res = await fetch("/api/auth/change-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (res.ok) {
      setEmailMsg("Email updated.");
      setUser((u) => (u ? { ...u, email } : null));
    } else {
      const d = await res.json() as ErrorResponse;
      setEmailMsg(typeof d.error === "string" ? d.error : "Failed");
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMsg("");
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    if (res.ok) {
      setPasswordMsg("Password changed.");
      setCurrentPassword("");
      setNewPassword("");
    } else {
      const d = await res.json() as ErrorResponse;
      setPasswordMsg(typeof d.error === "string" ? d.error : "Failed");
    }
  }

  async function handleGenerateKey() {
    setKeyMsg("");
    const res = await fetch("/api/auth/generate-api-key", { method: "POST" });
    if (res.ok) {
      const d = await res.json() as { apiKey: string; apiKeyPrefix: string };
      setGeneratedKey(d.apiKey);
      setUser((u) => (u ? { ...u, apiKeyPrefix: d.apiKeyPrefix } : null));
      setKeyMsg("Key generated. Copy it now — it won't be shown again.");
    } else {
      setKeyMsg("Failed to generate key.");
    }
  }

  async function handleRevokeKey() {
    setKeyMsg("");
    const res = await fetch("/api/auth/revoke-api-key", { method: "POST" });
    if (res.ok) {
      setGeneratedKey(null);
      setUser((u) => (u ? { ...u, apiKeyPrefix: null } : null));
      setKeyMsg("API key revoked.");
    } else {
      setKeyMsg("Failed to revoke key.");
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#090a0d] text-zinc-400 font-mono">
        Loading...
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#090a0d] font-mono text-zinc-100">
        <div className="text-center">
          <p className="text-zinc-400">{error}</p>
          <Link href="/login" className="mt-4 inline-block text-sm text-zinc-300 underline hover:text-zinc-100">
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#090a0d] font-mono text-zinc-100">
      <div className="mx-auto max-w-lg px-4 py-12">
        <div className="mb-8">
          <h1 className="text-lg font-semibold">{user.username}</h1>
          <p className="text-xs text-zinc-500">{user.email}</p>
        </div>

        <div className="space-y-8">
          <section className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-6">
            <h2 className="mb-4 text-sm font-medium text-zinc-300">Change Email</h2>
            <form onSubmit={handleChangeEmail} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-zinc-500"
                required
              />
              <div className="flex items-center justify-between">
                <button type="submit" className="rounded bg-zinc-700 px-4 py-1.5 text-xs font-medium hover:bg-zinc-600">
                  Update Email
                </button>
                {emailMsg && <span className="text-xs text-zinc-400">{emailMsg}</span>}
              </div>
            </form>
          </section>

          <section className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-6">
            <h2 className="mb-4 text-sm font-medium text-zinc-300">Change Password</h2>
            <form onSubmit={handleChangePassword} className="space-y-3">
              <input
                type="password"
                placeholder="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-zinc-500"
                required
              />
              <input
                type="password"
                placeholder="New password (8+ chars)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-zinc-500"
                required
                minLength={8}
              />
              <div className="flex items-center justify-between">
                <button type="submit" className="rounded bg-zinc-700 px-4 py-1.5 text-xs font-medium hover:bg-zinc-600">
                  Change Password
                </button>
                {passwordMsg && <span className="text-xs text-zinc-400">{passwordMsg}</span>}
              </div>
            </form>
          </section>

          <section className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-6">
            <h2 className="mb-4 text-sm font-medium text-zinc-300">API Key</h2>
            {user.apiKeyPrefix ? (
              <div className="space-y-3">
                <p className="text-xs text-zinc-500">
                  Key: <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-300">{user.apiKeyPrefix}...</code>
                </p>
                <button onClick={handleRevokeKey} className="rounded bg-red-900/50 px-4 py-1.5 text-xs font-medium text-red-300 hover:bg-red-900/80">
                  Revoke Key
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-zinc-500">No API key configured.</p>
                <button onClick={handleGenerateKey} className="rounded bg-zinc-700 px-4 py-1.5 text-xs font-medium hover:bg-zinc-600">
                  Generate Key
                </button>
              </div>
            )}
            {generatedKey && (
              <div className="mt-4 rounded border border-zinc-700 bg-zinc-900 p-3">
                <p className="mb-1 text-xs text-zinc-400">{keyMsg}</p>
                <code className="break-all text-xs text-zinc-200">{generatedKey}</code>
              </div>
            )}
            {keyMsg && !generatedKey && <p className="mt-2 text-xs text-zinc-400">{keyMsg}</p>}
          </section>

          <div className="text-center">
            <form action="/api/auth/logout" method="POST">
              <button type="submit" className="text-xs text-zinc-500 underline hover:text-zinc-300">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
