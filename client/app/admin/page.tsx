'use client';

import { useEffect, useState } from 'react';
import { http } from '@/lib/http';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    ShoppingCart,
    DollarSign,
    Users,
    AlertTriangle,
    TrendingUp,
    Package,
    Clock,
    CheckCircle2,
    Truck,
    XCircle,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

interface DashboardStats {
    orders: {
        today: number;
        week: number;
        month: number;
        total: number;
        by_status: Record<string, number>;
    };
    revenue: {
        today: number;
        week: number;
        month: number;
        total: number;
        pending: number;
    };
    users: {
        today: number;
        month: number;
        total: number;
    };
    low_stock_products: Array<{
        id: string;
        name: string;
        sku: string;
        stock_quantity: number;
        low_stock_threshold: number;
    }>;
    recent_orders: Array<{
        id: number;
        full_name: string;
        status: string;
        final_amount: number;
        payment_method: string;
        created_at: string;
    }>;
    top_products: Array<{
        product_name: string;
        total_sold: number;
        total_revenue: number;
    }>;
}

const formatMoney = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    PENDING: { label: 'Cho xu ly', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    CONFIRMED: { label: 'Da xac nhan', color: 'bg-blue-100 text-blue-700', icon: CheckCircle2 },
    PROCESSING: { label: 'Dang xu ly', color: 'bg-indigo-100 text-indigo-700', icon: Package },
    SHIPPING: { label: 'Dang giao', color: 'bg-purple-100 text-purple-700', icon: Truck },
    DELIVERED: { label: 'Da giao', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    CANCELLED: { label: 'Da huy', color: 'bg-red-100 text-red-700', icon: XCircle },
    RETURNED: { label: 'Tra hang', color: 'bg-gray-100 text-gray-700', icon: XCircle },
};

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await http.get('/admin/dashboard/stats/');
                setStats(response.data);
            } catch (error) {
                console.error('Failed to fetch dashboard stats', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Skeleton className="h-[400px]" />
                    <Skeleton className="h-[400px]" />
                </div>
            </div>
        );
    }

    if (!stats) {
        return <div className="text-center text-gray-500 py-12">Khong the tai du lieu dashboard</div>;
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-none shadow-sm bg-gradient-to-br from-green-50 to-emerald-50">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Doanh thu thang</p>
                                <p className="text-2xl font-bold text-green-700 mt-1">{formatMoney(stats.revenue.month)}</p>
                                <p className="text-xs text-gray-400 mt-1">Tong: {formatMoney(stats.revenue.total)}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-gradient-to-br from-blue-50 to-sky-50">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Don hang hom nay</p>
                                <p className="text-2xl font-bold text-blue-700 mt-1">{stats.orders.today}</p>
                                <p className="text-xs text-gray-400 mt-1">Thang nay: {stats.orders.month}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <ShoppingCart className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-gradient-to-br from-purple-50 to-violet-50">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Nguoi dung</p>
                                <p className="text-2xl font-bold text-purple-700 mt-1">{stats.users.total}</p>
                                <p className="text-xs text-gray-400 mt-1">Moi thang nay: +{stats.users.month}</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <Users className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-gradient-to-br from-orange-50 to-amber-50">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Sap het hang</p>
                                <p className="text-2xl font-bold text-orange-700 mt-1">{stats.low_stock_products.length}</p>
                                <p className="text-xs text-gray-400 mt-1">San pham can nhap them</p>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Order Status Overview */}
            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base">Trang thai don hang</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-3">
                        {Object.entries(statusConfig).map(([key, config]) => {
                            const count = stats.orders.by_status[key] || 0;
                            const Icon = config.icon;
                            return (
                                <div key={key} className={`flex items-center gap-2 px-4 py-2 rounded-full ${config.color}`}>
                                    <Icon className="w-4 h-4" />
                                    <span className="text-sm font-medium">{config.label}: {count}</span>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <Card className="border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-base">Don hang gan day</CardTitle>
                        <Link href="/admin/orders" className="text-sm text-green-600 hover:underline">Xem tat ca</Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {stats.recent_orders.map((order) => {
                                const sc = statusConfig[order.status] || statusConfig.PENDING;
                                return (
                                    <Link href={`/admin/orders/${order.id}`} key={order.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold text-gray-500">
                                                #{order.id}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 text-sm">{order.full_name}</p>
                                                <Badge className={`${sc.color} text-xs border-0 mt-0.5`}>{sc.label}</Badge>
                                            </div>
                                        </div>
                                        <span className="font-semibold text-gray-900 text-sm">{formatMoney(order.final_amount)}</span>
                                    </Link>
                                );
                            })}
                            {stats.recent_orders.length === 0 && (
                                <p className="text-sm text-gray-400 text-center py-4">Chua co don hang nao</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Products */}
                <Card className="border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                            San pham ban chay (30 ngay)
                        </CardTitle>
                        <Link href="/admin/products" className="text-sm text-green-600 hover:underline">Xem tat ca</Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {stats.top_products.map((product, index) => (
                                <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm font-bold text-green-700">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 text-sm line-clamp-1">{product.product_name}</p>
                                            <p className="text-xs text-gray-400">Da ban: {product.total_sold}</p>
                                        </div>
                                    </div>
                                    <span className="font-semibold text-gray-900 text-sm">{formatMoney(product.total_revenue)}</span>
                                </div>
                            ))}
                            {stats.top_products.length === 0 && (
                                <p className="text-sm text-gray-400 text-center py-4">Chua co du lieu</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Low Stock Alert */}
            {stats.low_stock_products.length > 0 && (
                <Card className="border-none shadow-sm border-l-4 border-l-orange-400">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2 text-orange-700">
                            <AlertTriangle className="w-4 h-4" />
                            Canh bao het hang
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {stats.low_stock_products.map((product) => (
                                <div key={product.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                                        <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                                    </div>
                                    <Badge variant="destructive" className="text-xs">
                                        Con {product.stock_quantity} / {product.low_stock_threshold}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
