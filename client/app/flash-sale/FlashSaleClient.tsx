'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Zap, Package, ShoppingCart, AlertCircle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MainLayout } from '@/src/features/layout';
import { flashSaleApi, CurrentFlashSaleResponse, FlashSaleItem } from '@/src/features/flash-sale/api/flash-sale.api';

const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

function CountdownTimer({ endTime, onEnd }: { endTime: string; onEnd?: () => void }) {
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const calc = () => {
            const diff = Math.max(0, new Date(endTime).getTime() - Date.now());
            if (diff === 0 && onEnd) onEnd();
            return {
                hours: Math.floor(diff / 3600000),
                minutes: Math.floor((diff % 3600000) / 60000),
                seconds: Math.floor((diff % 60000) / 1000),
            };
        };
        setTimeLeft(calc());
        const t = setInterval(() => setTimeLeft(calc()), 1000);
        return () => clearInterval(t);
    }, [endTime, onEnd]);

    const Segment = ({ value, label }: { value: number; label: string }) => (
        <div className="flex flex-col items-center">
            <span className="bg-white/15 backdrop-blur-sm text-white font-mono font-bold text-xl w-12 h-12 flex items-center justify-center rounded-lg tabular-nums border border-white/20">
                {String(value).padStart(2, '0')}
            </span>
            <span className="text-[10px] font-medium text-white/50 mt-1 tracking-widest uppercase">{label}</span>
        </div>
    );

    return (
        <div className="flex items-end gap-1">
            <Segment value={timeLeft.hours} label="Giờ" />
            <span className="text-white/40 font-bold text-xl mb-3 leading-none">:</span>
            <Segment value={timeLeft.minutes} label="Phút" />
            <span className="text-white/40 font-bold text-xl mb-3 leading-none">:</span>
            <Segment value={timeLeft.seconds} label="Giây" />
        </div>
    );
}

function FlashSaleItemCard({ item }: { item: FlashSaleItem }) {
    const imageUrl: string | null =
        (item.product as any).primary_image?.image_url ||
        (item.product as any).primary_image ||
        item.product.images?.find((img: any) => img.is_primary)?.image_url ||
        item.product.images?.[0]?.image_url ||
        null;

    return (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group flex flex-col">
            <div className="relative aspect-square bg-gray-50 shrink-0">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={item.product.name}
                        fill
                        className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-14 w-14 text-gray-200" />
                    </div>
                )}
                <div className="absolute top-2.5 left-2.5 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    -{item.discount_percentage}%
                </div>
                {item.is_sold_out && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                        <span className="text-gray-500 font-semibold text-sm border border-gray-300 px-3 py-1 rounded-full">
                            Hết hàng
                        </span>
                    </div>
                )}
            </div>

            <div className="p-3.5 flex flex-col flex-1 gap-2.5">
                <Link href={`/products/${item.product.slug}`} className="block">
                    <h3 className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug hover:text-red-600 transition-colors">
                        {item.product.name}
                    </h3>
                </Link>

                <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-lg font-bold text-red-600 leading-none">
                        {formatPrice(item.flash_sale_price)}
                    </span>
                    <span className="text-xs text-gray-400 line-through">
                        {formatPrice(item.original_price)}
                    </span>
                </div>

                <div className="space-y-1">
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-amber-400 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(item.sold_percentage, 100)}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-[11px] text-gray-400">
                        <span>Đã bán {item.sold_quantity}</span>
                        <span>Còn {item.remaining_quantity}</span>
                    </div>
                </div>

                <button
                    disabled={item.is_sold_out}
                    className="mt-auto w-full h-10 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                    <ShoppingCart className="h-4 w-4 shrink-0" />
                    <span>{item.is_sold_out ? 'Hết hàng' : 'Mua ngay'}</span>
                </button>
            </div>
        </div>
    );
}

function CardSkeleton() {
    return (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <Skeleton className="aspect-square w-full" />
            <div className="p-3.5 space-y-2.5">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-1.5 w-full" />
                <Skeleton className="h-10 w-full rounded-xl" />
            </div>
        </div>
    );
}

interface Props {
    initialData: CurrentFlashSaleResponse | null;
    serverTime: string;
}

