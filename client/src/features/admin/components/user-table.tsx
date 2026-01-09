"use client";

import { useEffect, useState } from "react";
import { useAdminStore } from "../stores/admin.store";
import { User, UserStatus } from "../types/admin.types";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Check, X, Search, FileText } from "lucide-react";
import { 
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter 
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

export function UserListTable() {
    const { 
        users, 
        isLoading, 
        loadUsers, 
        approveUser, 
        rejectUser,
        filterStatus,
        setFilterStatus,
        setSearchQuery
    } = useAdminStore();

    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    const handleViewDetail = (user: User) => {
        setSelectedUser(user);
        setIsDetailOpen(true);
    };

    const handleApprove = async () => {
        if (!selectedUser) return;
        const success = await approveUser(selectedUser.id);
        if (success) setIsDetailOpen(false);
    };

    const handleRejectClick = () => {
        // Open reject reason dialog on top of detail dialog or switch modes
        setIsRejectDialogOpen(true);
    };
    
    const handleConfirmReject = async () => {
        if (!selectedUser) return;
        const success = await rejectUser(selectedUser.id, rejectReason);
        if(success) {
            setIsRejectDialogOpen(false);
            setIsDetailOpen(false);
            setRejectReason("");
        }
    };

    const getStatusColor = (status: UserStatus) => {
        switch (status) {
            case UserStatus.ACTIVE: return "bg-green-100 text-green-700 hover:bg-green-100";
            case UserStatus.PENDING: return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100";
            case UserStatus.REJECTED: return "bg-red-100 text-red-700 hover:bg-red-100";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border">
                <div className="flex items-center gap-2 flex-1 max-w-sm">
                    <Search className="w-4 h-4 text-gray-400" />
                    <Input 
                        placeholder="Search by name, email..." 
                        className="border-none shadow-none focus-visible:ring-0 pl-0"
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem> {/* Handle 'all' in store/api to send empty string */}
                        <SelectItem value={UserStatus.PENDING}>Pending</SelectItem>
                        <SelectItem value={UserStatus.ACTIVE}>Active</SelectItem>
                        <SelectItem value={UserStatus.REJECTED}>Rejected</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow>
                            <TableHead className="w-[80px]">ID</TableHead>
                            <TableHead>User Info</TableHead>
                            <TableHead>Business Info</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">Loading...</TableCell>
                            </TableRow>
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-gray-500">No users found</TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id} className="hover:bg-gray-50/50 cursor-pointer" onClick={() => handleViewDetail(user)}>
                                    <TableCell className="font-medium text-gray-500">#{user.id}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900">{user.full_name}</span>
                                            <span className="text-gray-500 text-xs">{user.email}</span>
                                            <span className="text-gray-500 text-xs">{user.phone}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {user.business_profile ? (
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900">{user.business_profile.business_name}</span>
                                                <span className="text-gray-500 text-xs">Lic: {user.business_profile.license_number}</span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 italic">No Profile</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize">{user.role.toLowerCase()}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleViewDetail(user); }}>
                                            <Eye className="w-4 h-4 text-gray-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Detail Modal */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>User Details</DialogTitle>
                        <DialogDescription>Review registration information before approving.</DialogDescription>
                    </DialogHeader>

                    {selectedUser && (
                        <div className="grid grid-cols-2 gap-6 py-4">
                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Personal Info</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-gray-500">Full Name</span>
                                        <span className="font-medium">{selectedUser.full_name}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-gray-500">Email</span>
                                        <span className="font-medium">{selectedUser.email}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-gray-500">Phone</span>
                                        <span className="font-medium">{selectedUser.phone}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Business Info</h4>
                                {selectedUser.business_profile ? (
                                    <div className="space-y-2 text-sm">
                                        <div className="flex flex-col">
                                            <span className="text-gray-500">Business Name</span>
                                            <span className="font-medium">{selectedUser.business_profile.business_name}</span>
                                        </div>
                                         <div className="flex flex-col">
                                            <span className="text-gray-500">Tax ID</span>
                                            <span className="font-medium">{selectedUser.business_profile.tax_id}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-gray-500">Address</span>
                                            <span className="font-medium">{selectedUser.business_profile.address}</span>
                                        </div>
                                        <div className="flex flex-col mt-2">
                                            <span className="text-gray-500 mb-1">Business License</span>
                                            {selectedUser.business_profile.license_file_url ? (
                                                <a href={selectedUser.business_profile.license_file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 p-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors w-fit">
                                                    <FileText className="w-4 h-4" />
                                                    <span className="text-xs font-semibold">View License PDF/Image</span>
                                                </a>
                                            ) : (
                                                <span className="text-red-500 italic text-xs">No file uploaded</span>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-gray-50 rounded-lg text-gray-500 text-sm">
                                        No Business Profile found.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    
                    <DialogFooter className="gap-2 sm:gap-0">
                         {selectedUser?.status === UserStatus.PENDING && (
                             <>
                                <Button variant="destructive" onClick={handleRejectClick}>
                                    <X className="w-4 h-4 mr-2" /> Reject
                                </Button>
                                <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleApprove}>
                                    <Check className="w-4 h-4 mr-2" /> Approve
                                </Button>
                             </>
                         )}
                         <Button variant="outline" onClick={() => setIsDetailOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

             {/* Reject Reason Modal (Nested or separate) */}
             <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject User</DialogTitle>
                        <DialogDescription>Please provide a reason for rejecting this user.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Input 
                            value={rejectReason} 
                            onChange={(e) => setRejectReason(e.target.value)} 
                            placeholder="Reason (e.g. Invalid license, Spam...)"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleConfirmReject} disabled={!rejectReason.trim()}>Confirm Reject</Button>
                    </DialogFooter>
                </DialogContent>
             </Dialog>
        </div>
    );
}
