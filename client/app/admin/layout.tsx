"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/src/features/admin/components/admin-sidebar";
import { UserCircle, LogOut, User, Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useAuthStore } from "@/src/features/auth/stores/auth.store";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [userInitial, setUserInitial] = useState("A");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [fullName, setFullName] = useState("Admin");
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null); // null = loading, true = admin, false = denied
  const { logout } = useAuthStore();

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (typeof window === "undefined") return;

      const token = localStorage.getItem("accessToken");
      if (!token) {
        setIsAuthorized(false);
        return;
      }

      // Decode JWT to check role (fast check without API call)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.role !== 'ADMIN' && !payload.is_superuser && !payload.is_staff) {
          setIsAuthorized(false);
          return;
        }
      } catch {
        setIsAuthorized(false);
        return;
      }

      // Verify with backend
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const response = await fetch(`${API_URL}/me/`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
          setIsAuthorized(false);
          return;
        }

        const data = await response.json();

        // Only ADMIN role allowed
        if (data.role !== 'ADMIN') {
          setIsAuthorized(false);
          return;
        }

        // Update user info
        if (data.full_name) {
          setFullName(data.full_name);
          setUserInitial(data.full_name.charAt(0).toUpperCase());
        }
        if (data.avatar) {
          setAvatar(data.avatar);
        }
        localStorage.setItem('userInfo', JSON.stringify({
          full_name: data.full_name,
          avatar: data.avatar,
          role: data.role
        }));

        setIsAuthorized(true);
      } catch {
        // If API fails, trust JWT role from token
        setIsAuthorized(true);
      }
    };

    checkAdminAccess();
  }, []);

  // Loading state
  if (isAuthorized === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-500">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // Not authorized — show 404
  if (isAuthorized === false) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="h-10 w-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">404 — Không tìm thấy</h1>
          <p className="text-gray-500 mb-6">Trang này không tồn tại hoặc bạn không có quyền truy cập.</p>
          <Button asChild>
            <Link href="/">Về trang chủ</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Authorized admin
  return (
    <div className="flex h-screen bg-gray-50/50">
      <AdminSidebar />
      <main className="flex-1 ml-64 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b bg-teal-600 flex items-center justify-between px-8 shrink-0 shadow-sm">
          <h1 className="text-xl font-bold text-white">Quản trị hệ thống</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-teal-50">Xin chào, {fullName}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full text-teal-100 hover:text-white hover:bg-teal-500">
                  {avatar ? (
                    <img src={avatar} alt="Avatar" className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
                      {userInitial}
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/profile" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Thông tin cá nhân
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600 focus:text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content Scroll Area */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

