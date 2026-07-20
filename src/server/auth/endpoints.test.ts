import { describe, it, expect, beforeAll, vi } from "vitest";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "skillz/server/db/schema";

interface AuthJson {
  user?: {
    id: number;
    username: string;
    email: string;
    passwordHash?: string;
    apiKeyPrefix: string | null;
  } | null;
  token?: string;
  apiKey?: string;
  apiKeyPrefix?: string;
  error?: string;
  ok?: boolean;
  passwordAuth?: boolean;
  loginRequired?: boolean;
}

const client = createClient({ url: ":memory:" });
const testDb = drizzle(client, { schema });

let mockCookieValue: string | null = null;

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    set: vi.fn((_name: string, value: string) => {
      mockCookieValue = value;
    }),
    delete: vi.fn(() => {
      mockCookieValue = null;
    }),
    get: vi.fn(() =>
      mockCookieValue ? { name: "skillz_token", value: mockCookieValue } : undefined,
    ),
  })),
}));

let mockDb: typeof testDb;
vi.mock("skillz/server/db", () => ({
  get db() {
    return mockDb;
  },
}));

async function setupDb() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS skillz_user (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL,
      passwordHash TEXT NOT NULL,
      apiKeyHash TEXT,
      apiKeyPrefix TEXT,
      createdAt INTEGER NOT NULL DEFAULT (unixepoch()),
      updatedAt INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `);
  await client.execute(`DELETE FROM skillz_user`);
}

beforeAll(async () => {
  mockDb = testDb;
  await setupDb();
});

function createRequest(path: string, method: string, body?: unknown): Request {
  return new Request(`http://localhost${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
}

const authEndpoints = await import("./endpoints");

describe("POST /api/auth/register", () => {
  it("creates a new user and returns user data", async () => {
    await setupDb();
    const res = await authEndpoints.POST_register(createRequest("/api/auth/register", "POST", {
      username: "newuser",
      email: "new@example.com",
      password: "password123",
    }));
    expect(res.status).toBe(201);
    const json = (await res.json()) as AuthJson;
    expect(json.user!.username).toBe("newuser");
    expect(json.user!.email).toBe("new@example.com");
    expect(json.user!.passwordHash).toBeUndefined();
    expect(json.token).toBeDefined();
  });

  it("returns 400 for invalid input", async () => {
    const res = await authEndpoints.POST_register(createRequest("/api/auth/register", "POST", {
      username: "ab",
      email: "bad",
      password: "123",
    }));
    expect(res.status).toBe(400);
  });

  it("returns 409 for duplicate username", async () => {
    await authEndpoints.POST_register(createRequest("/api/auth/register", "POST", {
      username: "dup",
      email: "dup@example.com",
      password: "password123",
    }));
    const res = await authEndpoints.POST_register(createRequest("/api/auth/register", "POST", {
      username: "dup",
      email: "other@example.com",
      password: "password123",
    }));
    expect(res.status).toBe(409);
  });
});

describe("POST /api/auth/login", () => {
  beforeAll(async () => {
    await setupDb();
    await authEndpoints.POST_register(createRequest("/api/auth/register", "POST", {
      username: "loginuser",
      email: "login@example.com",
      password: "password123",
    }));
  });

  it("returns token for valid credentials", async () => {
    const res = await authEndpoints.POST_login(createRequest("/api/auth/login", "POST", {
      username: "loginuser",
      password: "password123",
    }));
    expect(res.status).toBe(200);
    const json = (await res.json()) as AuthJson;
    expect(json.token).toBeDefined();
  });

  it("returns 401 for wrong password", async () => {
    const res = await authEndpoints.POST_login(createRequest("/api/auth/login", "POST", {
      username: "loginuser",
      password: "wrongpassword",
    }));
    expect(res.status).toBe(401);
  });

  it("returns 401 for non-existent username", async () => {
    const res = await authEndpoints.POST_login(createRequest("/api/auth/login", "POST", {
      username: "nobody",
      password: "password123",
    }));
    expect(res.status).toBe(401);
  });
});

describe("GET /api/auth/status", () => {
  it("returns auth config from serverConfig", async () => {
    const res = await authEndpoints.GET_status();
    expect(res.status).toBe(200);
    const json = (await res.json()) as AuthJson;
    expect(typeof json.passwordAuth).toBe("boolean");
    expect(typeof json.loginRequired).toBe("boolean");
  });
});

describe("GET /api/auth/me", () => {
  beforeAll(async () => {
    await setupDb();
    await authEndpoints.POST_register(createRequest("/api/auth/register", "POST", {
      username: "meuser",
      email: "me@example.com",
      password: "password123",
    }));
  });

  it("returns user info for valid token", async () => {
    const loginRes = await authEndpoints.POST_login(createRequest("/api/auth/login", "POST", {
      username: "meuser",
      password: "password123",
    }));
    const { token } = (await loginRes.json()) as AuthJson;
    void token;

    const res = await authEndpoints.GET_me(token!);
    expect(res.status).toBe(200);
    const json = (await res.json()) as AuthJson;
    expect(json.user!.username).toBe("meuser");
    expect(json.user!.email).toBe("me@example.com");
    expect(json.user!.passwordHash).toBeUndefined();
    expect(json.user!.apiKeyPrefix).toBeNull();
  });

  it("returns 401 when no token provided", async () => {
    const res = await authEndpoints.GET_me(null);
    expect(res.status).toBe(401);
  });

  it("returns 401 for invalid token", async () => {
    const res = await authEndpoints.GET_me("bogus.token.here");
    expect(res.status).toBe(401);
  });
});

