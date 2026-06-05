'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { getCurrentFlashSale } from '@/src/features/products';
import { useCartStore } from '@/src/features/cart/stores/cart.store';
import { useAuthStore } from '@/src/features/auth/stores/auth.store';
import { ArrowRight, ChevronRight, ChevronLeft, Zap, Plus, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface FlashSaleData {
  id: string; name: string; slug: string; startTime: string; endTime: string; status: string;
  items: FlashSaleItem[];
}
interface FlashSaleItem {
  id: string;
  product: {
    id: string; name: string; slug: string; price: number; salePrice: number | null;
    imageUrl: string | null; category: { name: string; slug: string } | null;
    manufacturer: { name: string } | null; unit: string; stockQuantity: number;
  };
  flashSalePrice: number; quantity: number; soldQuantity: number;
}
interface TimeLeft { hours: number; minutes: number; seconds: number; }

function CountdownTimer({ endTime }: { endTime: string }) {
  const [t, setT] = useState<TimeLeft>({ hours: 0, minutes: 0, seconds: 0 });
  const [expired, setExpired] = useState(false);
  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, new Date(endTime).getTime() - Date.now());
      if (diff <= 0) setExpired(true);
      return { hours: Math.floor(diff / 3600000), minutes: Math.floor((diff % 3600000) / 60000), seconds: Math.floor((diff % 60000) / 1000) };
    };
    setT(calc());
    const timer = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(timer);
  }, [endTime]);
  const pad = (n: number) => String(Math.max(0, n)).padStart(2, '0');
  if (expired) return <span className="text-gray-400 text-sm">Đã kết thúc</span>;
  return (
    <div className="flex items-center gap-1">
      <span className="bg-gray-900 text-white font-mono text-sm font-bold w-8 h-8 inline-flex items-center justify-center rounded tabular-nums">{pad(t.hours)}</span>
      <span className="text-gray-900 font-bold text-sm">:</span>
      <span className="bg-gray-900 text-white font-mono text-sm font-bold w-8 h-8 inline-flex items-center justify-center rounded tabular-nums">{pad(t.minutes)}</span>
      <span className="text-gray-900 font-bold text-sm">:</span>
      <span className="bg-gray-900 text-white font-mono text-sm font-bold w-8 h-8 inline-flex items-center justify-center rounded tabular-nums">{pad(t.seconds)}</span>
    </div>
  );
}

function FlashProductCard({ item, onAdd }: { item: FlashSaleItem; onAdd: (i: FlashSaleItem) => void }) {
  const discount = item.product.price > 0 ? Math.round(((item.product.price - item.flashSalePrice) / item.product.price) * 100) : 0;
  const soldPct = item.quantity > 0 ? Math.min(100, Math.round((item.soldQuantity / item.quantity) * 100)) : 0;
  const remaining = item.quantity - item.soldQuantity;
  const fmt = (p: number) => new Intl.NumberFormat('vi-VN').format(p);

  return (
    <Link href={`/products/${item.product.slug}`}
      className="flex-shrink-0 w-[190px] bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-red-100 transition-all duration-200 group/card">
      <div className="relative aspect-square bg-gray-50/50">
        {item.product.imageUrl
          ? <Image src={item.product.imageUrl} alt={item.product.name} fill sizes="190px" className="object-contain p-3 group-hover/card:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center text-gray-200"><Zap className="w-10 h-10" /></div>}
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[11px] font-bold px-1.5 py-0.5 rounded">-{discount}%</span>
        )}
      </div>
      <div className="p-2.5 space-y-1.5">
        <h3 className="text-xs text-gray-800 line-clamp-2 leading-snug min-h-[2.4em]">{item.product.name}</h3>
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-bold text-red-600">{fmt(item.flashSalePrice)}đ</span>
          <span className="text-[10px] text-gray-400">/{item.product.unit || 'Hộp'}</span>
        </div>
        {item.product.price > item.flashSalePrice && (
          <p className="text-[11px] text-gray-400 line-through">{fmt(item.product.price)}đ</p>)}
        {/* Progress bar */}
        <div className="w-full h-4 bg-red-50 rounded-full overflow-hidden relative mt-1">
          <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-400 to-red-500 rounded-full transition-all duration-700" style={{ width: `${soldPct}%` }} />
          <span className="absolute inset-0 flex items-center justify-center text-[9px] font-semibold text-red-700">
            {soldPct >= 80 ? 'Sắp hết' : `Đã bán ${soldPct}%`}
          </span>
        </div>
        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAdd(item); }}
          disabled={remaining <= 0}
          className="w-full py-1.5 border border-red-200 text-red-600 rounded-lg font-semibold text-xs hover:bg-red-50 transition-colors disabled:border-gray-150 disabled:text-gray-300 disabled:cursor-not-allowed">
          {remaining <= 0 ? 'Hết hàng' : 'Chọn mua'}
        </button>
      </div>
    </Link>
  );
}

