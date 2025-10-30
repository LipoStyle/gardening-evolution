import { SignJWT, jwtVerify } from "jose";

const encoder = new TextEncoder();
function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("Missing AUTH_SECRET");
  return encoder.encode(secret);
}

export async function createSessionToken(payload: { userId: number }) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime("7d") // 7 days; tweak as needed
    .sign(getSecret());
  return token;
}

export async function verifySessionToken(token: string) {
  const { payload } = await jwtVerify(token, getSecret());
  return payload as { userId: number; iat: number; exp: number };
}
