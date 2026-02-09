"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    ShoppingCart,
    Package,
    Settings,
    LogOut,
    Leaf,
    FolderTree,
    Zap,
    Image,
    Factory,
    ChevronDown,
    ChevronRight,
    BarChart3,
    Boxes,
    Megaphone,
    Cog
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Define sidebar structure with grouped sections
interface SidebarItem {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
}

interface SidebarSection {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    items: SidebarItem[];
    defaultOpen?: boolean;
}

const sidebarSections: SidebarSection[] = [
    {
        title: "Tổng quan",
        icon: BarChart3,
        defaultOpen: true,
        items: [
            { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
        ]
    },
    {
        title: "Quản lý sản phẩm",
        icon: Boxes,
        defaultOpen: true,
        items: [
            { label: "Danh mục", href: "/admin/categories", icon: FolderTree },
            { label: "Loại sản phẩm", href: "/admin/product-types", icon: Package },
            { label: "Nhà sản xuất", href: "/admin/manufacturers", icon: Factory },
            { label: "Sản phẩm", href: "/admin/products", icon: Package },
        ]
    },
    {
        title: "Khuyến mãi",
        icon: Megaphone,
        defaultOpen: true,
        items: [
            { label: "Flash Sale", href: "/admin/flash-sales", icon: Zap },
            { label: "Banner", href: "/admin/banners", icon: Image },
        ]
    },
    {
        title: "Bán hàng",
        icon: ShoppingCart,
        defaultOpen: false,
        items: [
            { label: "Đơn hàng", href: "/admin/orders", icon: ShoppingCart },
        ]
    },
    {
        title: "Người dùng",
        icon: Users,
        defaultOpen: false,
        items: [
            { label: "Quản lý người dùng", href: "/admin/users", icon: Users },
        ]
    },
    {
        title: "Cài đặt",
        icon: Cog,
        defaultOpen: false,
        items: [
            { label: "Cài đặt hệ thống", href: "/admin/settings", icon: Settings },
        ]
    },
];

// Collapsible Section Component
function CollapsibleSection({
    section,
    isOpen,
    onToggle,
    pathname
}: {
    section: SidebarSection;
    isOpen: boolean;
    onToggle: () => void;
    pathname: string;
}) {
    // Check if any item in this section is active
    const hasActiveItem = section.items.some(
        item => pathname === item.href || pathname.startsWith(`${item.href}/`)
    );

    return (
        <div className="mb-1">
            {/* Section Header */}
            <button
                onClick={onToggle}
                className={cn(
                    "flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                    hasActiveItem
                        ? "text-green-700 bg-green-50"
                        : "text-gray-600 hover:bg-gray-100"
                )}
            >
                <div className="flex items-center gap-3">
                    <section.icon className={cn(
                        "h-5 w-5",
                        hasActiveItem ? "text-green-600" : "text-gray-500"
                    )} />
                    <span>{section.title}</span>
                </div>
                {isOpen ? (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                )}
            </button>

            {/* Section Items */}
            <div className={cn(
                "overflow-hidden transition-all duration-200 ease-in-out",
                isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            )}>
                <div className="mt-1 ml-4 pl-4 border-l border-gray-200 space-y-0.5">
                    {section.items.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                                    isActive
                                        ? "bg-green-100 text-green-700 font-semibold"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                <item.icon className={cn(
                                    "h-4 w-4",
                                    isActive ? "text-green-600" : "text-gray-400"
                                )} />
                                {item.label}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    // Initialize open sections based on defaultOpen and current path
    const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
        const initial: Record<string, boolean> = {};
        sidebarSections.forEach(section => {
            // Open if default or if contains active item
            const hasActiveItem = section.items.some(
                item => pathname === item.href || pathname.startsWith(`${item.href}/`)
            );
            initial[section.title] = section.defaultOpen || hasActiveItem;
        });
        return initial;
    });

    const toggleSection = (title: string) => {
        setOpenSections(prev => ({
            ...prev,
            [title]: !prev[title]
        }));
    };

    const handleLogout = () => {
        // Clear all auth tokens
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');

        toast.success('Đăng xuất thành công');

        // Redirect to login page
        router.push('/auth/login');
    };

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-white transition-transform flex flex-col">
            {/* Logo */}
            <div className="flex h-16 items-center px-6 border-b shrink-0">
                <Leaf className="h-6 w-6 text-green-600 mr-2" />
                <span className="text-xl font-bold tracking-tight text-gray-900">BanThuoc Admin</span>
            </div>

            {/* Navigation - Scrollable */}
            <nav className="flex-1 overflow-y-auto p-3">
                {sidebarSections.map((section) => (
                    <CollapsibleSection
                        key={section.title}
                        section={section}
                        isOpen={openSections[section.title] || false}
                        onToggle={() => toggleSection(section.title)}
                        pathname={pathname}
                    />
                ))}
            </nav>

            {/* Bottom Actions */}
            <div className="border-t p-3 shrink-0">
                <Button
                    variant="outline"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    onClick={handleLogout}
                >
                    <LogOut className="mr-2 h-4 w-4" /> Đăng xuất
                </Button>
            </div>
        </aside>
    );
}
