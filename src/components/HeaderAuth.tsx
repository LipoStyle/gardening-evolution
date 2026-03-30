import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { signOut } from "@/app/[locale]/auth-actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function HeaderAuth({ locale }: { locale: Locale }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Link className="HeaderAuth__login AppHeader__link" href={`/${locale}/login`}>
        Login
      </Link>
    );
  }

  return (
    <form action={signOut}>
      <input type="hidden" name="locale" value={locale} />
      <button className="AppHeader__link AppHeader__link--button" type="submit">
        Logout
      </button>
    </form>
  );
}

