'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { getCurrentFlashSale } from '@/src/features/products';
import { useCartStore } from '@/src/features/cart/stores/cart.store';
import { useAuthStore } from '@/src/features/auth/stores/auth.store';
import { ArrowRight, ChevronRight, ChevronLeft, Zap, Plus, Flame, Clock } from 'lucide-react';
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

// ── Countdown ──
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
  if (expired) return <span className="text-white/80 text-sm font-semibold">Đã kết thúc</span>;
  return (
    <div className="flex items-center gap-1.5">
      <span className="bg-white/20 text-white text-xs px-1.5 py-1 rounded">Giờ</span>
      <span className="bg-black/60 text-white font-mono text-lg font-bold w-10 h-9 inline-flex items-center justify-center rounded tabular-nums shadow-inner">{pad(t.hours)}</span>
      <span className="text-white font-bold text-lg">:</span>
      <span className="bg-black/60 text-white font-mono text-lg font-bold w-10 h-9 inline-flex items-center justify-center rounded tabular-nums shadow-inner">{pad(t.minutes)}</span>
      <span className="text-white font-bold text-lg">:</span>
      <span className="bg-black/60 text-white font-mono text-lg font-bold w-10 h-9 inline-flex items-center justify-center rounded tabular-nums shadow-inner">{pad(t.seconds)}</span>
    </div>
  );
}

// ── Product Card ──
function FlashProductCard({ item, onAdd }: { item: FlashSaleItem; onAdd: (i: FlashSaleItem) => void }) {
  const discount = item.product.price > 0 ? Math.round(((item.product.price - item.flashSalePrice) / item.product.price) * 100) : 0;
  const soldPct = item.quantity > 0 ? Math.min(100, Math.round((item.soldQuantity / item.quantity) * 100)) : 0;
  const remaining = item.quantity - item.soldQuantity;
  const fmt = (p: number) => new Intl.NumberFormat('vi-VN').format(p);

  return (
    <Link href={`/products/${item.product.slug}`} className="flex-shrink-0 w-[200px] bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group/card">
      <div className="relative aspect-square bg-gray-50">
        {item.product.imageUrl ? <Image src={item.product.imageUrl} alt={item.product.name} fill sizes="200px" className="object-contain p-3" />
          : <div className="w-full h-full flex items-center justify-center text-gray-300"><Zap className="w-12 h-12" /></div>}
        {discount > 0 && <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">Giảm {discount}%</span>}
        <span className="absolute top-2 right-2 bg-green-600 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">FLASH SALE</span>
      </div>
      <div className="p-3 space-y-2">
        <h3 className="text-xs text-gray-700 line-clamp-2 leading-snug min-h-[2.4em]">{item.product.name}</h3>
        <div>
          <span className="text-base font-bold text-green-700">{fmt(item.flashSalePrice)}đ</span>
          <span className="text-[10px] text-gray-400 ml-1">/{item.product.unit || 'Hộp'}</span>
          {item.product.price > item.flashSalePrice && (
            <p className="text-xs text-gray-400 line-through mt-0.5">{fmt(item.product.price)}đ</p>)}
        </div>
        <div className="w-full h-5 bg-green-100 rounded-full overflow-hidden relative">
          <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-700" style={{ width: `${soldPct}%` }} />
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-sm">
            {soldPct >= 80 ? 'Sắp cháy hàng' : soldPct > 0 ? 'Đang bán chạy' : 'Mới mở bán'}
          </span>
        </div>
        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAdd(item); }}
          disabled={remaining <= 0}
          className="w-full flex items-center justify-center gap-1 py-2 border-2 border-green-600 text-green-700 rounded-xl font-semibold text-sm hover:bg-green-50 transition-colors disabled:border-gray-200 disabled:text-gray-400">
          <Plus className="w-4 h-4" />{remaining <= 0 ? 'Hết hàng' : 'Chọn mua'}
        </button>
      </div>
    </Link>
  );
}

// ── Main ──
export function FlashSaleSection() {
  const [flashSale, setFlashSale] = useState<FlashSaleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
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
    carouselRef.current.scrollBy({ left: dir === 'left' ? -440 : 440, behavior: 'smooth' });
  };

  const filters = flashSale ? [...new Set(flashSale.items.map(i => i.product.category?.name).filter(Boolean))] : [];
  const filtered = flashSale?.items.filter(i => !activeFilter || i.product.category?.name === activeFilter) || [];

  if (loading) return <section className="py-6"><Skeleton className="h-[420px] rounded-2xl" /></section>;
  if (!flashSale || !flashSale.items.length) return null;

  return (
    <section className="py-6">
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl overflow-hidden shadow-lg shadow-green-600/20">
        {/* Header */}
        <div className="px-5 pt-5 pb-3 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-4 flex-wrap">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
                <Flame className="w-7 h-7 fill-white" />Flash Sale
              </h2>
              <CountdownTimer endTime={flashSale.endTime} />
            </div>
            <Link href="/flash-sale" className="flex items-center gap-1 text-white/90 hover:text-white font-semibold text-sm shrink-0">
              Xem tất cả <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {filters.length > 1 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              <button onClick={() => setActiveFilter(null)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${!activeFilter ? 'bg-white text-green-700 border-white' : 'text-white border-white/40 hover:border-white/70'}`}>Tất cả</button>
              {filters.map(f => (
                <button key={f} onClick={() => setActiveFilter(f === activeFilter ? null : f!)}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${activeFilter === f ? 'bg-white text-green-700 border-white' : 'text-white border-white/40 hover:border-white/70'}`}>{f}</button>
              ))}
            </div>
          )}
        </div>

        {/* Carousel */}
        <div className="relative bg-white/10 backdrop-blur-sm mx-4 mb-4 rounded-2xl p-4">
          {filtered.length > 3 && (
            <button onClick={() => scroll('left')}
              className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all -translate-x-2">
              <ChevronLeft className="w-5 h-5 text-gray-700" /></button>
          )}
          <div ref={carouselRef} className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-1">
            {filtered.map(item => <FlashProductCard key={item.id} item={item} onAdd={handleAdd} />)}
          </div>
          {filtered.length > 3 && (
            <button onClick={() => scroll('right')}
              className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all translate-x-2">
              <ChevronRight className="w-5 h-5 text-gray-700" /></button>
          )}
        </div>
      </div>
    </section>
  );
}

export default FlashSaleSection;
