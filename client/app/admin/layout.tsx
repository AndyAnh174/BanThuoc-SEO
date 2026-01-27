"use client";

import { useEffect, useState } from "react";
import { AdminSidebar } from "@/src/features/admin/components/admin-sidebar";
import { UserCircle, LogOut, User } from "lucide-react";
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
  const [userInitial, setUserInitial] = useState("A");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [fullName, setFullName] = useState("Admin");
  const { logout } = useAuthStore();

  const loadUserInfo = async () => {
    if (typeof window !== "undefined") {
      // First try localStorage for quick display
      const userInfo = localStorage.getItem("userInfo");
      if (userInfo) {
        try {
          const parsed = JSON.parse(userInfo);
          if (parsed.full_name) {
            setFullName(parsed.full_name);
            setUserInitial(parsed.full_name.charAt(0).toUpperCase());
          }
          if (parsed.avatar) {
            setAvatar(parsed.avatar);
          } else {
            setAvatar(null);
          }
        } catch (e) {}
      }

      // Then fetch from API for most up-to-date data
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
          const response = await fetch(`${API_URL}/api/me/`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            if (data.full_name) {
              setFullName(data.full_name);
              setUserInitial(data.full_name.charAt(0).toUpperCase());
            }
            if (data.avatar) {
              setAvatar(data.avatar);
            }
            // Update localStorage
            localStorage.setItem('userInfo', JSON.stringify({
              full_name: data.full_name,
              avatar: data.avatar
            }));
          }
        } catch (e) {
          // Silently fail - use localStorage data
        }
      }
    }
  };

  useEffect(() => {
    loadUserInfo();
    
    const handleUserInfoUpdate = () => loadUserInfo();
    window.addEventListener('userInfoUpdated', handleUserInfoUpdate);
    
    return () => {
      window.removeEventListener('userInfoUpdated', handleUserInfoUpdate);
    };
  }, []);

  return (
    <div className="flex h-screen bg-gray-50/50">
        <AdminSidebar />
        <main className="flex-1 ml-64 flex flex-col h-full overflow-hidden">
             {/* Header */}
            <header className="h-16 border-b bg-green-600 flex items-center justify-between px-8 shrink-0 shadow-sm">
                <h1 className="text-xl font-bold text-white">Quản trị hệ thống</h1>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-green-50">Xin chào, {fullName}</span>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full text-green-100 hover:text-white hover:bg-green-500">
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

