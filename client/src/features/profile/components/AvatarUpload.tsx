"use client";

import { useState, useRef } from "react";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { uploadAvatar } from "../api/profile.api";

interface AvatarUploadProps {
    currentAvatar: string | null;
    fullName: string;
    onAvatarChange: (newUrl: string) => void;
}

export function AvatarUpload({ currentAvatar, fullName, onAvatarChange }: AvatarUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Get initials for default avatar
    const getInitials = (name: string) => {
        if (!name) return "U";
        const words = name.trim().split(" ");
        if (words.length >= 2) {
            return (words[0][0] + words[words.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error("Vui lòng chọn file ảnh");
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Kích thước file không được vượt quá 5MB");
            return;
        }

        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreviewUrl(e.target?.result as string);
        };
        reader.readAsDataURL(file);

        // Upload file
        setIsUploading(true);
        try {
            const result = await uploadAvatar(file);
            onAvatarChange(result.avatar);
            toast.success("Cập nhật avatar thành công");
        } catch (error: any) {
            const message = error.response?.data?.error || "Không thể upload avatar";
            toast.error(message);
            setPreviewUrl(null);
        } finally {
            setIsUploading(false);
        }
    };

    const displayUrl = previewUrl || currentAvatar;

    return (
        <div className="flex flex-col items-center">
            <div className="relative group">
                {/* Avatar Display */}
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-linear-to-br from-green-400 to-green-600">
                    {displayUrl ? (
                        <img 
                            src={displayUrl} 
                            alt="Avatar" 
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">
                            {getInitials(fullName)}
                        </div>
                    )}
                </div>

                {/* Upload Overlay */}
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                >
                    {isUploading ? (
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                    ) : (
                        <Camera className="w-8 h-8 text-white" />
                    )}
                </button>

                {/* Hidden File Input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>
            
            <p className="mt-3 text-sm text-gray-500">
                Click để thay đổi avatar
            </p>
        </div>
    );
}
