"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./LoginForm.module.css";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const router = useRouter();                     // ⬅️ add this near other hooks
  const [serverError, setServerError] = useState<string | null>(null); // ⬅️ add this

  function validate() {
    const next: typeof errors = {};
    if (!email.includes("@")) next.email = "Please enter a valid email address.";
    if (!password) next.password = "Password is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  setServerError(null);

  if (!validate()) return;
  setBusy(true);

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok || !data?.ok) {
      setServerError(data?.error ?? "Login failed.");
      return;
    }

    // success → go to admin dashboard
    router.push("/admin");
  } catch (err) {
    setServerError("Network error. Please try again.");
  } finally {
    setBusy(false);
  }
}


  return (
    <section className={styles.wrapper} aria-label="Login section">
      <div className={styles.card}>
        <h2 className={styles.title}>Welcome to Gardening Evolution</h2>
        <p className={styles.subtitle}>Please log in to continue.</p>

        <form onSubmit={onSubmit} className={styles.form} noValidate>
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <div className={styles.inputRow}>
              <input
                id="email"
                className={styles.input}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                required
              />
            </div>
            {errors.email && (
              <span id="email-error" className={styles.errorMsg}>
                {errors.email}
              </span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <div className={styles.inputRow}>
              <input
                id="password"
                className={styles.input}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
                required
              />
            </div>
            {errors.password && (
              <span id="password-error" className={styles.errorMsg}>
                {errors.password}
              </span>
            )}
          </div>

          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.button}
              disabled={busy}
              aria-busy={busy ? "true" : "false"}
            >
              {busy ? "Logging in…" : "Log in"}
            </button>
            {serverError && <p className={styles.errorMsg}>{serverError}</p>}
            
            <p className={styles.helper}>
              Don’t have an account?{" "}
              <a className={styles.link} href="#">
                Sign up
              </a>
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}
