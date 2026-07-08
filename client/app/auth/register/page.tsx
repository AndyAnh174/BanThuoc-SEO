"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Register page - temporarily disabled.
 * Redirects to login page.
 */
export default function RegisterPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/auth/login");
    }, [router]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <p className="text-gray-500">Đang chuyển hướng...</p>
        </div>
    );
}
