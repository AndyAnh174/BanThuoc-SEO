"use client";

import { useEffect, useState } from "react";
import { useOrdersStore } from "../stores/orders.store";
import { Order, OrderStatus } from "../types/admin.types";
import { getOrder } from "@/src/features/orders/api/orders.api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { ArrowLeft, FileText, Truck, MapPin, User as UserIcon, Calendar, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";

interface OrderDetailProps {
    orderId: string;
}

export function OrderDetail({ orderId }: OrderDetailProps) {
    const router = useRouter();
    const { updateOrderStatus, downloadInvoice } = useOrdersStore();
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await getOrder(orderId);
                setOrder(response);
            } catch (error) {
                toast.error("Không thể tải thông tin đơn hàng");
                router.push("/admin/orders");
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrder();
    }, [orderId]);

    const handleStatusChange = async (newStatus: string) => {
        if (!order) return;
        setIsUpdating(true);
        const success = await updateOrderStatus(order.id, newStatus as OrderStatus);
        if (success) {
            setOrder({ ...order, status: newStatus as OrderStatus });
        }
        setIsUpdating(false);
    };

    const handleDownloadInvoice = async () => {
        if (order) {
            await downloadInvoice(order.id);
        }
    };

    const getStatusColor = (status: OrderStatus) => {
        switch (status) {
            case OrderStatus.COMPLETED: return "bg-green-100 text-green-700 hover:bg-green-100";
            case OrderStatus.PENDING: return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100";
            case OrderStatus.CONFIRMED: return "bg-blue-100 text-blue-700 hover:bg-blue-100";
            case OrderStatus.SHIPPING: return "bg-purple-100 text-purple-700 hover:bg-purple-100";
            case OrderStatus.CANCELLED: return "bg-red-100 text-red-700 hover:bg-red-100";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500">Đang tải thông tin...</div>;
    if (!order) return <div className="p-8 text-center text-red-500">Không tìm thấy đơn hàng</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                            Đơn hàng #{order.id}
                        </h2>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(order.created_at), "dd/MM/yyyy HH:mm", { locale: vi })}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleDownloadInvoice}>
                        <FileText className="w-4 h-4 mr-2" />
                        Xuất hóa đơn
                    </Button>
                    <Select 
                        value={order.status} 
                        onValueChange={handleStatusChange} 
                        disabled={isUpdating}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={OrderStatus.PENDING}>Chờ xử lý</SelectItem>
                            <SelectItem value={OrderStatus.CONFIRMED}>Đã xác nhận</SelectItem>
                            <SelectItem value={OrderStatus.SHIPPING}>Đang giao hàng</SelectItem>
                            <SelectItem value={OrderStatus.COMPLETED}>Hoàn thành</SelectItem>
                            <SelectItem value={OrderStatus.CANCELLED}>Hủy đơn</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content - Items */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Sản phẩm</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Sản phẩm</TableHead>
                                        <TableHead className="text-center">Số lượng</TableHead>
                                        <TableHead className="text-right">Đơn giá</TableHead>
                                        <TableHead className="text-right">Thành tiền</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {order.items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.product_name}</TableCell>
                                            <TableCell className="text-center">{item.quantity}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                                            <TableCell className="text-right font-medium">{formatCurrency(item.total_price)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <Separator className="my-4" />
                            <div className="space-y-2 text-right">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Tổng tiền hàng:</span>
                                    <span>{formatCurrency(order.total_amount)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Phí vận chuyển:</span>
                                    <span>{formatCurrency(order.shipping_fee)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Giảm giá:</span>
                                    <span className="text-green-600">-{formatCurrency(order.discount_amount)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold pt-2">
                                    <span>Tổng cộng:</span>
                                    <span className="text-blue-600">{formatCurrency(order.final_amount)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Info */}
                    <Card>
                         <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-gray-500" />
                                Thông tin thanh toán
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-sm text-gray-500 block">Phương thức thanh toán</span>
                                    <span className="font-medium">{order.payment_method === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : order.payment_method}</span>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500 block">Trạng thái thanh toán</span>
                                    <Badge variant="outline" className={order.payment_status === 'PAID' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}>
                                        {order.payment_status === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar - Customer Info */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserIcon className="w-5 h-5 text-gray-500" />
                                Khách hàng
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <span className="text-sm text-gray-500 block">Họ và tên</span>
                                <span className="font-medium">{order.full_name}</span>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500 block">Số điện thoại</span>
                                <span className="font-medium">{order.phone_number}</span>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500 block">Email</span>
                                <span className="font-medium">{order.email || "Không có"}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Truck className="w-5 h-5 text-gray-500" />
                                Giao hàng
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 text-gray-500 mt-1 shrink-0" />
                                <div>
                                    <span className="text-sm text-gray-500 block">Địa chỉ nhận hàng</span>
                                    <p className="font-medium text-sm">
                                        {order.address}
                                        {order.ward && `, ${order.ward}`}
                                        {order.district && `, ${order.district}`}
                                        {order.province && `, ${order.province}`}
                                    </p>
                                </div>
                            </div>
                            {order.note && (
                                <div>
                                    <span className="text-sm text-gray-500 block mb-1">Ghi chú</span>
                                    <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-600 italic">
                                        "{order.note}"
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
