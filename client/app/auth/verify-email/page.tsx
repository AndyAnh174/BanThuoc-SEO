"use client";

import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { Suspense } from "react";

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const status = searchParams.get("status");

    const getContent = () => {
        switch (status) {
            case "success":
                return {
                    icon: <CheckCircle2 className="w-20 h-20 text-green-500" />,
                    title: "Xác thực thành công!",
                    description: "Email của bạn đã được xác thực. Bạn có thể đăng nhập ngay bây giờ.",
                    color: "text-green-600",
                    bgColor: "bg-green-50",
                    showLogin: true
                };
            case "expired":
                return {
                    icon: <Clock className="w-20 h-20 text-yellow-500" />,
                    title: "Link đã hết hạn",
                    description: "Link xác thực đã hết hạn. Vui lòng liên hệ quản trị viên để được hỗ trợ.",
                    color: "text-yellow-600",
                    bgColor: "bg-yellow-50",
                    showLogin: false
                };
            case "invalid":
                return {
                    icon: <XCircle className="w-20 h-20 text-red-500" />,
                    title: "Link không hợp lệ",
                    description: "Link xác thực không hợp lệ hoặc đã được sử dụng.",
                    color: "text-red-600",
                    bgColor: "bg-red-50",
                    showLogin: false
                };
            default:
                return {
                    icon: <Clock className="w-20 h-20 text-gray-400" />,
                    title: "Đang xử lý...",
                    description: "Vui lòng đợi trong khi chúng tôi xác thực email của bạn.",
                    color: "text-gray-600",
                    bgColor: "bg-gray-50",
                    showLogin: false
                };
        }
    };

    const content = getContent();

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-xl">
                <CardHeader className="text-center pb-2">
                    <div className={`mx-auto p-6 rounded-full ${content.bgColor} mb-4`}>
                        {content.icon}
                    </div>
                    <CardTitle className={`text-2xl ${content.color}`}>
                        {content.title}
                    </CardTitle>
                    <CardDescription className="text-base mt-2">
                        {content.description}
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                    {content.showLogin ? (
                        <Link href="/auth/login">
                            <Button className="w-full bg-green-600 hover:bg-green-700">
                                Đăng nhập ngay
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    ) : (
                        <Link href="/">
                            <Button variant="outline" className="w-full">
                                Về trang chủ
                            </Button>
                        </Link>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}
