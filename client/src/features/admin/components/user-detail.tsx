"use client";

import { User, UserStatus } from "../types/admin.types";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
    Mail, 
    Phone, 
    MapPin, 
    Hash,
    Briefcase,
    ArrowLeft,
    FileText,
    CheckCircle2,
    XCircle,
    Download
} from "lucide-react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface UserDetailViewProps {
  user: User;
  onApprove: (id: number) => void;
  onReject: (id: number, reason: string) => void;
}

export function UserDetailView({ user, onApprove, onReject }: UserDetailViewProps) {
    const router = useRouter();
    const [rejectReason, setRejectReason] = useState("");
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

    const getStatusColor = (status: UserStatus) => {
        switch (status) {
            case UserStatus.ACTIVE: return "bg-green-100 text-green-700 border-green-200";
            case UserStatus.PENDING: return "bg-yellow-100 text-yellow-700 border-yellow-200";
            case UserStatus.REJECTED: return "bg-red-100 text-red-700 border-red-200";
            default: return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    const handleConfirmReject = () => {
        onReject(user.id, rejectReason);
        setIsRejectDialogOpen(false);
    };

    return (
        <div className="flex flex-col space-y-6 animate-in fade-in duration-500">
             {/* Navigation / Back Button */}
             <div className="flex items-center gap-4">
                <Button variant="ghost" className="gap-2 text-gray-500" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
                </Button>
                <div className="text-sm breadcrumbs text-gray-400">
                    <span className="mr-2">Quản trị</span> / <span className="mx-2">Quản lý người dùng</span> / <span className="ml-2 font-semibold text-gray-900">Chi tiết người dùng</span>
                </div>
             </div>

            {/* 1. Header Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col md:flex-row items-start md:items-center gap-6 border border-gray-100">
                <Avatar className="w-24 h-24 border-4 border-white shadow-lg ring-1 ring-gray-100">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.full_name}`} />
                    <AvatarFallback>{user.full_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-gray-900">{user.full_name}</h2>
                        <Badge variant="outline" className={`px-3 py-1 bg-white ${getStatusColor(user.status)}`}>
                            {user.status === 'PENDING' ? 'Chờ duyệt' : user.status === 'ACTIVE' ? 'Hoạt động' : user.status === 'REJECTED' ? 'Đã từ chối' : user.status}
                        </Badge>
                    </div>
                    <div className="text-gray-500 font-medium flex items-center gap-2 text-sm">
                        <Briefcase className="w-4 h-4" />
                        <span className="text-green-600 font-semibold">{user.role}</span>
                        <span className="text-gray-300">|</span> 
                        <span className="text-gray-400 font-normal">Ngày đăng ký: {new Date(user.date_joined).toLocaleDateString('vi-VN')}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-x-8 gap-y-4 min-w-[300px] border-l pl-8 border-gray-100">
                        <div className="space-y-1">
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Mã người dùng</p>
                            <p className="font-semibold text-gray-900">#{user.id}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Số điện thoại</p>
                            <p className="font-semibold text-gray-900">{user.phone}</p>
                        </div>
                        <div className="space-y-1 col-span-2">
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Email</p>
                            <p className="font-semibold text-gray-900">{user.email}</p>
                        </div>
                </div>
            </div>

            {/* 2. Tabs & Content */}
            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="bg-transparent p-0 border-b w-full justify-start h-auto rounded-none mb-6 gap-6">
                    <TabsTrigger 
                        value="profile" 
                        className="px-4 py-3 rounded-t-lg border-b-2 border-transparent data-[state=active]:border-green-600 data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:shadow-sm bg-gray-50/50"
                    >
                        Hồ sơ người dùng
                    </TabsTrigger>
                    <TabsTrigger 
                        value="documents" 
                        className="px-4 py-3 rounded-t-lg border-b-2 border-transparent data-[state=active]:border-green-600 data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:shadow-sm bg-gray-50/50"
                    >
                        Hợp đồng & Tài liệu
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Personal/Business Info Card */}
                        <Card className="border-none shadow-sm ring-1 ring-gray-100">
                            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between bg-gray-50/30 rounded-t-xl">
                                <CardTitle className="text-base font-bold text-gray-800">Thông tin doanh nghiệp</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 grid grid-cols-2 gap-y-6 gap-x-4">
                                {user.business_profile ? (
                                    <>
                                        <div className="col-span-2 space-y-1">
                                            <label className="text-xs font-medium text-gray-400 uppercase">Tên doanh nghiệp</label>
                                            <p className="text-sm font-bold text-gray-900">{user.business_profile.business_name}</p>
                                        </div>
                                        <div className="space-y-1">
                                                <label className="text-xs font-medium text-gray-400 uppercase">Mã số thuế</label>
                                                <p className="text-sm font-semibold text-gray-900">{user.business_profile.tax_id}</p>
                                        </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-medium text-gray-400 uppercase">GPKD số</label>
                                                <p className="text-sm font-semibold text-gray-900">{user.business_profile.license_number}</p>
                                        </div>
                                        <div className="col-span-2 space-y-1">
                                                <label className="text-xs font-medium text-gray-400 uppercase">Địa chỉ</label>
                                                <p className="text-sm text-gray-700 font-medium">{user.business_profile.address}</p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="col-span-2 py-4 text-center text-gray-400 italic">Không có thông tin doanh nghiệp</div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Account Info Card */}
                        <Card className="border-none shadow-sm ring-1 ring-gray-100">
                             <CardHeader className="pb-3 border-b flex flex-row items-center justify-between bg-gray-50/30 rounded-t-xl">
                                <CardTitle className="text-base font-bold text-gray-800">Trạng thái tài khoản</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 relative overflow-hidden">
                                       <div className="absolute right-0 top-0 opacity-10">
                                            <Briefcase className="w-24 h-24 text-blue-600 -rotate-12 transform translate-x-4 -translate-y-4" />
                                       </div>
                                       <div className="relative z-10">
                                           <h4 className="text-lg font-bold text-blue-900 mb-2">Cần xem xét</h4>
                                           <p className="text-sm text-blue-700 leading-relaxed mb-4 max-w-[80%]">
                                               {user.status === UserStatus.PENDING 
                                                   ? "Tài khoản này đang chờ quản trị viên phê duyệt. Vui lòng xác minh hồ sơ doanh nghiệp." 
                                                   : `Trạng thái hiện tại là ${user.status === 'ACTIVE' ? 'Hoạt động' : user.status === 'REJECTED' ? 'Đã từ chối' : user.status}.`}
                                           </p>
                                           <div className="flex gap-3 mt-4">
                                               {user.status === UserStatus.PENDING && (
                                                   <>
                                                        <Button className="bg-green-600 hover:bg-green-700 shadow-md shadow-green-200" onClick={() => onApprove(user.id)}>
                                                            <CheckCircle2 className="w-4 h-4 mr-2" /> Phê duyệt
                                                        </Button>
                                                        <Button variant="destructive" className="shadow-md shadow-red-200" onClick={() => setIsRejectDialogOpen(true)}>
                                                             <XCircle className="w-4 h-4 mr-2" /> Từ chối
                                                        </Button>
                                                   </>
                                               )}
                                           </div>
                                       </div>
                                    </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                    {/* Documents Tab */}
                <TabsContent value="documents" className="min-h-[300px]">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="border-none shadow-sm ring-1 ring-gray-100 col-span-3">
                            <CardHeader className="pb-3 border-b bg-gray-50/30 rounded-t-xl">
                                <CardTitle className="text-base font-bold text-gray-800">Tài liệu đã tải lên</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {user.business_profile?.license_file_url ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div className="border border-gra-200 rounded-xl p-4 flex flex-col gap-4 hover:shadow-md transition-shadow bg-white group relative">
                                            <div className="flex items-start justify-between">
                                                <div className="p-3 bg-red-50 text-red-600 rounded-lg group-hover:bg-red-100 transition-colors">
                                                    <FileText className="w-6 h-6" />
                                                </div>
                                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Đã xác minh</Badge>
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">Giấy phép kinh doanh</p>
                                                <p className="text-xs text-gray-500 mt-1">Tải lên ngày {new Date(user.date_joined).toLocaleDateString('vi-VN')}</p>
                                            </div>
                                            <div className="mt-auto pt-2">
                                                 <a 
                                                    href={user.business_profile.license_file_url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center w-full py-2 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors gap-2"
                                                >
                                                    <Download className="w-4 h-4" /> Tải xuống / Xem
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-12 text-center text-gray-400 flex flex-col items-center gap-2">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                                            <FileText className="w-8 h-8 text-gray-300" />
                                        </div>
                                        <p>Chưa có tài liệu nào được tải lên.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Reject Reason Modal */}
            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Từ chối người dùng</DialogTitle>
                        <DialogDescription>Vui lòng cung cấp lý do từ chối người dùng này.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Input 
                            value={rejectReason} 
                            onChange={(e) => setRejectReason(e.target.value)} 
                            placeholder="Lý do (ví dụ: Giấy phép không hợp lệ, Spam...)"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>Hủy bỏ</Button>
                        <Button variant="destructive" onClick={handleConfirmReject} disabled={!rejectReason.trim()}>Xác nhận từ chối</Button>
                    </DialogFooter>
                </DialogContent>
             </Dialog>

        </div>
    );
}
