'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getCurrentFlashSale } from '@/src/features/products';
import { useCartStore } from '@/src/features/cart/stores/cart.store';
import { useAuthStore } from '@/src/features/auth/stores/auth.store';
import { ArrowRight, ChevronRight, ChevronLeft, Zap, Plus, Flame, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface FlashSaleData {
  id: string;
  name: string;
  slug: string;
  startTime: string;
  endTime: string;
  status: string;
  items: FlashSaleItem[];
}

interface FlashSaleItem {
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
}

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
}

// ─── Countdown Timer ──────────────────────────────────────────
function CountdownTimer({ endTime }: { endTime: string }) {
  const [t, setT] = useState<TimeLeft>({ hours: 0, minutes: 0, seconds: 0 });
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const calc = (): TimeLeft => {
      const diff = Math.max(0, new Date(endTime).getTime() - Date.now());
      if (diff <= 0) setExpired(true);
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

  const pad = (n: number) => String(Math.max(0, n)).padStart(2, '0');

  if (expired) {
    return <span className="text-white/80 text-sm font-semibold">Đã kết thúc</span>;
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="bg-white/20 text-white text-xs px-1.5 py-1 rounded">Giờ</span>
      <span className="bg-black/60 text-white font-mono text-lg font-bold w-10 h-9 inline-flex items-center justify-center rounded tabular-nums shadow-inner">
        {pad(t.hours)}
      </span>
      <span className="text-white font-bold text-lg">:</span>
      <span className="bg-black/60 text-white font-mono text-lg font-bold w-10 h-9 inline-flex items-center justify-center rounded tabular-nums shadow-inner">
        {pad(t.minutes)}
      </span>
      <span className="text-white font-bold text-lg">:</span>
      <span className="bg-black/60 text-white font-mono text-lg font-bold w-10 h-9 inline-flex items-center justify-center rounded tabular-nums shadow-inner">
        {pad(t.seconds)}
      </span>
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────
function FlashProductCard({
  item,
  onAddToCart,
}: {
  item: FlashSaleItem;
  onAddToCart: (item: FlashSaleItem) => void;
}) {
  const discountPercent = item.product.price > 0
    ? Math.round(((item.product.price - item.flashSalePrice) / item.product.price) * 100)
    : 0;
  const soldPercent = item.quantity > 0
    ? Math.min(100, Math.round((item.soldQuantity / item.quantity) * 100))
    : 0;
  const remaining = item.quantity - item.soldQuantity;

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('vi-VN').format(p);

  return (
    <Link
      href={`/products/${item.product.slug}`}
      className="flex-shrink-0 w-[200px] bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group/card"
    >
      {/* Image area */}
      <div className="relative aspect-square bg-gray-50 p-3">
        {item.product.imageUrl ? (
          <Image
            src={item.product.imageUrl}
            alt={item.product.name}
            fill
            sizes="200px"
            className="object-contain p-3"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <Zap className="w-12 h-12" />
          </div>
        )}

        {/* Discount badge */}
        {discountPercent > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
            Giảm {discountPercent}%
          </span>
        )}

        {/* Flash sale label */}
        <span className="absolute top-2 right-2 bg-orange-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
          FLASH SALE
        </span>
      </div>

      {/* Info */}
      <div className="p-3 space-y-2">
        {/* Name */}
        <h3 className="text-xs text-gray-700 line-clamp-2 leading-snug min-h-[2.4em]">
          {item.product.name}
        </h3>

        {/* Price */}
        <div>
          <span className="text-base font-bold text-red-600">
            {formatPrice(item.flashSalePrice)}đ
          </span>
          <span className="text-[10px] text-gray-400 ml-1">
            /{item.product.unit || 'Hộp'}
          </span>
          {item.product.price > item.flashSalePrice && (
            <p className="text-xs text-gray-400 line-through mt-0.5">
              {formatPrice(item.product.price)}đ
            </p>
          )}
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="relative w-full h-5 bg-orange-100 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-700"
              style={{ width: `${soldPercent}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-sm">
              {soldPercent >= 80 ? 'Sắp cháy hàng' : soldPercent > 0 ? 'Đang bán chạy' : 'Mới mở bán'}
            </span>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAddToCart(item);
          }}
          disabled={remaining <= 0}
          className="w-full flex items-center justify-center gap-1 py-2 border-2 border-green-600 text-green-700 rounded-xl font-semibold text-sm hover:bg-green-50 transition-colors disabled:border-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          {remaining <= 0 ? 'Hết hàng' : 'Chọn mua'}
        </button>
      </div>
    </Link>
  );
}

// ─── Time Slot Tabs ───────────────────────────────────────────
function TimeSlotTabs({
  slots,
  activeIndex,
  onSelect,
}: {
  slots: { label: string; time: string; active: boolean }[];
  activeIndex: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
      {slots.map((slot, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
            i === activeIndex
              ? 'bg-white text-orange-600 shadow-md'
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          {slot.time}
          {slot.active && (
            <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse align-middle" />
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────
export function FlashSaleSection() {
  const [flashSale, setFlashSale] = useState<FlashSaleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTimeSlot, setActiveTimeSlot] = useState(0);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [scrollPos, setScrollPos] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { addToCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  // ─── Fetch Data ────────────────────────────────────────────
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

  // ─── Add to Cart ───────────────────────────────────────────
  const handleAddToCart = useCallback(async (item: FlashSaleItem) => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để mua hàng');
      router.push('/auth/login');
      return;
    }
    try {
      await addToCart(item.product.id, 1);
      toast.success('Đã thêm vào giỏ hàng');
    } catch {
      toast.error('Không thể thêm vào giỏ hàng');
    }
  }, [isAuthenticated, addToCart, router]);

  // ─── Carousel Scroll ───────────────────────────────────────
  const scroll = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const scrollAmount = 220;
    const newPos = direction === 'left'
      ? Math.max(0, scrollPos - scrollAmount)
      : scrollPos + scrollAmount;
    carouselRef.current.scrollTo({ left: newPos, behavior: 'smooth' });
    setScrollPos(newPos);
  };

  const handleScroll = useCallback(() => {
    if (carouselRef.current) {
      setScrollPos(carouselRef.current.scrollLeft);
    }
  }, []);

  // ─── Derived Data ──────────────────────────────────────────
  const timeSlots = [
    { label: 'Hiện tại', time: 'Đang diễn ra', active: true },
    { label: 'Tiếp theo', time: '20:00', active: false },
    { label: 'Sắp tới', time: '00:00', active: false },
    { label: 'Ngày mai', time: '08:00', active: false },
  ];

  const filters = flashSale
    ? Array.from(new Set(flashSale.items.map((i) => i.product.category?.name).filter(Boolean)))
    : [];

  const filteredItems = flashSale?.items.filter(
    (i) => !activeFilter || i.product.category?.name === activeFilter
  ) || [];

  const canScrollLeft = scrollPos > 0;
  const canScrollRight = carouselRef.current
    ? scrollPos < (carouselRef.current.scrollWidth - carouselRef.current.clientWidth - 10)
    : true;

  // ─── Loading ──────────────────────────────────────────────
  if (loading) {
    return (
      <section className="py-6">
        <Skeleton className="h-[420px] rounded-2xl" />
      </section>
    );
  }

  if (!flashSale || flashSale.items.length === 0) return null;

  // ─── Render ───────────────────────────────────────────────
  return (
    <section className="py-6">
      <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 rounded-2xl overflow-hidden shadow-lg shadow-orange-500/20">
        {/* ── Header Area ──────────────────────────────── */}
        <div className="px-5 pt-5 pb-3 space-y-4">
          {/* Time Slot Tabs */}
          <TimeSlotTabs
            slots={timeSlots}
            activeIndex={activeTimeSlot}
            onSelect={setActiveTimeSlot}
          />

          {/* Title + Countdown */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-4 flex-wrap">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
                <Flame className="w-7 h-7 fill-white" />
                Flash Sale
              </h2>
              <CountdownTimer endTime={flashSale.endTime} />
            </div>

            <Link
              href="/flash-sale"
              className="flex items-center gap-1 text-white/90 hover:text-white font-semibold text-sm shrink-0 transition-colors"
            >
              Xem tất cả
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Filter Tags */}
          {filters.length > 1 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              <button
                onClick={() => setActiveFilter(null)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  activeFilter === null
                    ? 'bg-white text-orange-600 border-white shadow-sm'
                    : 'text-white border-white/40 hover:border-white/70'
                }`}
              >
                Tất cả
              </button>
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f === activeFilter ? null : f!)}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap ${
                    activeFilter === f
                      ? 'bg-white text-orange-600 border-white shadow-sm'
                      : 'text-white border-white/40 hover:border-white/70'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Product Carousel ──────────────────────────── */}
        <div className="relative bg-white/10 backdrop-blur-sm mx-4 mb-4 rounded-2xl p-4">
          {/* Left Arrow */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all -translate-x-2"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
          )}

          {/* Carousel */}
          <div
            ref={carouselRef}
            onScroll={handleScroll}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-1"
          >
            {filteredItems.map((item) => (
              <FlashProductCard
                key={item.id}
                item={item}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>

          {/* Right Arrow */}
          {canScrollRight && filteredItems.length > 3 && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all translate-x-2"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

export default FlashSaleSection;
