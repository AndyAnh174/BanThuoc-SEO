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
    Download,
    RotateCcw,
    AlertCircle
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { getOrder, downloadInvoice, cancelOrder, createReturnRequest, getMyReturnRequests } from '../api/orders.api';
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

interface ReturnRequest {
    id: string;
    order_id: number;
    reason: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
    refund_amount: number;
    admin_notes: string;
    created_at: string;
    processed_at: string | null;
}

export function OrderDetail({ orderId }: OrderDetailProps) {
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [returnRequest, setReturnRequest] = useState<ReturnRequest | null>(null);
    const [showReturnForm, setShowReturnForm] = useState(false);
    const [returnReason, setReturnReason] = useState('');
    const [submittingReturn, setSubmittingReturn] = useState(false);

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

    useEffect(() => {
        if (!orderId) return;
        getMyReturnRequests().then(res => {
            const items = res.data?.results || res.data || [];
            const found = items.find((r: ReturnRequest) => r.order_id === Number(orderId));
            if (found) setReturnRequest(found);
        }).catch(() => {});
    }, [orderId]);

    const [cancelling, setCancelling] = useState(false);

    const handleCancelOrder = async () => {
        if (!order) return;
        if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) return;

        setCancelling(true);
        try {
            const response = await cancelOrder(order.id);
            setOrder(response.data);
            toast.success('Đã hủy đơn hàng thành công');
        } catch (error: any) {
            const message = error.response?.data?.error || 'Không thể hủy đơn hàng';
            toast.error(message);
        } finally {
            setCancelling(false);
        }
    };

    const handleSubmitReturn = async () => {
        if (!order || !returnReason.trim()) {
            toast.error('Vui lòng nhập lý do trả hàng');
            return;
        }
        setSubmittingReturn(true);
        try {
            const res = await createReturnRequest(order.id, returnReason.trim());
            setReturnRequest(res.data);
            setShowReturnForm(false);
            setReturnReason('');
            toast.success('Đã gửi yêu cầu trả hàng');
        } catch (error: any) {
            const msg = error.response?.data?.error || error.response?.data?.detail || 'Không thể gửi yêu cầu trả hàng';
            toast.error(msg);
        } finally {
            setSubmittingReturn(false);
        }
    };

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
            case 'RETURNED':
                return { label: 'Đã trả hàng', color: 'text-orange-600', bg: 'bg-orange-50', icon: RotateCcw, step: 0 };
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
                    {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                        <Button
                            variant="destructive"
                            onClick={handleCancelOrder}
                            disabled={cancelling}
                            className="gap-2"
                        >
                            <XCircle className="w-4 h-4" />
                            {cancelling ? 'Đang hủy...' : 'Hủy đơn hàng'}
                        </Button>
                    )}
                    {order.status === 'COMPLETED' && !returnRequest && (
                        <Button
                            variant="outline"
                            onClick={() => setShowReturnForm(v => !v)}
                            className="gap-2 border-orange-300 text-orange-600 hover:bg-orange-50"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Yêu cầu trả hàng
                        </Button>
                    )}
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

                    {/* Return Request Form */}
                    {showReturnForm && (
                        <Card className="border-orange-200 bg-orange-50/30">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2 text-orange-700">
                                    <RotateCcw className="w-4 h-4" />
                                    Yêu cầu trả hàng
                                </CardTitle>
                                <CardDescription>Chính sách trả hàng trong vòng 7 ngày kể từ ngày nhận hàng.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Textarea
                                    placeholder="Mô tả lý do trả hàng (sản phẩm lỗi, không đúng mô tả, ...)"
                                    value={returnReason}
                                    onChange={e => setReturnReason(e.target.value)}
                                    rows={3}
                                    className="resize-none"
                                />
                                <div className="flex gap-2 justify-end">
                                    <Button variant="outline" size="sm" onClick={() => { setShowReturnForm(false); setReturnReason(''); }}>
                                        Hủy
                                    </Button>
                                    <Button size="sm" onClick={handleSubmitReturn} disabled={submittingReturn || !returnReason.trim()}
                                        className="bg-orange-600 hover:bg-orange-700">
                                        {submittingReturn ? 'Đang gửi...' : 'Gửi yêu cầu'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Return Request Status */}
                    {returnRequest && (
                        <Card className={`border-l-4 ${
                            returnRequest.status === 'APPROVED' || returnRequest.status === 'COMPLETED'
                                ? 'border-l-green-500 bg-green-50/30'
                                : returnRequest.status === 'REJECTED'
                                ? 'border-l-red-500 bg-red-50/30'
                                : 'border-l-orange-400 bg-orange-50/30'
                        }`}>
                            <CardContent className="p-4 flex items-start gap-3">
                                <AlertCircle className={`w-5 h-5 mt-0.5 shrink-0 ${
                                    returnRequest.status === 'APPROVED' || returnRequest.status === 'COMPLETED' ? 'text-green-600'
                                    : returnRequest.status === 'REJECTED' ? 'text-red-600' : 'text-orange-500'
                                }`} />
                                <div className="flex-1 text-sm">
                                    <p className="font-semibold text-gray-800">
                                        Yêu cầu trả hàng — {
                                            returnRequest.status === 'PENDING' ? 'Đang chờ xử lý'
                                            : returnRequest.status === 'APPROVED' ? 'Đã duyệt'
                                            : returnRequest.status === 'REJECTED' ? 'Bị từ chối'
                                            : 'Hoàn tất'
                                        }
                                    </p>
                                    <p className="text-gray-600 mt-0.5">Lý do: {returnRequest.reason}</p>
                                    {returnRequest.admin_notes && (
                                        <p className="text-gray-600 mt-1">Ghi chú admin: {returnRequest.admin_notes}</p>
                                    )}
                                    {returnRequest.refund_amount > 0 && (
                                        <p className="font-medium text-green-700 mt-1">
                                            Hoàn tiền: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(returnRequest.refund_amount)}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

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
