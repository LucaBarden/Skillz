"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function AuthNav() {
  const [user, setUser] = useState<{ username: string } | null | undefined>(
    undefined,
  );

  useEffect(() => {
    interface MeResponse { user: { username: string } | null }
    fetch("/api/auth/me")
      .then((r) => (r.ok ? (r.json() as Promise<MeResponse>) : null))
      .then((d) => setUser(d?.user ?? null))
      .catch(() => setUser(null));
  }, []);

  return (
    <nav className="border-b border-zinc-800 bg-zinc-950/50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-sm font-semibold text-zinc-200">
          SKILLZ
        </Link>
        <div className="flex items-center gap-4 text-xs text-zinc-400">
          <Link href="/publish" className="hover:text-zinc-200">
            Publish
          </Link>
          {user === undefined ? null : user ? (
            <Link href="/profile" className="hover:text-zinc-200">
              {user.username}
            </Link>
          ) : (
            <>
              <Link href="/login" className="hover:text-zinc-200">
                Sign in
              </Link>
              <Link href="/register" className="hover:text-zinc-200">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
