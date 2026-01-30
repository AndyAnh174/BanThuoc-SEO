"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, Download, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { downloadInvoice } from "@/src/features/orders/api/orders.api";
import { toast } from "sonner";

export function CheckoutSuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");
    
    // We assume these are passed or user has to check email/profile for details
    // But for better UX, we could fetch order details if we had an API that allowed guest access with token or just auth
    // For now, let's rely on params or state, but strictly we just show generic success + instructions based on payment method
    // Actually, CheckoutPage passed params? No, let's check how we redirect. 
    // We should redirect like: router.push(`/checkout/success?orderId=${order.id}&method=${data.paymentMethod}`)

    const paymentMethod = searchParams.get("method") || "COD";
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownloadInvoice = async () => {
        if (!orderId) return;
        setIsDownloading(true);
        try {
            await downloadInvoice(Number(orderId));
            toast.success("Đang tải xuống hóa đơn...");
        } catch (error) {
            toast.error("Không thể tải hóa đơn. Vui lòng thử lại sau.");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-3xl">
            <div className="text-center mb-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Đặt hàng thành công!</h1>
                <p className="text-gray-500">Cảm ơn bạn đã mua hàng. Mã đơn hàng của bạn là <span className="font-bold text-black">#{orderId || "..."}</span></p>
            </div>

            <div className="grid gap-6">
                {/* Payment Instructions */}
                <Card className="border-green-100 bg-green-50/30">
                    <CardHeader>
                        <CardTitle className="text-xl text-green-800">Thông tin thanh toán</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {paymentMethod === 'BANKING' ? (
                            <div className="flex flex-col md:flex-row gap-8 items-center">
                                <div className="bg-white p-4 rounded-xl shadow-sm border">
                                    <div className="aspect-square w-48 relative overflow-hidden rounded-lg bg-gray-100 mb-2">
                                         {/* Replace with actual QR Bank Image path */}
                                        <img src="/qr-bank.jpg" alt="QR Code Ngân hàng" className="object-cover w-full h-full" />
                                    </div>
                                    <p className="text-center text-xs text-gray-500">Quét mã để thanh toán</p>
                                </div>
                                <div className="space-y-4 flex-1">
                                    <div className="space-y-1">
                                        <p className="text-sm text-gray-500">Ngân hàng</p>
                                        <p className="font-bold text-gray-900">MB Bank (Quân Đội)</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-gray-500">Số tài khoản</p>
                                        <p className="font-bold text-gray-900 text-lg">0000 1234 56789</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-gray-500">Chủ tài khoản</p>
                                        <p className="font-bold text-gray-900 uppercase">Cong Ty Web Ban Thuoc</p>
                                    </div>
                                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                                        ⚠️ Nội dung chuyển khoản: <strong>THANHTOAN DON #{orderId}</strong>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl">🚚</span>
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2">Thanh toán khi nhận hàng (COD)</h3>
                                <p className="text-gray-600 max-w-md mx-auto">
                                    Vui lòng chuẩn bị tiền mặt khi nhân viên giao hàng liên hệ. 
                                    Đơn hàng sẽ được xử lý và giao đến bạn trong thời gian sớm nhất.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
                    <Button variant="outline" className="gap-2" onClick={() => router.push('/')}>
                        <ArrowRight className="w-4 h-4 rotate-180" /> Về trang chủ
                    </Button>
                    <Button variant="outline" className="gap-2 border-green-600 text-green-700 hover:bg-green-50" onClick={handleDownloadInvoice} disabled={!orderId || isDownloading}>
                        <Download className="w-4 h-4" /> {isDownloading ? "Đang tải..." : "Tải hóa đơn PDF"}
                    </Button>
                    <Button className="gap-2 bg-green-600 hover:bg-green-700" onClick={() => router.push('/products')}>
                        <ShoppingBag className="w-4 h-4" /> Tiếp tục mua sắm
                    </Button>
                </div>
            </div>
        </div>
    );
}
