import { HydrateClient } from "skillz/trpc/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { MarkdownEditor } from "skillz/app/_components/markdown-editor";
import { serverConfig } from "skillz/server/config";
import { verifyToken } from "skillz/server/auth/jwt";

export default async function PublishPage() {
  if (serverConfig.loginRequired) {
    const cookieStore = await cookies();
    const token = cookieStore.get("skillz_token")?.value;
    if (!token) {
      redirect("/login");
    }
    try {
      await verifyToken(token);
    } catch {
      redirect("/login");
    }
  }

  return (
    <HydrateClient>
      <main className="min-h-screen bg-[#090a0d] font-mono text-zinc-100">
        <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
          <MarkdownEditor />
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-xs text-zinc-500 underline decoration-zinc-600 underline-offset-2 transition hover:text-zinc-300"
            >
              ← Back to registry
            </Link>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
