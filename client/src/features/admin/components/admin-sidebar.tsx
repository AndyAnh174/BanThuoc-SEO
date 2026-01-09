"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
    LayoutDashboard, 
    Users, 
    ShoppingCart, 
    Package, 
    Settings, 
    LogOut,
    Menu,
    Leaf
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const sidebarItems = [
    { label: "Tổng quan", href: "/admin", icon: LayoutDashboard },
    { label: "Quản lý người dùng", href: "/admin/users", icon: Users },
    { label: "Đơn hàng", href: "/admin/orders", icon: ShoppingCart },
    { label: "Sản phẩm", href: "/admin/products", icon: Package },
    { label: "Cài đặt", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-white transition-transform">
            {/* Logo */}
            <div className="flex h-16 items-center px-6 border-b">
                 <Leaf className="h-6 w-6 text-green-600 mr-2" />
                 <span className="text-xl font-bold tracking-tight text-gray-900">BanThuoc Admin</span>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-1 p-4">
                {sidebarItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                        <Link 
                            key={item.href} 
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-green-50 hover:text-green-700",
                                isActive ? "bg-green-50 text-green-700 font-bold" : "text-gray-600"
                            )}
                        >
                            <item.icon className={cn("h-5 w-5", isActive ? "text-green-700" : "text-gray-500")} />
                            {item.label}
                        </Link>
                    )
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="absolute bottom-4 left-0 w-full px-4">
                 <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                    <LogOut className="mr-2 h-4 w-4" /> Đăng xuất
                 </Button>
            </div>
        </aside>
    );
}
