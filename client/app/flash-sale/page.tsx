'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Zap, Clock, Package, ShoppingCart, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MainLayout } from '@/src/features/layout';
import { flashSaleApi, CurrentFlashSaleResponse, FlashSaleItem } from '@/src/features/flash-sale/api/flash-sale.api';

// Format price in VND
const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

// Countdown timer component
function CountdownTimer({ endTime, onEnd }: { endTime: string; onEnd?: () => void }) {
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const end = new Date(endTime).getTime();
            const now = Date.now();
            const diff = Math.max(0, end - now);

            if (diff === 0 && onEnd) {
                onEnd();
            }

            return {
                hours: Math.floor(diff / (1000 * 60 * 60)),
                minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((diff % (1000 * 60)) / 1000),
            };
        };

        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
        return () => clearInterval(timer);
    }, [endTime, onEnd]);

    return (
        <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-red-500" />
            <div className="flex gap-1 font-mono text-lg font-bold">
                <span className="bg-red-600 text-white px-2 py-1 rounded">
                    {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-red-600">:</span>
                <span className="bg-red-600 text-white px-2 py-1 rounded">
                    {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-red-600">:</span>
                <span className="bg-red-600 text-white px-2 py-1 rounded">
                    {String(timeLeft.seconds).padStart(2, '0')}
                </span>
            </div>
        </div>
    );
}

// Flash sale item card
function FlashSaleItemCard({ item }: { item: FlashSaleItem }) {
    const primaryImage = item.product.images?.find(img => img.is_primary) || item.product.images?.[0];

    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group">
            {/* Image */}
            <div className="relative aspect-square bg-gray-100">
                {primaryImage ? (
                    <Image
                        src={primaryImage.image_url}
                        alt={item.product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-16 w-16 text-gray-300" />
                    </div>
                )}

                {/* Discount badge */}
                <Badge className="absolute top-2 left-2 bg-red-600 text-white font-bold">
                    -{item.discount_percentage}%
                </Badge>

                {/* Sold out overlay */}
                {item.is_sold_out && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white text-xl font-bold">HẾT HÀNG</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
                <Link href={`/products/${item.product.slug}`}>
                    <h3 className="font-medium text-gray-900 line-clamp-2 hover:text-green-600 transition-colors">
                        {item.product.name}
                    </h3>
                </Link>

                {/* Price */}
                <div className="space-y-1">
                    <div className="text-xl font-bold text-red-600">
                        {formatPrice(item.flash_sale_price)}
                    </div>
                    <div className="text-sm text-gray-400 line-through">
                        {formatPrice(item.original_price)}
                    </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                    <Progress value={item.sold_percentage} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>Đã bán: {item.sold_quantity}</span>
                        <span>Còn: {item.remaining_quantity}</span>
                    </div>
                </div>

                {/* Add to cart button */}
                <Button
                    className="w-full bg-red-600 hover:bg-red-700"
                    disabled={item.is_sold_out}
                >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {item.is_sold_out ? 'Hết hàng' : 'Mua ngay'}
                </Button>
            </div>
        </div>
    );
}

export default function FlashSalePage() {
    const [data, setData] = useState<CurrentFlashSaleResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await flashSaleApi.getCurrent();
            setData(response.data);
        } catch (err: any) {
            setError('Không thể tải dữ liệu Flash Sale');
            console.error('Flash sale error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) {
        return (
            <MainLayout>
                <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center">
                    <div className="animate-pulse flex flex-col items-center gap-4">
                        <Zap className="h-16 w-16 text-red-500" />
                        <p className="text-gray-500">Đang tải Flash Sale...</p>
                    </div>
                </div>
            </MainLayout>
        );
    }

    if (error) {
        return (
            <MainLayout>
                <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center">
                    <div className="text-center">
                        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                        <p className="text-gray-600">{error}</p>
                        <Button onClick={fetchData} className="mt-4">Thử lại</Button>
                    </div>
                </div>
            </MainLayout>
        );
    }

    const session = data?.current_session || data?.upcoming_session;
    const isActive = data?.current_session !== null;

    if (!session) {
        return (
            <MainLayout>
                <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
                    <div className="container mx-auto px-4 py-16 text-center">
                        <Zap className="h-24 w-24 text-gray-300 mx-auto mb-6" />
                        <h1 className="text-3xl font-bold text-gray-700 mb-4">Chưa có Flash Sale</h1>
                        <p className="text-gray-500 mb-8">Hiện tại chưa có chương trình Flash Sale nào. Hãy quay lại sau nhé!</p>
                        <Link href="/">
                            <Button size="lg">Về trang chủ</Button>
                        </Link>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
                {/* Hero Section */}
                <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white">
                    <div className="container mx-auto px-4 py-12">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <Zap className="h-12 w-12" />
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-bold">{session.name}</h1>
                                    <p className="text-white/80 mt-1">{session.description || 'Săn deal hot - Giá sốc mỗi ngày!'}</p>
                                </div>
                            </div>

                            <div className="text-center">
                                {isActive ? (
                                    <>
                                        <p className="text-sm text-white/80 mb-2">Kết thúc sau:</p>
                                        <CountdownTimer endTime={session.end_time} onEnd={fetchData} />
                                    </>
                                ) : (
                                    <>
                                        <p className="text-sm text-white/80 mb-2">Bắt đầu sau:</p>
                                        <CountdownTimer endTime={session.start_time} onEnd={fetchData} />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Banner */}
                {session.banner_image && (
                    <div className="container mx-auto px-4 -mt-6">
                        <div className="relative w-full h-48 md:h-64 rounded-xl overflow-hidden shadow-lg">
                            <Image
                                src={session.banner_image}
                                alt={session.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                )}

                {/* Products Grid */}
                <div className="container mx-auto px-4 py-12">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Sản phẩm đang giảm giá
                            <span className="text-red-600 ml-2">({data?.featured_items?.length || 0})</span>
                        </h2>
                    </div>

                    {data?.featured_items && data.featured_items.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                            {data.featured_items.map((item) => (
                                <FlashSaleItemCard key={item.id} item={item} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">Chưa có sản phẩm nào trong Flash Sale này</p>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
