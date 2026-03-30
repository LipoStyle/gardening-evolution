import type { Locale } from "@/i18n/config";
import { LanguageSelect } from "@/components/LanguageSelect";
import { ThemeToggle } from "@/components/ThemeToggle";

export function HeaderFeatures({ locale }: { locale: Locale }) {
  return (
    <div className="HeaderFeatures">
      <LanguageSelect locale={locale} />
      <ThemeToggle />
    </div>
  );
}