export function FlashSaleClient({ initialData, serverTime }: Props) {
    const [data, setData] = useState<CurrentFlashSaleResponse | null>(initialData);
    const [loading, setLoading] = useState(!initialData);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await flashSaleApi.getCurrent();
            setData(response.data);
        } catch {
            setError('Không thể tải dữ liệu Flash Sale');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const session = data?.current_session || data?.upcoming_session;
    const isActive = !!data?.current_session;

    if (loading) {
        return (
            <MainLayout>
                <div className="min-h-screen bg-gray-50">
                    <div className="bg-gradient-to-br from-red-800 via-red-600 to-orange-600">
                        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
                            <Skeleton className="h-5 w-32 mb-6 bg-white/20" />
                            <Skeleton className="h-9 w-80 mb-3 bg-white/20" />
                            <Skeleton className="h-4 w-96 bg-white/20" />
                        </div>
                    </div>
                    <div className="max-w-6xl mx-auto px-4 py-8">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
                        </div>
                    </div>
                </div>
            </MainLayout>
        );
    }

    if (error) {
        return (
            <MainLayout>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 mb-4">{error}</p>
                        <Button variant="outline" onClick={fetchData} className="rounded-xl">Thử lại</Button>
                    </div>
                </div>
            </MainLayout>
        );
    }

    if (!session) {
        return (
            <MainLayout>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                            <Zap className="h-9 w-9 text-gray-300" />
                        </div>
                        <h1 className="text-xl font-bold text-gray-700 mb-2">Chưa có Flash Sale</h1>
                        <p className="text-sm text-gray-400 mb-6">Hãy quay lại sau để săn deal hot nhé!</p>
                        <Link href="/">
                            <Button variant="outline" className="rounded-xl">Về trang chủ</Button>
                        </Link>
                    </div>
                </div>
            </MainLayout>
        );
    }

    const items = data?.featured_items ?? [];

    return (
        <MainLayout>
            <div className="min-h-screen bg-gray-50">

                {/* Flash Sale Hero Banner */}
                <section className="relative overflow-hidden bg-gradient-to-br from-red-800 via-red-600 to-orange-600">
                    {/* Lightning glow effects */}
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-10 left-1/4 w-96 h-96 bg-yellow-400 rounded-full blur-[128px]" />
                        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-orange-300 rounded-full blur-[100px]" />
                    </div>
                    {/* Diagonal light streaks */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-1/3 w-[2px] h-full bg-white rotate-12 origin-top" />
                        <div className="absolute top-0 left-2/3 w-[1px] h-full bg-white rotate-12 origin-top" />
                    </div>

                    <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16 lg:py-20">
                        {/* Breadcrumb */}
                        <nav className="flex items-center gap-1.5 text-xs text-white/60 mb-6">
                            <Link href="/" className="hover:text-white/90 transition-colors">Trang chủ</Link>
                            <ChevronRight className="h-3 w-3" />
                            <span className="text-white/80">Flash Sale</span>
                        </nav>

                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                            {/* Left: Title + Badge + Description */}
                            <div className="max-w-xl">
                                <div className="flex items-center gap-3 mb-4 flex-wrap">
                                    <span className="inline-flex items-center gap-1.5 bg-red-600/50 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full border border-red-400/30">
                                        <Zap className="h-3 w-3 fill-yellow-300 text-yellow-300" />
                                        FLASH SALE
                                    </span>
                                    {isActive ? (
                                        <span className="inline-flex items-center gap-1.5 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.5)] animate-pulse">
                                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                                            ĐANG DIỄN RA
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                                            SẮP DIỄN RA
                                        </span>
                                    )}
                                </div>

                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight mb-4">
                                    {session.name}
                                </h1>
                                {session.description && (
                                    <p className="text-sm md:text-base text-white/70 leading-relaxed max-w-lg whitespace-pre-line">
                                        {session.description}
                                    </p>
                                )}
                            </div>

                            {/* Right: Countdown Timer */}
                            <div className="flex flex-col items-start lg:items-end gap-2 shrink-0">
                                <p className="text-xs font-semibold text-white/50 uppercase tracking-[0.2em]">
                                    {isActive ? 'Kết thúc sau' : 'Bắt đầu sau'}
                                </p>
                                <CountdownTimer
                                    endTime={isActive ? session.end_time : session.start_time}
                                    onEnd={fetchData}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <div className="max-w-6xl mx-auto px-4 py-8">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-base font-semibold text-gray-700">
                            Sản phẩm giảm giá
                            <span className="ml-2 text-sm font-normal text-gray-400">({items.length})</span>
                        </h2>
                    </div>

                    {items.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {items.map((item) => (
                                <FlashSaleItemCard key={item.id} item={item} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                            <Package className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                            <p className="text-sm text-gray-400">Chưa có sản phẩm trong Flash Sale này</p>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
