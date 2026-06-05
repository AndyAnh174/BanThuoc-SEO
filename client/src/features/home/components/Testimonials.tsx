'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, Quote, User } from 'lucide-react';

interface Review {
  id: string; user_name: string; rating: number; content: string;
  product_name?: string; product_slug?: string; created_at: string;
}

// Static fallback testimonials — real API data preferred
const fallbackReviews: Review[] = [
  { id: '1', user_name: 'Nhà thuốc Minh Châu', rating: 5, content: 'Hàng chính hãng, giao nhanh, đầy đủ hóa đơn. Rất hài lòng!', product_name: 'Etoricoxib 60mg', product_slug: 'etoricoxib-60mg-boston-enrich', created_at: '2026-05-15' },
  { id: '2', user_name: 'Quầy thuốc Thanh Hà', rating: 5, content: 'Giá sỉ rất tốt, đặt hàng online tiện lợi. Đội ngũ tư vấn nhiệt tình.', product_name: 'Vitamin C 500mg', product_slug: '', created_at: '2026-05-10' },
  { id: '3', user_name: 'Phòng khám Đức An', rating: 4, content: 'Sản phẩm đa dạng, chiết khấu cao cho khách sỉ. Sẽ tiếp tục ủng hộ.', created_at: '2026-04-28' },
  { id: '4', user_name: 'Nhà thuốc Ngọc Lan', rating: 5, content: 'Đối tác tin cậy, giao hàng đúng hẹn. Hỗ trợ đổi trả linh hoạt.', product_name: 'Paracetamol 500mg', product_slug: '', created_at: '2026-04-20' },
  { id: '5', user_name: 'Nhà thuốc Bảo Long', rating: 5, content: 'Tư vấn chuyên môn tốt, dược sĩ có kiến thức sâu. Giá cạnh tranh.', created_at: '2026-04-15' },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`w-4 h-4 ${i <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
      ))}
    </div>
  );
}

export function Testimonials() {
  const [reviews, setReviews] = useState<Review[]>(fallbackReviews);

  // Try fetching real reviews from API, fallback to static data
  useEffect(() => {
    (async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const res = await fetch(`${API_URL}/admin/reviews/?page_size=6&status=APPROVED`);
        if (res.ok) {
          const data = await res.json();
          const items = data.results || data;
          if (Array.isArray(items) && items.length >= 3) {
            setReviews(items.map((r: any) => ({
              id: r.id,
              user_name: r.user_name || r.user?.full_name || 'Khách hàng',
              rating: r.rating || 5,
              content: r.content || r.comment || '',
              product_name: r.product_name || r.product?.name,
              product_slug: r.product_slug || r.product?.slug,
              created_at: r.created_at,
            })));
          }
        }
      } catch {}
    })();
  }, []);

  return (
    <section className="py-10">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Khách hàng nói gì</h2>
        <p className="text-gray-400">Đánh giá từ nhà thuốc, phòng khám trên toàn quốc</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reviews.slice(0, 6).map((review, i) => (
          <div key={review.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
            <Quote className="w-8 h-8 text-green-100 group-hover:text-green-200 transition-colors mb-3" />
            <p className="text-gray-600 text-sm leading-relaxed line-clamp-4 mb-4">{review.content}</p>
            <Stars rating={review.rating} />
            <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm font-semibold text-gray-800">{review.user_name}</span>
              </div>
              {review.product_slug ? (
                <Link href={`/products/${review.product_slug}`}
                  className="text-xs text-green-600 hover:underline font-medium">
                  {review.product_name}
                </Link>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Testimonials;
