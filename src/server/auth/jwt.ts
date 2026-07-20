import { SignJWT, jwtVerify } from "jose";
import { serverConfig } from "skillz/server/config";

const SECRET = new TextEncoder().encode(serverConfig.jwtSecret);

const ALG = "HS256";

export interface JwtPayload {
  userId: number;
  username: string;
}

export async function createToken(
  payload: Pick<JwtPayload, "userId" | "username">,
  expiresIn = "7d",
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: ALG })
    .setExpirationTime(expiresIn)
    .setIssuedAt()
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, SECRET);
  return payload as unknown as JwtPayload;
}