describe("POST /api/auth/change-password", () => {
  beforeAll(async () => {
    await setupDb();
    await authEndpoints.POST_register(createRequest("/api/auth/register", "POST", {
      username: "pwuser",
      email: "pw@example.com",
      password: "oldpassword",
    }));
  });

  it("changes password successfully", async () => {
    const loginRes = await authEndpoints.POST_login(createRequest("/api/auth/login", "POST", {
      username: "pwuser",
      password: "oldpassword",
    }));
    const { token } = (await loginRes.json()) as AuthJson;
    void token;

    const res = await authEndpoints.POST_changePassword(createRequest("/api/auth/change-password", "POST", {
      currentPassword: "oldpassword",
      newPassword: "newpassword123",
    }));
    expect(res.status).toBe(200);

    const loginOld = await authEndpoints.POST_login(createRequest("/api/auth/login", "POST", {
      username: "pwuser",
      password: "oldpassword",
    }));
    expect(loginOld.status).toBe(401);

    const loginNew = await authEndpoints.POST_login(createRequest("/api/auth/login", "POST", {
      username: "pwuser",
      password: "newpassword123",
    }));
    expect(loginNew.status).toBe(200);
  });

  it("returns 400 for wrong current password", async () => {
    const loginRes = await authEndpoints.POST_login(createRequest("/api/auth/login", "POST", {
      username: "pwuser",
      password: "newpassword123",
    }));
    const { token } = (await loginRes.json()) as AuthJson;
    void token;

    const res = await authEndpoints.POST_changePassword(createRequest("/api/auth/change-password", "POST", {
      currentPassword: "wrongpassword",
      newPassword: "anotherpass",
    }));
    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/change-email", () => {
  beforeAll(async () => {
    await setupDb();
    await authEndpoints.POST_register(createRequest("/api/auth/register", "POST", {
      username: "emailuser",
      email: "old@example.com",
      password: "password123",
    }));
  });

  it("changes email successfully", async () => {
    const loginRes = await authEndpoints.POST_login(createRequest("/api/auth/login", "POST", {
      username: "emailuser",
      password: "password123",
    }));
    const { token } = (await loginRes.json()) as AuthJson;
    void token;

    const res = await authEndpoints.POST_changeEmail(createRequest("/api/auth/change-email", "POST", {
      email: "new@example.com",
    }));
    expect(res.status).toBe(200);

    const meRes = await authEndpoints.GET_me(token!);
    const meJson = (await meRes.json()) as AuthJson;
    expect(meJson.user!.email).toBe("new@example.com");
  });

  it("returns 400 for invalid email", async () => {
    const loginRes = await authEndpoints.POST_login(createRequest("/api/auth/login", "POST", {
      username: "emailuser",
      password: "password123",
    }));
    const { token } = (await loginRes.json()) as AuthJson;
    void token;

    const res = await authEndpoints.POST_changeEmail(createRequest("/api/auth/change-email", "POST", {
      email: "not-an-email",
    }));
    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/generate-api-key", () => {
  beforeAll(async () => {
    await setupDb();
    await authEndpoints.POST_register(createRequest("/api/auth/register", "POST", {
      username: "apikeyuser",
      email: "api@example.com",
      password: "password123",
    }));
  });

  it("generates an API key", async () => {
    const loginRes = await authEndpoints.POST_login(createRequest("/api/auth/login", "POST", {
      username: "apikeyuser",
      password: "password123",
    }));
    const { token } = (await loginRes.json()) as AuthJson;
    void token;

    const res = await authEndpoints.POST_generateApiKey(createRequest("/api/auth/generate-api-key", "POST"));
    expect(res.status).toBe(200);
    const json = (await res.json()) as AuthJson;
    expect(json.apiKey).toBeDefined();
    expect(json.apiKey).toContain("skz_");
    expect(json.apiKeyPrefix!).toBe(json.apiKey!.slice(0, 11));

    const meRes = await authEndpoints.GET_me(token!);
    const meJson = (await meRes.json()) as AuthJson;
    expect(meJson.user!.apiKeyPrefix).toBe(json.apiKeyPrefix);
  });
});

describe("POST /api/auth/revoke-api-key", () => {
  beforeAll(async () => {
    await setupDb();
    await authEndpoints.POST_register(createRequest("/api/auth/register", "POST", {
      username: "revokeuser",
      email: "revoke@example.com",
      password: "password123",
    }));
  });

  it("revokes the API key", async () => {
    const loginRes = await authEndpoints.POST_login(createRequest("/api/auth/login", "POST", {
      username: "revokeuser",
      password: "password123",
    }));
    const { token } = (await loginRes.json()) as AuthJson;
    void token;

    const genRes = await authEndpoints.POST_generateApiKey(createRequest("/api/auth/generate-api-key", "POST"));
    expect(genRes.status).toBe(200);

    const revokeRes = await authEndpoints.POST_revokeApiKey(createRequest("/api/auth/revoke-api-key", "POST"));
    expect(revokeRes.status).toBe(200);

    const meRes = await authEndpoints.GET_me(token!);
    const meJson = (await meRes.json()) as AuthJson;
    expect(meJson.user!.apiKeyPrefix).toBeNull();
  });
});
