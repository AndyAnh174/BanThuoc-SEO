'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Zap, Package, ShoppingCart, AlertCircle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { MainLayout } from '@/src/features/layout';
import { flashSaleApi, CurrentFlashSaleResponse, FlashSaleItem } from '@/src/features/flash-sale/api/flash-sale.api';

const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

// ── Countdown Timer ────────────────────────────────────────────────────────────
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
            <span className="bg-slate-800 text-white font-mono font-bold text-xl w-12 h-12 flex items-center justify-center rounded-lg tabular-nums">
                {String(value).padStart(2, '0')}
            </span>
            <span className="text-[10px] font-medium text-gray-400 mt-1 tracking-widest uppercase">{label}</span>
        </div>
    );

    return (
        <div className="flex items-end gap-1">
            <Segment value={timeLeft.hours} label="Giờ" />
            <span className="text-slate-400 font-bold text-xl mb-3.5 leading-none">:</span>
            <Segment value={timeLeft.minutes} label="Phút" />
            <span className="text-slate-400 font-bold text-xl mb-3.5 leading-none">:</span>
            <Segment value={timeLeft.seconds} label="Giây" />
        </div>
    );
}

// ── Product Card ───────────────────────────────────────────────────────────────
function FlashSaleItemCard({ item }: { item: FlashSaleItem }) {
    const imageUrl: string | null =
        (item.product as any).primary_image?.image_url ||
        (item.product as any).primary_image ||
        item.product.images?.find(img => img.is_primary)?.image_url ||
        item.product.images?.[0]?.image_url ||
        null;

    return (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group flex flex-col">
            {/* Image */}
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

                {/* Discount badge */}
                <div className="absolute top-2.5 left-2.5 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    -{item.discount_percentage}%
                </div>

                {/* Sold out overlay */}
                {item.is_sold_out && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                        <span className="text-gray-500 font-semibold text-sm border border-gray-300 px-3 py-1 rounded-full">
                            Hết hàng
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-3.5 flex flex-col flex-1 gap-2.5">
                <Link href={`/products/${item.product.slug}`} className="block">
                    <h3 className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug hover:text-red-600 transition-colors">
                        {item.product.name}
                    </h3>
                </Link>

                {/* Price */}
                <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-lg font-bold text-red-600 leading-none">
                        {formatPrice(item.flash_sale_price)}
                    </span>
                    <span className="text-xs text-gray-400 line-through">
                        {formatPrice(item.original_price)}
                    </span>
                </div>

                {/* Progress */}
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

                {/* CTA */}
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

// ── Loading skeleton ───────────────────────────────────────────────────────────
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

// ── Page ───────────────────────────────────────────────────────────────────────
export default function FlashSalePage() {
    const [data, setData] = useState<CurrentFlashSaleResponse | null>(null);
    const [loading, setLoading] = useState(true);
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

    useEffect(() => { fetchData(); }, [fetchData]);

    const session = data?.current_session || data?.upcoming_session;
    const isActive = !!data?.current_session;

    // ── Loading ──
    if (loading) {
        return (
            <MainLayout>
                <div className="min-h-screen bg-gray-50">
                    <div className="bg-white border-b border-gray-100">
                        <div className="max-w-6xl mx-auto px-4 py-8">
                            <Skeleton className="h-6 w-32 mb-3" />
                            <Skeleton className="h-9 w-64 mb-2" />
                            <Skeleton className="h-4 w-96" />
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

    // ── Error ──
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

    // ── Empty ──
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

                {/* ── Hero header ── */}
                <div className="bg-white border-b border-gray-100">
                    <div className="max-w-6xl mx-auto px-4 py-7">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

                            {/* Left: title block */}
                            <div className="flex items-start gap-4">
                                {/* Red accent bar */}
                                <div className="w-1 self-stretch bg-red-600 rounded-full shrink-0" />
                                <div>
                                    {/* Labels row */}
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="inline-flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                                            <Zap className="h-3 w-3" />
                                            FLASH SALE
                                        </span>
                                        {isActive ? (
                                            <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-green-200">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                                ĐANG DIỄN RA
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-200">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                                SẮP DIỄN RA
                                            </span>
                                        )}
                                    </div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                                        {session.name}
                                    </h1>
                                    {session.description && (
                                        <p className="text-sm text-gray-500 mt-1">{session.description}</p>
                                    )}
                                    {/* Breadcrumb */}
                                    <nav className="flex items-center gap-1 text-xs text-gray-400 mt-3">
                                        <Link href="/" className="hover:text-gray-600 transition-colors">Trang chủ</Link>
                                        <ChevronRight className="h-3 w-3" />
                                        <span className="text-gray-600">Flash Sale</span>
                                    </nav>
                                </div>
                            </div>

                            {/* Right: countdown */}
                            <div className="flex flex-col items-start md:items-end gap-1.5">
                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    {isActive ? 'Kết thúc sau' : 'Bắt đầu sau'}
                                </p>
                                <CountdownTimer
                                    endTime={isActive ? session.end_time : session.start_time}
                                    onEnd={fetchData}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Products ── */}
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
