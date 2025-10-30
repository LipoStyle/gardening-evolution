"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./LogoutButton.module.css";

export default function LogoutButton() {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function onLogout() {
    setBusy(true);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (!res.ok) throw new Error("Logout failed");
      router.push("/");           // back to home
      router.refresh();           // refresh data/cookies
    } catch {
      alert("Could not log out. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      className={styles.button}
      onClick={onLogout}
      disabled={busy}
      aria-busy={busy ? "true" : "false"}
      aria-label="Log out"
      title="Log out"
    >
      {busy ? "Logging out…" : "Logout"}
    </button>
  );
}
