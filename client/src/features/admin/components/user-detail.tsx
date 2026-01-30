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
                    <TabsTrigger 
                        value="orders" 
                        className="px-4 py-3 rounded-t-lg border-b-2 border-transparent data-[state=active]:border-green-600 data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:shadow-sm bg-gray-50/50"
                    >
                        Lịch sử đơn hàng ({user.orders?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger 
                        value="favorites" 
                        className="px-4 py-3 rounded-t-lg border-b-2 border-transparent data-[state=active]:border-green-600 data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:shadow-sm bg-gray-50/50"
                    >
                        Sản phẩm yêu thích ({user.favorites?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger 
                        value="loyalty" 
                        className="px-4 py-3 rounded-t-lg border-b-2 border-transparent data-[state=active]:border-green-600 data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:shadow-sm bg-gray-50/50"
                    >
                        Điểm thưởng
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-6">
                     {/* ... (existing profile content) ... */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Personal/Business Info Card */}
                        <Card className="border-none shadow-sm ring-1 ring-gray-100">
                            {/* ... */}
                            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between bg-gray-50/30 rounded-t-xl">
                                <CardTitle className="text-base font-bold text-gray-800">Thông tin doanh nghiệp</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 grid grid-cols-2 gap-y-6 gap-x-4">
                                {user.business_profile ? (
                                    <>
                                        {/* ... fields ... */}
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
                                <CardTitle className="text-base font-bold text-gray-800">Trạng thái & Điểm thưởng</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 relative overflow-hidden">
                                       <div className="absolute right-0 top-0 opacity-10">
                                            <Briefcase className="w-24 h-24 text-blue-600 -rotate-12 transform translate-x-4 -translate-y-4" />
                                       </div>
                                       <div className="relative z-10">
                                           <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h4 className="text-lg font-bold text-blue-900 mb-1">Trạng thái</h4>
                                                    <Badge className={`${getStatusColor(user.status)}`}>{user.status}</Badge>
                                                </div>
                                                <div className="text-right">
                                                    <h4 className="text-lg font-bold text-green-700 mb-1">Điểm tích lũy</h4>
                                                    <span className="text-2xl font-bold text-green-600">{user.loyalty_points || 0}</span>
                                                    <span className="text-xs text-green-500 block">điểm</span>
                                                </div>
                                           </div>
                                           
                                           <div className="flex gap-3 mt-4 border-t border-blue-200 pt-4">
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

                <TabsContent value="documents" className="min-h-[300px]">
                     {/* ... (existing documents content) ... */}
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

                <TabsContent value="orders">
                    <Card className="border-none shadow-sm ring-1 ring-gray-100">
                        <CardHeader className="pb-3 border-b bg-gray-50/30 rounded-t-xl">
                            <CardTitle className="text-base font-bold text-gray-800">Lịch sử đơn hàng</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            {user.orders && user.orders.length > 0 ? (
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-500 font-medium">
                                        <tr>
                                            <th className="px-4 py-3">Mã đơn</th>
                                            <th className="px-4 py-3">Ngày đặt</th>
                                            <th className="px-4 py-3">Tổng tiền</th>
                                            <th className="px-4 py-3">Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {user.orders.map((order: any) => (
                                            <tr key={order.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 font-medium">#{order.id}</td>
                                                <td className="px-4 py-3">{new Date(order.created_at).toLocaleDateString('vi-VN')}</td>
                                                <td className="px-4 py-3 font-bold text-green-600">
                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(order.total_amount))}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge variant="outline">{order.status}</Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="py-12 text-center text-gray-400">Chưa có đơn hàng nào.</div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="favorites">
                    <Card className="border-none shadow-sm ring-1 ring-gray-100">
                         <CardHeader className="pb-3 border-b bg-gray-50/30 rounded-t-xl">
                            <CardTitle className="text-base font-bold text-gray-800">Sản phẩm yêu thích</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                             {user.favorites && user.favorites.length > 0 ? (
                                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                     {user.favorites.map((prod: any) => (
                                         <div key={prod.id} className="border rounded-lg p-3 flex flex-col items-center text-center hover:shadow-sm">
                                             <div className="w-20 h-20 mb-2 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                                                 {prod.image_url || prod.images?.[0]?.image_url ? 
                                                     <img src={prod.image_url || prod.images[0].image_url} alt={prod.name} className="w-full h-full object-contain" /> :
                                                     <span className="text-xs text-gray-400">No Img</span>
                                                 }
                                             </div>
                                             <h4 className="font-medium text-sm line-clamp-2 mb-1" title={prod.name}>{prod.name}</h4>
                                             <p className="text-green-600 font-bold text-sm">
                                                 {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(prod.price))}
                                             </p>
                                         </div>
                                     ))}
                                 </div>
                             ) : (
                                 <div className="py-12 text-center text-gray-400">Chưa có sản phẩm yêu thích.</div>
                             )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="loyalty">
                    <div className="space-y-6">
                        {/* Points Summary */}
                        <Card className="border-none shadow-sm ring-1 ring-gray-100 bg-linear-to-br from-yellow-50 to-white">
                            <CardContent className="p-6 flex items-center gap-6">
                                <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center border-4 border-white shadow-xs">
                                    <span className="text-3xl">👑</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Tổng điểm tích lũy</h3>
                                    <p className="text-3xl font-black text-yellow-600 tracking-tight">
                                        {user.loyalty_points ? new Intl.NumberFormat('vi-VN').format(user.loyalty_points) : 0}
                                        <span className="text-sm font-medium text-gray-500 ml-1">điểm</span>
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* History Table */}
                        <Card className="border-none shadow-sm ring-1 ring-gray-100">
                            <CardHeader className="pb-3 border-b bg-gray-50/30 rounded-t-xl">
                                <CardTitle className="text-base font-bold text-gray-800">Lịch sử điểm thưởng</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                                {user.point_logs && user.point_logs.length > 0 ? (
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 text-gray-500 font-medium">
                                            <tr>
                                                <th className="px-4 py-3">Ngày giờ</th>
                                                <th className="px-4 py-3">Hoạt động</th>
                                                <th className="px-4 py-3">Số điểm</th>
                                                <th className="px-4 py-3">Mô tả</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {user.point_logs.map((log) => (
                                                <tr key={log.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-gray-600">
                                                        {log.created_at}
                                                    </td>
                                                    <td className="px-4 py-3 font-medium text-gray-900">
                                                        {log.reason_display}
                                                    </td>
                                                    <td className={`px-4 py-3 font-bold ${log.points > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                        {log.points > 0 ? '+' : ''}{log.points}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-500 max-w-xs truncate" title={log.description}>
                                                        {log.description || '-'} {log.related_order ? `(Đơn #${log.related_order})` : ''}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="py-12 text-center text-gray-400">Chưa có lịch sử điểm thưởng.</div>
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
