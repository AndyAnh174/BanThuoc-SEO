'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductCard } from '@/src/features/products';
import { getCurrentFlashSale } from '@/src/features/products';
import { ArrowRight, Zap } from 'lucide-react';

interface FlashSaleData {
    id: string;
    name: string;
    slug: string;
    startTime: string;
    endTime: string;
    status: string;
    items: Array<{
        id: string;
        product: {
            id: string;
            name: string;
            slug: string;
            price: number;
            salePrice: number | null;
            imageUrl: string | null;
            category: { name: string; slug: string } | null;
            manufacturer: { name: string } | null;
            unit: string;
            stockQuantity: number;
        };
        flashSalePrice: number;
        quantity: number;
        soldQuantity: number;
    }>;
}

interface TimeLeft {
    hours: number;
    minutes: number;
    seconds: number;
}

// Compact countdown for the section header
function SectionCountdown({ endTime }: { endTime: string }) {
    const [t, setT] = useState<TimeLeft>({ hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const calc = (): TimeLeft => {
            const diff = Math.max(0, new Date(endTime).getTime() - Date.now());
            return {
                hours: Math.floor(diff / 3600000),
                minutes: Math.floor((diff % 3600000) / 60000),
                seconds: Math.floor((diff % 60000) / 1000),
            };
        };
        setT(calc());
        const timer = setInterval(() => setT(calc()), 1000);
        return () => clearInterval(timer);
    }, [endTime]);

    const pad = (n: number) => String(n).padStart(2, '0');

    const Box = ({ val }: { val: number }) => (
        <span className="bg-slate-800 text-white font-mono text-sm font-bold w-9 h-9 inline-flex items-center justify-center rounded-md tabular-nums">
            {pad(val)}
        </span>
    );

    return (
        <div className="flex items-center gap-1">
            <Box val={t.hours} />
            <span className="text-slate-400 font-bold text-sm">:</span>
            <Box val={t.minutes} />
            <span className="text-slate-400 font-bold text-sm">:</span>
            <Box val={t.seconds} />
        </div>
    );
}

export function FlashSaleSection() {
    const [flashSale, setFlashSale] = useState<FlashSaleData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFlashSale = async () => {
            try {
                const response = await getCurrentFlashSale();
                const data = response.data;
                const session = data.current_session || data.upcoming_session;

                if (session && data.featured_items && data.featured_items.length > 0) {
                    const transformed: FlashSaleData = {
                        id: session.id,
                        name: session.name,
                        slug: session.slug,
                        startTime: session.start_time,
                        endTime: session.end_time,
                        status: session.status,
                        items: data.featured_items.map((item: any) => ({
                            id: item.id,
                            product: {
                                id: item.product.id,
                                name: item.product.name,
                                slug: item.product.slug,
                                price: parseFloat(item.product.price) || 0,
                                salePrice: item.product.sale_price ? parseFloat(item.product.sale_price) : null,
                                imageUrl: item.product.primary_image?.image_url || item.product.primary_image || null,
                                category: item.product.category ? { name: item.product.category.name, slug: item.product.category.slug } : null,
                                manufacturer: item.product.manufacturer ? { name: item.product.manufacturer.name } : null,
                                unit: item.product.unit || '',
                                stockQuantity: item.remaining_quantity || 0,
                            },
                            flashSalePrice: parseFloat(item.flash_sale_price) || 0,
                            quantity: item.total_quantity || 0,
                            soldQuantity: item.sold_quantity || 0,
                        })),
                    };
                    setFlashSale(transformed);
                }
            } catch {
                // silently ignore
            } finally {
                setLoading(false);
            }
        };
        fetchFlashSale();
    }, []);

    // Loading
    if (loading) {
        return (
            <section className="bg-white border-y border-gray-100 py-8">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-6">
                        <Skeleton className="h-7 w-44" />
                        <Skeleton className="h-9 w-32" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-72 rounded-xl" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (!flashSale || flashSale.items.length === 0) return null;

    return (
        <section className="bg-white border-y border-gray-100 py-8">
            <div className="container mx-auto px-4">

                {/* Section header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        {/* Red accent bar */}
                        <div className="w-1 h-8 bg-red-600 rounded-full shrink-0" />
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-1.5">
                                    <Zap className="h-5 w-5 text-red-600 fill-red-600" />
                                    Flash Sale
                                </h2>
                                <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 text-xs font-semibold px-2 py-0.5 rounded-full border border-red-100">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                    ĐANG DIỄN RA
                                </span>
                            </div>
                            <p className="text-sm text-gray-400 mt-0.5">{flashSale.name}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                        {/* Countdown */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 font-medium hidden sm:block">Kết thúc sau</span>
                            <SectionCountdown endTime={flashSale.endTime} />
                        </div>

                        {/* View all */}
                        <Link href="/flash-sale">
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-full border-gray-200 text-gray-700 hover:border-red-200 hover:text-red-600 hover:bg-red-50 transition-colors gap-1.5 text-sm"
                            >
                                Xem tất cả
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Product grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {flashSale.items.slice(0, 5).map((item) => {
                        const soldPercentage = item.quantity > 0
                            ? Math.round((item.soldQuantity / item.quantity) * 100)
                            : 0;
                        const remainingQuantity = item.quantity - item.soldQuantity;

                        return (
                            <ProductCard
                                key={item.id}
                                id={item.product.id}
                                name={item.product.name}
                                slug={item.product.slug}
                                price={item.product.price}
                                salePrice={item.product.salePrice}
                                imageUrl={item.product.imageUrl || undefined}
                                category={item.product.category || undefined}
                                manufacturer={item.product.manufacturer || undefined}
                                unit={item.product.unit}
                                stockQuantity={remainingQuantity}
                                flashSale={{
                                    flashSalePrice: item.flashSalePrice,
                                    soldPercentage,
                                    remainingQuantity,
                                }}
                            />
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

export default FlashSaleSection;
