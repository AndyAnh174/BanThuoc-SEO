"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User, LogOut, Settings, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/src/features/auth/stores/auth.store";

export function UserDropdownMenu() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userInitial, setUserInitial] = useState("U");
    const [avatar, setAvatar] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const { logout } = useAuthStore();

    const parseJwt = (token: string) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            return null;
        }
    };

    const loadUserInfo = () => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("accessToken");
            setIsLoggedIn(!!token);

            // Try to get user info from localStorage if available
            const userInfo = localStorage.getItem("userInfo");
            if (userInfo) {
                try {
                    const parsed = JSON.parse(userInfo);
                    if (parsed.full_name) {
                        setUserInitial(parsed.full_name.charAt(0).toUpperCase());
                    }
                    if (parsed.avatar) {
                        setAvatar(parsed.avatar);
                    } else {
                        setAvatar(null);
                    }
                } catch (e) { }
            }

            if (token) {
                const payload = parseJwt(token);
                if (payload) {
                    // Check for ADMIN role or superuser/staff status as fallback
                    if (payload.role === 'ADMIN' || payload.is_superuser || payload.is_staff) {
                        setIsAdmin(true);
                    } else {
                        setIsAdmin(false);
                    }
                } else {
                    setIsAdmin(false);
                }
            }
        }
    };

    useEffect(() => {
        // Initial load
        loadUserInfo();

        // Listen for user info updates (e.g., avatar change)
        const handleUserInfoUpdate = () => loadUserInfo();
        window.addEventListener('userInfoUpdated', handleUserInfoUpdate);

        return () => {
            window.removeEventListener('userInfoUpdated', handleUserInfoUpdate);
        };
    }, []);

    if (!isLoggedIn) {
        // Guest menu
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full w-10 h-10 hover:bg-gray-100 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                            <User className="w-4 h-4 text-gray-600" />
                        </div>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl shadow-xl border-gray-100/50 backdrop-blur-sm">
                    <div className="px-2 py-1.5 text-xs text-muted-foreground font-medium">Tài khoản</div>
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                        <Link href="/auth/login" className="flex items-center gap-2 font-medium">
                            <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                                <User className="w-3.5 h-3.5 text-primary" />
                            </div>
                            Đăng nhập
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                        <Link href="/auth/register" className="flex items-center gap-2 font-medium">
                            <div className="w-6 h-6 rounded bg-emerald-100 flex items-center justify-center">
                                <span className="text-xs font-bold text-emerald-600">+</span>
                            </div>
                            Đăng ký
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }

    // Logged in user menu
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full w-10 h-10 hover:bg-gray-100 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                        {avatar ? (
                            <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            userInitial
                        )}
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl shadow-xl border-gray-100/50 backdrop-blur-sm">
                <div className="px-2 py-1.5 text-xs text-muted-foreground font-medium">Tài khoản của tôi</div>

                {isAdmin && (
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer bg-orange-50 mb-1">
                        <Link href="/admin" className="flex items-center gap-2 font-medium text-orange-700">
                            <div className="w-6 h-6 rounded bg-orange-100 flex items-center justify-center">
                                <LayoutDashboard className="w-3.5 h-3.5 text-orange-600" />
                            </div>
                            Quản lý hệ thống
                        </Link>
                    </DropdownMenuItem>
                )}

                <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                    <Link href="/profile" className="flex items-center gap-2 font-medium">
                        <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                            <User className="w-3.5 h-3.5 text-primary" />
                        </div>
                        Thông tin cá nhân
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                    <Link href="/orders" className="flex items-center gap-2 font-medium">
                        <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center">
                            <Settings className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        Đơn hàng của tôi
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={logout}
                    className="rounded-lg cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                    <div className="flex items-center gap-2 font-medium">
                        <div className="w-6 h-6 rounded bg-red-100 flex items-center justify-center">
                            <LogOut className="w-3.5 h-3.5 text-red-600" />
                        </div>
                        Đăng xuất
                    </div>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
