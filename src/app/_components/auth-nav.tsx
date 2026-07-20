"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function AuthNav() {
  const [user, setUser] = useState<{ username: string } | null | undefined>(
    undefined,
  );
  const [authEnabled, setAuthEnabled] = useState(false);

  const [loginRequired, setLoginRequired] = useState(false);

  useEffect(() => {
    interface MeResponse { user: { username: string } | null }
    interface StatusResponse { passwordAuth: boolean; loginRequired: boolean }

    Promise.all([
      fetch("/api/auth/me"),
      fetch("/api/auth/status"),
    ]).then(([meRes, statusRes]) => {
      if (statusRes.ok) {
        void statusRes.json()
          .then((s: StatusResponse) => {
            setAuthEnabled(s.passwordAuth);
            setLoginRequired(s.loginRequired);
          });
      }
      if (meRes.ok) {
        return meRes.json() as Promise<MeResponse>;
      }
      return null;
    }).then((d) => setUser(d?.user ?? null))
      .catch(() => setUser(null));
  }, []);

  const showPublish = !loginRequired || user !== null && user !== undefined;

  return (
    <nav className="border-b border-zinc-800 bg-zinc-950/50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-sm font-semibold text-zinc-200">
          SKILLZ
        </Link>
        <div className="flex items-center gap-4 text-xs text-zinc-400">
          {showPublish && (
            <Link href="/publish" className="hover:text-zinc-200">
              Publish
            </Link>
          )}
          {user === undefined ? null : user ? (
            <Link href="/profile" className="hover:text-zinc-200">
              {user.username}
            </Link>
          ) : authEnabled ? (
            <>
              <Link href="/login" className="hover:text-zinc-200">
                Sign in
              </Link>
              <Link href="/register" className="hover:text-zinc-200">
                Register
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
