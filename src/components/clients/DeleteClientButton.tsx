"use client";

import * as React from "react";
import { deleteClient } from "@/app/[locale]/clients/actions";
import type { Locale } from "@/i18n/config";

type Props = {
  locale: Locale;
  clientId: string;
  clientLabel: string;
};

export function DeleteClientButton({ locale, clientId, clientLabel }: Props) {
  const [pending, startTransition] = React.useTransition();

  function handleDelete() {
    const ok = window.confirm(
      `Delete client "${clientLabel}"?\n\nThis cannot be undone.`
    );
    if (!ok) return;

    const fd = new FormData();
    fd.set("locale", locale);
    fd.set("id", clientId);
    startTransition(() => {
      void deleteClient(fd);
    });
  }

  return (
    <button
      className="ClientCard__btn ClientCard__btn--danger"
      type="button"
      onClick={handleDelete}
      disabled={pending}
      aria-busy={pending}
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
