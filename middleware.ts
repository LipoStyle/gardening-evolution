import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Verify the session JWT using the same AUTH_SECRET we used to sign
async function verify(token: string) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("Missing AUTH_SECRET");
  const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
  return payload as { userId: number; iat: number; exp: number };
}

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const cookie = req.cookies.get("session");

  if (!cookie?.value) {
    // No session → bounce to home (you can add a query if you want)
    url.pathname = "/";
    url.searchParams.set("from", "admin");
    return NextResponse.redirect(url);
  }

  try {
    await verify(cookie.value); // throws if invalid/expired
    return NextResponse.next(); // OK, continue to /admin
  } catch {
    // Bad/expired token → clear cookie + redirect
    const res = NextResponse.redirect(new URL("/", req.url));
    res.cookies.set({
      name: "session",
      value: "",
      path: "/",
      maxAge: 0,
    });
    return res;
  }
}

// Only run this middleware for /admin routes
export const config = {
  matcher: ["/admin/:path*"],
};
