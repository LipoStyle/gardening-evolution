import type { Locale } from "@/i18n/config";
import { HeaderAuth } from "@/components/HeaderAuth";
import { HeaderBrand } from "@/components/HeaderBrand";
import { HeaderFeatures } from "@/components/HeaderFeatures";

export function Header({ locale }: { locale: Locale }) {
  return (
    <header className="SiteHeader">
      <div className="SiteHeader__inner">
        <div className="SiteHeader__slot SiteHeader__slot--left">
          <HeaderFeatures locale={locale} />
        </div>
        <div className="SiteHeader__slot SiteHeader__slot--center">
          <HeaderBrand locale={locale} />
        </div>
        <div className="SiteHeader__slot SiteHeader__slot--right">
          <HeaderAuth locale={locale} />
        </div>
      </div>
    </header>
  );
}