export function FlashSaleSection() {
  const [flashSale, setFlashSale] = useState<FlashSaleData | null>(null);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { addToCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    (async () => {
      try {
        const response = await getCurrentFlashSale();
        const data = response.data;
        const session = data.current_session || data.upcoming_session;
        if (session && data.featured_items?.length) {
          setFlashSale({
            id: session.id, name: session.name, slug: session.slug,
            startTime: session.start_time, endTime: session.end_time, status: session.status,
            items: data.featured_items.map((item: any) => ({
              id: item.id,
              product: {
                id: item.product.id, name: item.product.name, slug: item.product.slug,
                price: parseFloat(item.product.price) || 0,
                salePrice: item.product.sale_price ? parseFloat(item.product.sale_price) : null,
                imageUrl: item.product.primary_image?.image_url || item.product.primary_image || null,
                category: item.product.category ? { name: item.product.category.name, slug: item.product.category.slug } : null,
                manufacturer: item.product.manufacturer ? { name: item.product.manufacturer.name } : null,
                unit: item.product.unit || '', stockQuantity: item.remaining_quantity || 0,
              },
              flashSalePrice: parseFloat(item.flash_sale_price) || 0,
              quantity: item.total_quantity || 0, soldQuantity: item.sold_quantity || 0,
            })),
          });
        }
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  const handleAdd = useCallback(async (item: FlashSaleItem) => {
    if (!isAuthenticated) { toast.error('Vui lòng đăng nhập để mua hàng'); router.push('/auth/login'); return; }
    try { await addToCart(item.product.id, 1); toast.success('Đã thêm vào giỏ hàng'); } catch { toast.error('Không thể thêm vào giỏ hàng'); }
  }, [isAuthenticated, addToCart, router]);

  const scroll = (dir: 'left' | 'right') => {
    if (!carouselRef.current) return;
    carouselRef.current.scrollBy({ left: dir === 'left' ? -420 : 420, behavior: 'smooth' });
  };

  if (loading) return <section className="py-6"><Skeleton className="h-[380px] rounded-2xl" /></section>;
  if (!flashSale || !flashSale.items.length) return null;

  return (
    <section className="py-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header strip — red accent for urgency */}
        <div className="bg-gradient-to-r from-red-500 to-rose-500 px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-300 fill-yellow-300" />
              <h2 className="text-lg sm:text-xl font-extrabold text-white">Flash Sale</h2>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 bg-white/20 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-300 animate-pulse" />ĐANG DIỄN RA
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-white/80 text-xs font-medium">Kết thúc sau</span>
              <CountdownTimer endTime={flashSale.endTime} />
            </div>
            <Link href="/flash-sale" className="flex items-center gap-1 text-white/90 hover:text-white font-semibold text-sm shrink-0">
              Xem tất cả <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Product carousel */}
        <div className="relative p-4">
          <button onClick={() => scroll('left')}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all -translate-x-1">
            <ChevronLeft className="w-4 h-4 text-gray-600" /></button>
          <div ref={carouselRef} className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth px-2">
            {flashSale.items.map(item => <FlashProductCard key={item.id} item={item} onAdd={handleAdd} />)}
          </div>
          <button onClick={() => scroll('right')}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all translate-x-1">
            <ChevronRight className="w-4 h-4 text-gray-600" /></button>
        </div>
      </div>
    </section>
  );
}

export default FlashSaleSection;
