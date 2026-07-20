import { randomUUID } from "node:crypto";
import { createHash } from "node:crypto";

export function generateApiKey(): { prefix: string; raw: string } {
  const uuid = randomUUID().replace(/-/g, "");
  const raw = `skz_${uuid}`;
  const prefix = raw.slice(0, 11);
  return { prefix, raw };
}

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export function verifyApiKey(key: string, hash: string | null): boolean {
  if (!hash) return false;
  return hashApiKey(key) === hash;
}
