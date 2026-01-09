"use client";

import { UserListTable } from "@/src/features/admin/components/user-table";

export default function UserManagementPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">User Management</h2>
                    <p className="text-gray-500">View and manage user registrations and approvals.</p>
                </div>
            </div>

            <UserListTable />
        </div>
    );
}
