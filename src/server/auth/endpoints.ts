import { NextResponse } from "next/server";
import { registerSchema, loginSchema, changePasswordSchema, changeEmailSchema } from "skillz/server/auth/schemas";
import { hashPassword, verifyPassword } from "skillz/server/auth/password";
import { createToken } from "skillz/server/auth/jwt";
import { createUser, findUserByUsername, findUserById, updateUserPassword, updateUserEmail, updateUserApiKey } from "skillz/server/auth/db";
import { db } from "skillz/server/db";
import { serverConfig } from "skillz/server/config";
import { cookies } from "next/headers";
import { verifyToken } from "skillz/server/auth/jwt";
import { generateApiKey, hashApiKey } from "skillz/server/auth/apiKey";

const COOKIE_NAME = "skillz_token";

async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function POST_register(req: Request) {
  try {
    const body = registerSchema.safeParse(await req.json().catch(() => ({})));
    if (!body.success) {
      return NextResponse.json({ error: body.error.flatten() }, { status: 400 });
    }

    const existing = await findUserByUsername(db, body.data.username);
    if (existing) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(body.data.password);
    const user = await createUser(db, {
      username: body.data.username,
      email: body.data.email,
      passwordHash,
    });

    const token = await createToken({ userId: user.id, username: user.username });
    await setAuthCookie(token);

    return NextResponse.json(
      {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          apiKeyPrefix: user.apiKeyPrefix,
        },
        token,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("register error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST_login(req: Request) {
  try {
    const body = loginSchema.safeParse(await req.json().catch(() => ({})));
    if (!body.success) {
      return NextResponse.json({ error: body.error.flatten() }, { status: 400 });
    }

    const user = await findUserByUsername(db, body.data.username);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 },
      );
    }

    const valid = await verifyPassword(body.data.password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 },
      );
    }

    const token = await createToken({ userId: user.id, username: user.username });
    await setAuthCookie(token);

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        apiKeyPrefix: user.apiKeyPrefix,
      },
      token,
    });
  } catch (err) {
    console.error("login error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST_logout() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  return NextResponse.json({ ok: true });
}

export async function GET_status() {
  return NextResponse.json({
    passwordAuth: serverConfig.passwordAuth,
    loginRequired: serverConfig.loginRequired,
  });
}

export async function GET_me(token: string | null) {
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = await verifyToken(token);
    const user = await findUserById(db, payload.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        apiKeyPrefix: user.apiKeyPrefix,
      },
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

async function requireAuth(token: string | null) {
  if (!token) return null;
  try {
    const payload = await verifyToken(token);
    return await findUserById(db, payload.userId);
  } catch {
    return null;
  }
}

export async function POST_changePassword(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value ?? null;
    const user = await requireAuth(token);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = changePasswordSchema.safeParse(await req.json().catch(() => ({})));
    if (!body.success) {
      return NextResponse.json({ error: body.error.flatten() }, { status: 400 });
    }

    const valid = await verifyPassword(body.data.currentPassword, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }

    const newHash = await hashPassword(body.data.newPassword);
    await updateUserPassword(db, user.id, newHash);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("changePassword error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST_changeEmail(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value ?? null;
    const user = await requireAuth(token);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = changeEmailSchema.safeParse(await req.json().catch(() => ({})));
    if (!body.success) {
      return NextResponse.json({ error: body.error.flatten() }, { status: 400 });
    }

    await updateUserEmail(db, user.id, body.data.email);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("changeEmail error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST_generateApiKey(_req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value ?? null;
    const user = await requireAuth(token);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { raw, prefix } = generateApiKey();
    const hash = hashApiKey(raw);
    await updateUserApiKey(db, user.id, hash, prefix);

    return NextResponse.json({
      apiKey: raw,
      apiKeyPrefix: prefix,
    });
  } catch (err) {
    console.error("generateApiKey error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST_revokeApiKey(_req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value ?? null;
    const user = await requireAuth(token);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await updateUserApiKey(db, user.id, null, null);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("revokeApiKey error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
