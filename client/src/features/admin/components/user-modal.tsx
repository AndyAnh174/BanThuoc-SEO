"use client";

import { useState, useEffect } from "react";
import { useAdminStore } from "../stores/admin.store";
import { User, UserRole, UserStatus, UserCreateData, UserUpdateData } from "../types/admin.types";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface UserModalProps {
    open: boolean;
    onClose: () => void;
    user?: User | null; // If provided, edit mode; otherwise, create mode
}

export function UserModal({ open, onClose, user }: UserModalProps) {
    const { createUser, updateUser } = useAdminStore();
    const [isLoading, setIsLoading] = useState(false);
    
    const isEditMode = !!user;
    
    // Form state
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        password_confirm: "",
        full_name: "",
        phone: "",
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
    });

    // Reset form when modal opens/closes or user changes
    useEffect(() => {
        if (open) {
            if (user) {
                setFormData({
                    username: user.username || "",
                    email: user.email || "",
                    password: "",
                    password_confirm: "",
                    full_name: user.full_name || "",
                    phone: user.phone || "",
                    role: user.role,
                    status: user.status,
                });
            } else {
                setFormData({
                    username: "",
                    email: "",
                    password: "",
                    password_confirm: "",
                    full_name: "",
                    phone: "",
                    role: UserRole.CUSTOMER,
                    status: UserStatus.ACTIVE,
                });
            }
        }
    }, [open, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (isEditMode && user) {
                // Update mode
                const updateData: UserUpdateData = {
                    full_name: formData.full_name,
                    phone: formData.phone,
                    email: formData.email,
                    role: formData.role,
                    status: formData.status,
                };
                
                // Only include password if provided
                if (formData.password) {
                    updateData.password = formData.password;
                }
                
                const result = await updateUser(user.id, updateData);
                if (result) {
                    onClose();
                }
            } else {
                // Create mode
                const createData: UserCreateData = {
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    password_confirm: formData.password_confirm,
                    full_name: formData.full_name,
                    phone: formData.phone,
                    role: formData.role,
                    status: formData.status,
                };
                
                const result = await createUser(createData);
                if (result) {
                    onClose();
                }
            }
        } finally {
            setIsLoading(false);
        }
    };

    const getRoleLabel = (role: UserRole) => {
        switch (role) {
            case UserRole.ADMIN: return "Quản trị viên";
            case UserRole.CUSTOMER: return "Khách hàng";
            default: return role;
        }
    };

    const getStatusLabel = (status: UserStatus) => {
        switch (status) {
            case UserStatus.ACTIVE: return "Hoạt động";
            case UserStatus.PENDING: return "Chờ duyệt";
            case UserStatus.REJECTED: return "Đã từ chối";
            case UserStatus.LOCKED: return "Đã khóa";
            default: return status;
        }
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {isEditMode ? "Chỉnh sửa người dùng" : "Tạo người dùng mới"}
                    </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Username - only for create mode */}
                    {!isEditMode && (
                        <div className="space-y-2">
                            <Label htmlFor="username">Tên đăng nhập *</Label>
                            <Input
                                id="username"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                                placeholder="Nhập tên đăng nhập"
                            />
                        </div>
                    )}
                    
                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            placeholder="Nhập email"
                        />
                    </div>
                    
                    {/* Full name */}
                    <div className="space-y-2">
                        <Label htmlFor="full_name">Họ và tên</Label>
                        <Input
                            id="full_name"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            placeholder="Nhập họ và tên"
                        />
                    </div>
                    
                    {/* Phone */}
                    <div className="space-y-2">
                        <Label htmlFor="phone">Số điện thoại</Label>
                        <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="Nhập số điện thoại"
                        />
                    </div>
                    
                    {/* Password */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">
                                {isEditMode ? "Mật khẩu mới" : "Mật khẩu *"}
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required={!isEditMode}
                                placeholder={isEditMode ? "Để trống nếu không đổi" : "Nhập mật khẩu"}
                            />
                        </div>
                        
                        {!isEditMode && (
                            <div className="space-y-2">
                                <Label htmlFor="password_confirm">Xác nhận mật khẩu *</Label>
                                <Input
                                    id="password_confirm"
                                    type="password"
                                    value={formData.password_confirm}
                                    onChange={(e) => setFormData({ ...formData, password_confirm: e.target.value })}
                                    required
                                    placeholder="Nhập lại mật khẩu"
                                />
                            </div>
                        )}
                    </div>
                    
                    {/* Role & Status */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Vai trò *</Label>
                            <Select
                                value={formData.role}
                                onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={UserRole.CUSTOMER}>{getRoleLabel(UserRole.CUSTOMER)}</SelectItem>
                                    <SelectItem value={UserRole.ADMIN}>{getRoleLabel(UserRole.ADMIN)}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div className="space-y-2">
                            <Label>Trạng thái</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => setFormData({ ...formData, status: value as UserStatus })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={UserStatus.ACTIVE}>{getStatusLabel(UserStatus.ACTIVE)}</SelectItem>
                                    <SelectItem value={UserStatus.PENDING}>{getStatusLabel(UserStatus.PENDING)}</SelectItem>
                                    <SelectItem value={UserStatus.LOCKED}>{getStatusLabel(UserStatus.LOCKED)}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    
                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {isEditMode ? "Cập nhật" : "Tạo mới"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
