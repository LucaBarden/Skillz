import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("hashPassword", () => {
  it("returns a string hash", async () => {
    const hash = await hashPassword("mypassword");
    expect(typeof hash).toBe("string");
    expect(hash.length).toBeGreaterThan(10);
  });

  it("produces different hashes for same password", async () => {
    const a = await hashPassword("same");
    const b = await hashPassword("same");
    expect(a).not.toBe(b);
  });
});

describe("verifyPassword", () => {
  it("returns true for matching password", async () => {
    const hash = await hashPassword("correct");
    const match = await verifyPassword("correct", hash);
    expect(match).toBe(true);
  });

  it("returns false for wrong password", async () => {
    const hash = await hashPassword("correct");
    const match = await verifyPassword("wrong", hash);
    expect(match).toBe(false);
  });
});
