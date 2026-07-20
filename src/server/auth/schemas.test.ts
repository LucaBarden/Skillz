import { describe, it, expect } from "vitest";
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  changeEmailSchema,
} from "./schemas";

describe("registerSchema", () => {
  it("accepts valid input", () => {
    const result = registerSchema.safeParse({
      username: "testuser",
      email: "test@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short username", () => {
    const result = registerSchema.safeParse({
      username: "ab",
      email: "test@example.com",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = registerSchema.safeParse({
      username: "testuser",
      email: "not-an-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = registerSchema.safeParse({
      username: "testuser",
      email: "test@example.com",
      password: "123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects username with special chars", () => {
    const result = registerSchema.safeParse({
      username: "user@name",
      email: "test@example.com",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects whitespace-only username", () => {
    const result = registerSchema.safeParse({
      username: "   ",
      email: "test@example.com",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts valid input", () => {
    const result = loginSchema.safeParse({
      username: "testuser",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty username", () => {
    const result = loginSchema.safeParse({ username: "", password: "pw" });
    expect(result.success).toBe(false);
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({
      username: "test",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("changePasswordSchema", () => {
  it("accepts valid input", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "oldpass123",
      newPassword: "newpass456",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short new password", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "oldpass123",
      newPassword: "123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects same old and new password", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "samepass123",
      newPassword: "samepass123",
    });
    expect(result.success).toBe(false);
  });
});

describe("changeEmailSchema", () => {
  it("accepts valid email", () => {
    const result = changeEmailSchema.safeParse({
      email: "new@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = changeEmailSchema.safeParse({ email: "bad" });
    expect(result.success).toBe(false);
  });
});
