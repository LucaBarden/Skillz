import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  POST_register,
  POST_login,
  POST_logout,
  POST_changePassword,
  POST_changeEmail,
  POST_generateApiKey,
  POST_revokeApiKey,
  GET_status,
  GET_me,
} from "skillz/server/auth/endpoints";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ action: string }> },
) {
  const { action } = await params;

  switch (action) {
    case "status":
      return GET_status();

    case "me": {
      const cookieStore = await cookies();
      const token = cookieStore.get("skillz_token")?.value ?? null;
      return GET_me(token);
    }

    default:
      return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ action: string }> },
) {
  const { action } = await params;

  switch (action) {
    case "register":
      return POST_register(req);
    case "login":
      return POST_login(req);
    case "logout":
      return POST_logout();
    case "change-password":
      return POST_changePassword(req);
    case "change-email":
      return POST_changeEmail(req);
    case "generate-api-key":
      return POST_generateApiKey(req);
    case "revoke-api-key":
      return POST_revokeApiKey(req);
    default:
      return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
