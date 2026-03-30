"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { isLocale, locales, type Locale } from "@/i18n/config";

export function LanguageSelect({ locale }: { locale: Locale }) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";

  const onChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const nextLocale = e.target.value as Locale;
      const parts = pathname.split("/").filter(Boolean);

      if (parts.length === 0) {
        router.push(`/${nextLocale}`);
        return;
      }

      if (isLocale(parts[0])) {
        parts[0] = nextLocale;
        router.push(`/${parts.join("/")}`);
        return;
      }

      router.push(`/${nextLocale}${pathname.startsWith("/") ? "" : "/"}${pathname}`);
    },
    [pathname, router]
  );

  return (
    <label className="LanguageSelect" aria-label="Language">
      <span className="LanguageSelect__label">Language</span>
      <select className="LanguageSelect__select" value={locale} onChange={onChange}>
        {locales.map((l) => (
          <option key={l} value={l}>
            {l.toUpperCase()}
          </option>
        ))}
      </select>
    </label>
  );
}

