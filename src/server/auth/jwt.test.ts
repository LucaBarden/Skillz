import { describe, it, expect } from "vitest";
import { createToken, verifyToken } from "./jwt";

describe("createToken", () => {
  it("creates a string token from a payload", async () => {
    const token = await createToken({ userId: 1, username: "test" });
    expect(typeof token).toBe("string");
    expect(token.split(".").length).toBe(3);
  });
});

describe("verifyToken", () => {
  it("returns payload for a valid token", async () => {
    const token = await createToken({ userId: 7, username: "alice" });
    const payload = await verifyToken(token);
    expect(payload.userId).toBe(7);
    expect(payload.username).toBe("alice");
  });

  it("throws on invalid token", async () => {
    await expect(verifyToken("garbage")).rejects.toThrow();
  });

  it("throws on tampered token", async () => {
    const parts = (await createToken({ userId: 1, username: "test" })).split(".");
    parts[1] = Buffer.from(JSON.stringify({ userId: 999 })).toString("base64url");
    await expect(verifyToken(parts.join("."))).rejects.toThrow();
  });

  it("throws on expired token", async () => {
    const token = await createToken({ userId: 1, username: "test" }, "0s");
    await expect(verifyToken(token)).rejects.toThrow();
  });
});
