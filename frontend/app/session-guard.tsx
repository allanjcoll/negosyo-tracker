"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const IDLE_TIMEOUT_MS = 15 * 60 * 1000;

function parseJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export default function SessionGuard() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/login") return;

    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    const payload = parseJwt(token);

    if (!payload?.exp) {
      localStorage.removeItem("token");
      router.push("/login");
      return;
    }

    const now = Math.floor(Date.now() / 1000);

    if (payload.exp <= now) {
      localStorage.removeItem("token");
      alert("Your session has expired. Please log in again.");
      router.push("/login");
      return;
    }

    let idleTimer: ReturnType<typeof setTimeout>;

    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        localStorage.removeItem("token");
        alert("You were logged out due to inactivity.");
        router.push("/login");
      }, IDLE_TIMEOUT_MS);
    };

    const events = ["mousemove", "keydown", "click", "scroll"];

    events.forEach((event) => window.addEventListener(event, resetIdleTimer));

    resetIdleTimer();

    return () => {
      clearTimeout(idleTimer);
      events.forEach((event) =>
        window.removeEventListener(event, resetIdleTimer)
      );
    };
  }, [pathname, router]);

  return null;
}
