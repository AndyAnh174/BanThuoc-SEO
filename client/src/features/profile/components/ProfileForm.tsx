"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, Loader2, ArrowLeft, Building2, FileText, MapPin, Receipt, CheckCircle2, XCircle, ExternalLink, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { AvatarUpload } from "./AvatarUpload";
import { getProfile, updateProfile, changePassword, getPointHistory } from "../api/profile.api";
import { UserProfile } from "../types/profile.types";

export function ProfileForm() {
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    // Form state
    const [fullName, setFullName] = useState("");
    
    // Password change state
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [phone, setPhone] = useState("");

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const data = await getProfile();
            setProfile(data);
            setFullName(data.full_name || "");
            setPhone(data.phone || "");
            
            // Save to localStorage for header to use
            if (typeof window !== 'undefined') {
                localStorage.setItem('userInfo', JSON.stringify({
                    full_name: data.full_name,
                    avatar: data.avatar
                }));
            }
        } catch (error: any) {
            if (error.response?.status === 401) {
                toast.error("Vui lòng đăng nhập để xem thông tin");
                router.push("/auth/login");
            } else {
                toast.error("Không thể tải thông tin người dùng");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        
        try {
            const updatedProfile = await updateProfile({
                full_name: fullName,
                phone: phone
            });
            setProfile(updatedProfile);
            
            // Update localStorage
            if (typeof window !== 'undefined') {
                localStorage.setItem('userInfo', JSON.stringify({
                    full_name: fullName,
                    avatar: updatedProfile.avatar
                }));
                window.dispatchEvent(new Event('userInfoUpdated'));
            }
            
            toast.success("Cập nhật thông tin thành công");
        } catch (error: any) {
            const message = error.response?.data?.detail || "Không thể cập nhật thông tin";
            toast.error(message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAvatarChange = (newUrl: string) => {
        if (profile) {
            const updatedProfile = { ...profile, avatar: newUrl };
            setProfile(updatedProfile);
            
            // Update localStorage and dispatch event for header
            if (typeof window !== 'undefined') {
                localStorage.setItem('userInfo', JSON.stringify({
                    full_name: profile.full_name,
                    avatar: newUrl
                }));
                // Dispatch custom event to notify header
                window.dispatchEvent(new Event('userInfoUpdated'));
            }
        }
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'ADMIN': return "Quản trị viên";
            case 'CUSTOMER': return "Khách hàng";
            default: return role;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return "bg-green-100 text-green-700";
            case 'PENDING': return "bg-yellow-100 text-yellow-700";
            case 'REJECTED': return "bg-red-100 text-red-700";
            case 'LOCKED': return "bg-gray-100 text-gray-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'ACTIVE': return "Hoạt động";
            case 'PENDING': return "Chờ duyệt";
            case 'REJECTED': return "Đã từ chối";
            case 'LOCKED': return "Đã khóa";
            default: return status;
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Không thể tải thông tin người dùng</p>
                <Button onClick={() => router.push("/auth/login")} className="mt-4">
                    Đăng nhập
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            {/* Back button */}
            <Button 
                variant="ghost" 
                onClick={() => router.back()} 
                className="mb-6"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
            </Button>

            {/* Header Card */}
            <Card className="shadow-lg mb-6">
                <CardHeader className="text-center pb-4">
                    {/* Avatar */}
                    <div className="mb-4">
                        <AvatarUpload 
                            currentAvatar={profile.avatar}
                            fullName={profile.full_name || profile.username}
                            onAvatarChange={handleAvatarChange}
                        />
                    </div>
                    
                    <CardTitle className="text-2xl">{profile.full_name || profile.username}</CardTitle>
                    <CardDescription className="flex items-center justify-center gap-2 mt-2 flex-wrap">
                        <Badge variant="outline">{getRoleLabel(profile.role)}</Badge>
                        <Badge className={getStatusColor(profile.status)}>
                            {getStatusLabel(profile.status)}
                        </Badge>
                    </CardDescription>
                </CardHeader>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-4 h-auto">
                    <TabsTrigger value="personal" className="flex items-center gap-2 py-2">
                        <User className="w-4 h-4" />
                        Cá nhân
                    </TabsTrigger>
                    <TabsTrigger value="business" className="flex items-center gap-2 py-2">
                        <Building2 className="w-4 h-4" />
                        Doanh nghiệp
                    </TabsTrigger>
                    <TabsTrigger value="password" className="flex items-center gap-2 py-2">
                        <Lock className="w-4 h-4" />
                        Đổi mật khẩu
                    </TabsTrigger>
                    <TabsTrigger value="loyalty" className="flex items-center gap-2 py-2">
                        <Receipt className="w-4 h-4" />
                        Điểm thưởng
                    </TabsTrigger>
                </TabsList>
                
                {/* Personal Info Tab */}
                <TabsContent value="personal">
                    <Card className="shadow-lg">
                        <CardContent className="pt-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Email - readonly */}
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        Email
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={profile.email}
                                        disabled
                                        className="bg-gray-50"
                                    />
                                    <p className="text-xs text-gray-500">Email không thể thay đổi</p>
                                </div>

                                {/* Full Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="full_name" className="flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        Họ và tên
                                    </Label>
                                    <Input
                                        id="full_name"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Nhập họ và tên"
                                    />
                                </div>

                                {/* Phone */}
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="flex items-center gap-2">
                                        <Phone className="w-4 h-4" />
                                        Số điện thoại
                                    </Label>
                                    <Input
                                        id="phone"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="Nhập số điện thoại"
                                    />
                                </div>

                                {/* Submit Button */}
                                <Button 
                                    type="submit" 
                                    className="w-full bg-green-600 hover:bg-green-700"
                                    disabled={isSaving}
                                >
                                    {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Lưu thay đổi
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Business Info Tab */}
                <TabsContent value="business">
                    <Card className="shadow-lg">
                        <CardContent className="pt-6">
                            {profile.business_profile ? (
                                <div className="space-y-6">
                                    {/* Business Name */}
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-gray-600">
                                            <Building2 className="w-4 h-4" />
                                            Tên doanh nghiệp
                                        </Label>
                                        <div className="p-3 bg-gray-50 rounded-md font-medium">
                                            {profile.business_profile.business_name}
                                        </div>
                                    </div>

                                    {/* License Number */}
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-gray-600">
                                            <FileText className="w-4 h-4" />
                                            Số giấy phép kinh doanh
                                        </Label>
                                        <div className="p-3 bg-gray-50 rounded-md font-medium">
                                            {profile.business_profile.license_number}
                                        </div>
                                    </div>

                                    {/* Tax ID */}
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-gray-600">
                                            <Receipt className="w-4 h-4" />
                                            Mã số thuế
                                        </Label>
                                        <div className="p-3 bg-gray-50 rounded-md font-medium">
                                            {profile.business_profile.tax_id}
                                        </div>
                                    </div>

                                    {/* Address */}
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-gray-600">
                                            <MapPin className="w-4 h-4" />
                                            Địa chỉ
                                        </Label>
                                        <div className="p-3 bg-gray-50 rounded-md">
                                            {profile.business_profile.address}
                                        </div>
                                    </div>

                                    {/* License File */}
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-gray-600">
                                            <FileText className="w-4 h-4" />
                                            Giấy phép kinh doanh
                                        </Label>
                                        <div className="p-3 bg-gray-50 rounded-md space-y-2">
                                            {(() => {
                                                const urls = profile.business_profile?.license_file_url;
                                                return urls && urls.length > 0 ? (
                                                    urls.map((url, idx) => (
                                                    <a
                                                        key={idx}
                                                        href={url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 text-green-600 hover:text-green-700 hover:underline"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                        Xem giấy phép {urls.length > 1 ? `#${idx + 1}` : ''}
                                                    </a>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-400">Chưa có file</span>
                                                );
                                            })()}
                                        </div>
                                    </div>

                                    {/* Note */}
                                    <p className="text-sm text-gray-500 bg-yellow-50 p-3 rounded-md">
                                        💡 Để cập nhật thông tin doanh nghiệp, vui lòng liên hệ quản trị viên.
                                    </p>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Building2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                    <p className="text-gray-500 text-lg mb-2">Chưa có thông tin doanh nghiệp</p>
                                    <p className="text-gray-400 text-sm">
                                        Thông tin này chỉ áp dụng cho tài khoản B2B
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Password Tab */}
                <TabsContent value="password">
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="w-5 h-5" />
                                Đổi mật khẩu
                            </CardTitle>
                            <CardDescription>
                                Cập nhật mật khẩu để bảo mật tài khoản của bạn
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                if (newPassword !== confirmPassword) {
                                    toast.error("Mật khẩu mới không khớp");
                                    return;
                                }
                                if (newPassword.length < 6) {
                                    toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
                                    return;
                                }
                                setIsChangingPassword(true);
                                try {
                                    await changePassword({
                                        old_password: oldPassword,
                                        new_password: newPassword,
                                        confirm_password: confirmPassword
                                    });
                                    toast.success("Đổi mật khẩu thành công");
                                    setOldPassword("");
                                    setNewPassword("");
                                    setConfirmPassword("");
                                } catch (error: any) {
                                    const message = error.response?.data?.error || "Đổi mật khẩu thất bại";
                                    toast.error(message);
                                } finally {
                                    setIsChangingPassword(false);
                                }
                            }} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="old_password">Mật khẩu hiện tại</Label>
                                    <Input
                                        id="old_password"
                                        type="password"
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        placeholder="Nhập mật khẩu hiện tại"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="new_password">Mật khẩu mới</Label>
                                    <Input
                                        id="new_password"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirm_password">Xác nhận mật khẩu mới</Label>
                                    <Input
                                        id="confirm_password"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Nhập lại mật khẩu mới"
                                        required
                                    />
                                </div>
                                <Button 
                                    type="submit" 
                                    className="w-full bg-green-600 hover:bg-green-700"
                                    disabled={isChangingPassword}
                                >
                                    {isChangingPassword ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xử lý...</>
                                    ) : (
                                        "Đổi mật khẩu"
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>
                
                {/* Reward Points Tab */}
                <TabsContent value="loyalty">
                    <div className="space-y-6">
                        {/* Points Summary */}
                        <Card className="border-none shadow-sm ring-1 ring-gray-100 bg-linear-to-br from-yellow-50 to-white">
                             <CardContent className="p-6 flex items-center gap-6">
                                <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center border-4 border-white shadow-xs">
                                    <span className="text-3xl">👑</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Điểm tích lũy hiện tại</h3>
                                    <p className="text-3xl font-black text-yellow-600 tracking-tight">
                                        {profile.loyalty_points ? new Intl.NumberFormat('vi-VN').format(profile.loyalty_points) : 0}
                                        <span className="text-sm font-medium text-gray-500 ml-1">điểm</span>
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Dùng điểm để đổi ưu đãi khi mua hàng
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <LoyaltyHistory />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function LoyaltyHistory() {
    const [logs, setLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await getPointHistory();
                setLogs(data);
            } catch (error) {
                console.error("Failed to fetch point history", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistory();
    }, []);

    if (isLoading) {
        return <div className="py-8 text-center text-gray-500">Đang tải lịch sử...</div>;
    }

    if (logs.length === 0) {
        return (
            <Card className="border-none shadow-sm ring-1 ring-gray-100">
                <CardContent className="py-12 text-center text-gray-500">
                    <Receipt className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p>Chưa có lịch sử tích điểm</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-none shadow-sm ring-1 ring-gray-100">
             <CardHeader className="pb-3 border-b bg-gray-50/30 rounded-t-xl">
                 <CardTitle className="text-base font-bold text-gray-800">Lịch sử giao dịch</CardTitle>
             </CardHeader>
             <CardContent className="pt-0">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium">
                        <tr>
                            <th className="px-4 py-3">Thời gian</th>
                            <th className="px-4 py-3">Hoạt động</th>
                            <th className="px-4 py-3 text-right">Số điểm</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-gray-600">
                                    {log.created_at}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="font-medium text-gray-900">{log.reason_display}</div>
                                    <div className="text-xs text-gray-500 truncate max-w-[200px]" title={log.description}>
                                        {log.description} {log.related_order && `(#${log.related_order})`}
                                    </div>
                                </td>
                                <td className={`px-4 py-3 font-bold text-right ${log.points > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                    {log.points > 0 ? '+' : ''}{log.points}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </CardContent>
        </Card>
    );
}
