'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
    Package, 
    ShoppingBag, 
    ChevronRight, 
    Clock, 
    CheckCircle2, 
    Truck,
    XCircle,
    Calendar,
    CreditCard
} from 'lucide-react';
import { getMyOrders } from '../api/orders.api'; // Removed direct downloadInvoice here, user can do it in Detail page
import { toast } from 'sonner';

interface Order {
    id: number;
    created_at: string;
    final_amount: number;
    status: string;
    payment_method: string;
    items_count: number; // Assuming backend might send this or we calculate from items length
    items: any[];
}

export function OrderList() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await getMyOrders();
                const data = response.data.results ? response.data.results : response.data;
                setOrders(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Failed to fetch orders', error);
                toast.error('Không thể tải lịch sử đơn hàng');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'PENDING':
                return { label: 'Chờ xác nhận', color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: Clock };
            case 'CONFIRMED':
                return { label: 'Đã xác nhận', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', icon: CheckCircle2 };
            case 'SHIPPING':
                return { label: 'Đang giao', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200', icon: Truck };
            case 'COMPLETED':
                return { label: 'Hoàn thành', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle2 };
            case 'CANCELLED':
                return { label: 'Đã hủy', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', icon: XCircle };
            default:
                return { label: status, color: 'text-gray-700', bg: 'bg-gray-50', border: 'border-gray-200', icon: Package };
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
                ))}
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-8 bg-white rounded-2xl border border-dashed">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Chưa có đơn hàng nào</h3>
                <p className="text-gray-500 mb-8 max-w-sm">
                    Hãy khám phá hàng ngàn sản phẩm chất lượng tại BanThuoc và đặt đơn hàng đầu tiên ngay hôm nay!
                </p>
                <Button size="lg" className="bg-primary hover:bg-primary/90" asChild>
                    <Link href="/products">Mua sắm ngay</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Package className="w-7 h-7 text-primary" />
                    Đơn hàng của tôi
                </h1>
                <span className="text-sm text-gray-500">
                    {orders.length} đơn hàng
                </span>
            </div>

            <div className="grid gap-4">
                {orders.map((order) => {
                    const status = getStatusConfig(order.status);
                    const StatusIcon = status.icon;

                    return (
                        <Link href={`/orders/${order.id}`} key={order.id} className="block group">
                            <Card className="hover:shadow-md transition-all duration-300 border hover:border-primary/50 overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="p-5 md:p-6 grid md:grid-cols-4 gap-4 md:gap-6 items-center">
                                        
                                        {/* Col 1: ID & Date */}
                                        <div className="md:col-span-1 space-y-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-lg text-gray-900 group-hover:text-primary transition-colors">
                                                    #{order.id}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Calendar className="w-4 h-4" />
                                                {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                            </div>
                                        </div>

                                        {/* Col 2: Info */}
                                        <div className="md:col-span-1 text-sm text-gray-600 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Package className="w-4 h-4" />
                                                <span>{order.items?.length || 0} sản phẩm</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <CreditCard className="w-4 h-4" />
                                                <span>{order.payment_method === 'COD' ? 'Thanh toán nhận hàng' : 'Chuyển khoản'}</span>
                                            </div>
                                        </div>

                                        {/* Col 3: Total */}
                                        <div className="md:col-span-1">
                                            <div className="text-sm text-gray-500 mb-1">Tổng tiền</div>
                                            <div className="font-bold text-lg text-primary">
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.final_amount)}
                                            </div>
                                        </div>

                                        {/* Col 4: Status & Action */}
                                        <div className="md:col-span-1 flex flex-col items-end gap-3 justify-between h-full">
                                            <Badge variant="outline" className={`${status.bg} ${status.color} ${status.border} px-3 py-1 flex items-center gap-1.5`}>
                                                <StatusIcon className="w-3.5 h-3.5" />
                                                {status.label}
                                            </Badge>
                                            
                                            <div className="text-sm font-medium text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0 duration-300">
                                                Xem chi tiết <ChevronRight className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
