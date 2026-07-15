"use client";

import { useState, FormEvent, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import styles from "./register.module.css";

function getPasswordStrength(pw: string): {
  score: number;
  label: string;
} {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  const labels = ["", "weak", "fair", "good", "strong", "excellent"];
  return { score, label: labels[score] || "" };
}

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await register(username, email, password);
      setSuccess("Account created. Redirecting to login…");
      setTimeout(() => router.push("/auth/login"), 1500);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(
        axiosErr.response?.data?.message || "Registration failed. Try again."
      );
    }
  };

  return (
    <>
      <h2 className={styles.title}>Create account</h2>

      {error && <div className={styles.errorMsg}>{error}</div>}
      {success && <div className={styles.successMsg}>{success}</div>}

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.fieldGroup}>
          <label className="label" htmlFor="reg-username">
            Username
          </label>
          <input
            id="reg-username"
            className="input-field"
            type="text"
            placeholder="your_handle"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={2}
            maxLength={30}
            autoComplete="username"
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className="label" htmlFor="reg-email">
            Email
          </label>
          <input
            id="reg-email"
            className="input-field"
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className="label" htmlFor="reg-password">
            Password
          </label>
          <input
            id="reg-password"
            className="input-field"
            type="password"
            placeholder="Min. 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            maxLength={32}
            autoComplete="new-password"
          />
          {password.length > 0 && (
            <>
              <div className={styles.strengthBar}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={styles.strengthSegment}
                    data-active={i <= strength.score ? "true" : "false"}
                  />
                ))}
              </div>
              <span className={styles.strengthLabel}>{strength.label}</span>
            </>
          )}
        </div>

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={isLoading}
        >
          <span className={styles.submitBtnText}>
            {isLoading ? (
              <>
                <span className="spinner" /> Creating…
              </>
            ) : (
              "Create Account →"
            )}
          </span>
        </button>
      </form>

      <p className={styles.footer}>
        Already have an account?{" "}
        <Link href="/auth/login" className={styles.footerLink}>
          Sign in
        </Link>
      </p>
    </>
  );
}
