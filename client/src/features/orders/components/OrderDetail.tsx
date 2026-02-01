'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { 
    ChevronLeft, 
    MapPin, 
    CreditCard, 
    Truck, 
    Package, 
    Clock, 
    CheckCircle2, 
    XCircle,
    Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { getOrder, downloadInvoice } from '../api/orders.api';
import { toast } from 'sonner';
import Image from 'next/image';

interface OrderItem {
    id: number;
    product: string; // Product Name
    product_image?: string; // URL if available
    quantity: number;
    price: number;
    total_price: number;
}

interface OrderDetail {
    id: number;
    created_at: string;
    status: string;
    payment_method: string;
    shipping_address: string;
    receiver_name: string;
    receiver_phone: string;
    shipping_fee: number;
    discount_amount: number;
    total_amount: number;
    final_amount: number;
    items: OrderItem[];
    note?: string;
}

interface OrderDetailProps {
    orderId: string | number;
}

export function OrderDetail({ orderId }: OrderDetailProps) {
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!orderId) return;

        const fetchOrder = async () => {
            try {
                const response = await getOrder(orderId);
                setOrder(response.data);
            } catch (error) {
                console.error('Failed to fetch order', error);
                toast.error('Không thể tải thông tin đơn hàng');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

   const handleDownloadInvoice = async () => {
        if (!order) return;
        try {
            toast.loading('Đang tải hóa đơn...');
            await downloadInvoice(order.id);
            toast.dismiss();
            toast.success('Đã tải hóa đơn thành công');
        } catch (error) {
            toast.dismiss();
            toast.error('Không thể tải hóa đơn');
        }
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'PENDING':
                return { label: 'Chờ xác nhận', color: 'text-yellow-600', bg: 'bg-yellow-50', icon: Clock, step: 1 };
            case 'CONFIRMED':
                return { label: 'Đã xác nhận', color: 'text-blue-600', bg: 'bg-blue-50', icon: CheckCircle2, step: 2 };
            case 'SHIPPING':
                return { label: 'Đang giao hàng', color: 'text-purple-600', bg: 'bg-purple-50', icon: Truck, step: 3 };
            case 'COMPLETED':
                return { label: 'Giao thành công', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle2, step: 4 };
            case 'CANCELLED':
                return { label: 'Đã hủy', color: 'text-red-600', bg: 'bg-red-50', icon: XCircle, step: 0 };
            default:
                return { label: status, color: 'text-gray-600', bg: 'bg-gray-50', icon: Package, step: 0 };
        }
    };

    const getPaymentText = (method: string) => {
        return method === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : 'Chuyển khoản ngân hàng';
    };

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                    <div className="md:col-span-2 space-y-6">
                        <Skeleton className="h-[200px]" />
                        <Skeleton className="h-[300px]" />
                    </div>
                    <div className="space-y-6">
                        <Skeleton className="h-[200px]" />
                    </div>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <p className="text-gray-500 mb-4">Không tìm thấy đơn hàng</p>
                <Button variant="outline" asChild>
                    <Link href="/orders">Quay lại danh sách</Link>
                </Button>
            </div>
        );
    }

    const statusInfo = getStatusInfo(order.status);
    const StatusIcon = statusInfo.icon;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <Link href="/orders" className="hover:text-primary flex items-center gap-1 transition-colors">
                            <ChevronLeft className="w-4 h-4" />
                            Danh sách đơn hàng
                        </Link>
                        <span>/</span>
                        <span>Chi tiết</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-900">Đơn hàng #{order.id}</h1>
                        <Badge className={`${statusInfo.bg} ${statusInfo.color} border-0 px-3 py-1`}>
                            {statusInfo.label}
                        </Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                        Đặt ngày {format(new Date(order.created_at), 'HH:mm dd/MM/yyyy', { locale: vi })}
                    </p>
                </div>
                
                <div className="flex gap-3">
                     <Button variant="outline" onClick={handleDownloadInvoice} className="gap-2">
                        <Download className="w-4 h-4" />
                        Xuất hóa đơn
                    </Button>
                    {/* Only show Re-buy if completed? Or always? Assuming always or based on logic */}
                    <Button className="bg-primary hover:bg-primary/90">Mua lại đơn này</Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Left Column: Items and Status */}
                <div className="md:col-span-2 space-y-6">
                    {/* Status Tracker (Simple) */}
                    <Card className="border-none shadow-sm bg-gradient-to-r from-green-50 to-emerald-50/50">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full ${statusInfo.bg} flex items-center justify-center`}>
                                <StatusIcon className={`w-6 h-6 ${statusInfo.color}`} />
                            </div>
                            <div>
                                <p className={`font-semibold ${statusInfo.color} text-lg`}>
                                    {statusInfo.label}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {order.status === 'COMPLETED' 
                                        ? 'Cảm ơn bạn đã mua sắm tại BanThuoc!' 
                                        : 'Đơn hàng đang được xử lý theo quy trình.'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Order Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Sản phẩm ({order.items.length})</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {order.items.map((item, index) => (
                                    <div key={index} className="p-4 flex gap-4 hover:bg-gray-50 transition-colors">
                                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden relative border">
                                           {/* Placeholder or actual image if available in API response */}
                                           <Package className="w-8 h-8 text-gray-300" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900 line-clamp-2">{item.product}</h4>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {formatMoney(item.price)} x {item.quantity}
                                            </p>
                                        </div>
                                        <div className="text-right font-semibold text-gray-900">
                                            {formatMoney(item.total_price)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Info and Totals */}
                <div className="space-y-6">
                    {/* Shipping Address */}
                    <Card>
                        <CardHeader className="pb-3 border-b">
                            <CardTitle className="text-base flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-primary" />
                                Địa chỉ nhận hàng
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-3">
                            <div>
                                <p className="font-medium text-gray-900">{order.receiver_name}</p>
                                <p className="text-sm text-gray-500">{order.receiver_phone}</p>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed">
                                {order.shipping_address}
                            </p>
                            {order.note && (
                                <div className="text-sm bg-yellow-50 p-3 rounded-md text-yellow-800 border border-yellow-100 mt-2">
                                    <span className="font-semibold block text-xs uppercase mb-1">Ghi chú:</span>
                                    {order.note}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Payment Info */}
                    <Card>
                        <CardHeader className="pb-3 border-b">
                            <CardTitle className="text-base flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-primary" />
                                Thanh toán
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <p className="text-sm font-medium text-gray-900 mb-4">
                                {getPaymentText(order.payment_method)}
                            </p>
                            
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-gray-500">
                                    <span>Tạm tính</span>
                                    <span>{formatMoney(order.total_amount)}</span>
                                </div>
                                <div className="flex justify-between text-gray-500">
                                    <span>Phí vận chuyển</span>
                                    <span>{formatMoney(order.shipping_fee)}</span>
                                </div>
                                {order.discount_amount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Giảm giá</span>
                                        <span>-{formatMoney(order.discount_amount)}</span>
                                    </div>
                                )}
                                <Separator className="my-2" />
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-gray-900">Tổng cộng</span>
                                    <span className="font-bold text-xl text-primary">
                                        {formatMoney(order.final_amount)}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
