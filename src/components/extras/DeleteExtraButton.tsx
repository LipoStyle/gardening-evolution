"use client";

import { useTransition } from "react";
import { deleteExtra } from "@/app/[locale]/extras/actions";
import type { Locale } from "@/i18n/config";

export function DeleteExtraButton({
  locale,
  extraId,
  extraLabel,
}: {
  locale: Locale;
  extraId: string;
  extraLabel: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="ClientCard__btn ClientCard__btn--danger"
      disabled={isPending}
      onClick={() => {
        if (!window.confirm(`Delete extra "${extraLabel}"?`)) return;
        startTransition(async () => {
          const fd = new FormData();
          fd.set("locale", locale);
          fd.set("id", extraId);
          await deleteExtra(fd);
        });
      }}
    >
      {isPending ? "Deleting…" : "Delete"}
    </button>
  );
}

