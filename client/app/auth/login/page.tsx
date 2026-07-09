"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "../../../src/features/auth/components/login-form";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // If already logged in, redirect based on role
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          if (payload.role === "ADMIN" || payload.is_superuser || payload.is_staff) {
            router.replace("/admin");
          } else {
            router.replace("/");
          }
        } catch {
          // Invalid token — stay on login page
        }
      }
    }
  }, [router]);

  return (
    <div className="flex w-full items-center justify-center py-10 md:py-20">
      <div className="w-full max-w-[1000px]">
        <LoginForm />
      </div>
    </div>
  );
}
