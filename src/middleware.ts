import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { defaultLocale, isLocale } from "@/i18n/config";

export async function middleware(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  const res = NextResponse.next({ request: { headers: req.headers } });

  if (url && anonKey) {
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            res.cookies.set(name, value, options);
          }
        },
      },
    });
    await supabase.auth.getUser();
  }

  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.includes(".")) {
    return res;
  }

  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];

  if (first && isLocale(first)) {
    return res;
  }

  const redirectUrl = req.nextUrl.clone();
  redirectUrl.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  const redirectRes = NextResponse.redirect(redirectUrl);

  for (const c of res.cookies.getAll()) {
    redirectRes.cookies.set(c.name, c.value);
  }

  return redirectRes;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
