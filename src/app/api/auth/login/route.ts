import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSessionToken } from "@/lib/auth";

type LoginBody = { email?: string; password?: string };

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as LoginBody;
    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";

    // Basic input guardrails
    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.adminUser.findUnique({ where: { email } });
    if (!user) {
      // Do NOT reveal which field failed (security best practice)
      return NextResponse.json({ ok: false, error: "Invalid credentials." }, { status: 401 });
    }

    // Check password
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ ok: false, error: "Invalid credentials." }, { status: 401 });
    }

    // Create session token
    const token = await createSessionToken({ userId: user.id });

    // Set secure, HTTP-only cookie
    const oneWeek = 60 * 60 * 24 * 7;
    const cookieStore = await cookies();  // ⬅️ important
    cookieStore.set({
    name: "session",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: oneWeek,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ ok: false, error: "Server error." }, { status: 500 });
  }
}
