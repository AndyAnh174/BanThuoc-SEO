'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductCard } from '@/src/features/products';
import { getCurrentFlashSale } from '@/src/features/products';
import { ArrowRight, Clock, Zap } from 'lucide-react';

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

export function FlashSaleSection() {
  const [flashSale, setFlashSale] = useState<FlashSaleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ hours: 0, minutes: 0, seconds: 0 });

  // Calculate time left
  const calculateTimeLeft = useCallback((endTime: string): TimeLeft => {
    const end = new Date(endTime).getTime();
    const now = new Date().getTime();
    const diff = Math.max(0, end - now);

    return {
      hours: Math.floor(diff / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
    };
  }, []);

  // Fetch flash sale data
  useEffect(() => {
    const fetchFlashSale = async () => {
      try {
        const response = await getCurrentFlashSale();
        if (response.data) {
          setFlashSale(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch flash sale:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashSale();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!flashSale?.endTime) return;

    const timer = setInterval(() => {
      const left = calculateTimeLeft(flashSale.endTime);
      setTimeLeft(left);

      // Refresh if sale ended
      if (left.hours === 0 && left.minutes === 0 && left.seconds === 0) {
        clearInterval(timer);
        // Could trigger a refetch here
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [flashSale?.endTime, calculateTimeLeft]);

  // Loading skeleton
  if (loading) {
    return (
      <section className="py-12 bg-gradient-to-r from-red-50 to-orange-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // No active flash sale
  if (!flashSale || !flashSale.items || flashSale.items.length === 0) {
    return null;
  }

  const formatNumber = (n: number) => n.toString().padStart(2, '0');

  return (
    <section className="py-12 bg-gradient-to-r from-red-50 to-orange-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-100 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-100 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center animate-pulse">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                ⚡ Flash Sale
              </h2>
              <p className="text-gray-600">{flashSale.name}</p>
            </div>
          </div>

          {/* Countdown */}
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-red-500" />
            <span className="text-gray-600 font-medium">Kết thúc sau:</span>
            <div className="flex gap-2">
              <div className="bg-red-500 text-white px-3 py-2 rounded-lg font-bold text-lg min-w-[48px] text-center">
                {formatNumber(timeLeft.hours)}
              </div>
              <span className="text-2xl font-bold text-red-500">:</span>
              <div className="bg-red-500 text-white px-3 py-2 rounded-lg font-bold text-lg min-w-[48px] text-center">
                {formatNumber(timeLeft.minutes)}
              </div>
              <span className="text-2xl font-bold text-red-500">:</span>
              <div className="bg-red-500 text-white px-3 py-2 rounded-lg font-bold text-lg min-w-[48px] text-center">
                {formatNumber(timeLeft.seconds)}
              </div>
            </div>
          </div>
        </div>

        {/* Products grid */}
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

        {/* View all button */}
        {flashSale.items.length > 5 && (
          <div className="text-center mt-8">
            <Button variant="outline" size="lg" className="bg-white" asChild>
              <Link href={`/flash-sale/${flashSale.slug}`}>
                Xem tất cả ({flashSale.items.length} sản phẩm)
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

export default FlashSaleSection;
