import Link from "next/link";
import type { Locale } from "@/i18n/config";

export function HeaderBrand({ locale }: { locale: Locale }) {
  return (
    <Link className="HeaderBrand" href={`/${locale}`} aria-label="Gardening Evolution home">
      <span className="HeaderBrand__logo" aria-hidden="true">
        GE
      </span>
      <span className="HeaderBrand__name">Gardening Evolution.</span>
    </Link>
  );
}

