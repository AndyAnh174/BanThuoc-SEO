"use client";

import { useEffect, useState, use } from "react";
import { User } from "../../../../src/features/admin/types/admin.types";
import { fetchUserDetail, updateUserStatus } from "../../../../src/features/admin/api/admin.api";
import { UserDetailView } from "../../../../src/features/admin/components/user-detail";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { UserStatus } from "../../../../src/features/admin/types/admin.types";

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const resolvedParams = use(params);

    const loadUser = async () => {
        try {
            const data = await fetchUserDetail(parseInt(resolvedParams.id));
            setUser(data);
        } catch (error) {
            toast.error("Failed to load user details");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadUser();
    }, [resolvedParams.id]);

    const handleApprove = async (id: number) => {
        try {
            await updateUserStatus(id, { status: UserStatus.ACTIVE });
            toast.success("User approved!");
            loadUser(); // Refresh
        } catch (error) {
            toast.error("Failed to approve user");
        }
    };

    const handleReject = async (id: number, reason: string) => {
        try {
            await updateUserStatus(id, { status: UserStatus.REJECTED, reason: reason });
            toast.success("User rejected!");
            loadUser(); // Refresh
        } catch (error) {
            toast.error("Failed to reject user");
        }
    };


    if (isLoading) {
        return (
            <div className="flex w-full h-[50vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        );
    }

    if (!user) {
        return <div>User not found</div>;
    }

    return (
        <UserDetailView 
            user={user} 
            onApprove={handleApprove} 
            onReject={handleReject} 
        />
    );
}
