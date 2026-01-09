import { AdminSidebar } from "@/src/features/admin/components/admin-sidebar";
import { UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50/50">
        <AdminSidebar />
        <main className="flex-1 ml-64 flex flex-col h-full overflow-hidden">
             {/* Header */}
            <header className="h-16 border-b bg-white flex items-center justify-between px-8 shrink-0">
                <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">Welcome, Admin</span>
                    <Button variant="ghost" size="icon" className="rounded-full">
                         <UserCircle className="h-8 w-8 text-gray-400" />
                    </Button>
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
