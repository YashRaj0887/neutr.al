"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (token) {
      router.replace("/rooms");
    } else {
      router.replace("/auth/login");
    }
  }, [router]);

  // Brief loading state while redirecting
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "#fff",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <div
        style={{
          fontSize: "1.75rem",
          fontWeight: 900,
          letterSpacing: "-0.03em",
          fontFamily: "var(--font-sans)",
        }}
      >
        neutr.al
      </div>
      <div className="spinner" style={{ width: 24, height: 24 }} />
    </div>
  );
}
