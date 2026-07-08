"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Cart page - temporarily disabled.
 * Redirects to homepage.
 */
export default function CartPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/");
    }, [router]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <p className="text-gray-500">Đang chuyển hướng...</p>
        </div>
    );
}
