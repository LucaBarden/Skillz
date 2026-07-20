import { describe, it, expect } from "vitest";
import { generateApiKey, hashApiKey, verifyApiKey } from "./apiKey";

describe("generateApiKey", () => {
  it("returns prefix and raw key", () => {
    const { prefix, raw } = generateApiKey();
    expect(prefix).toMatch(/^skz_/);
    expect(prefix.length).toBeGreaterThan(6);
    expect(raw).toMatch(/^skz_/);
    expect(raw.length).toBeGreaterThan(20);
  });
});

describe("hashApiKey", () => {
  it("returns a hex string", () => {
    const hash = hashApiKey("skz_abc123");
    expect(hash).toMatch(/^[a-f0-9]+$/);
    expect(hash.length).toBe(64);
  });
});

describe("verifyApiKey", () => {
  it("returns true for matching key", () => {
    const hash = hashApiKey("skz_abc123");
    expect(verifyApiKey("skz_abc123", hash)).toBe(true);
  });

  it("returns false for wrong key", () => {
    const hash = hashApiKey("skz_abc123");
    expect(verifyApiKey("skz_wrong", hash)).toBe(false);
  });

  it("returns false for null hash", () => {
    expect(verifyApiKey("skz_abc", null)).toBe(false);
  });
});
