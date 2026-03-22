'use client';

import { useState, useEffect, useCallback } from 'react';
import { Star, ThumbsUp, MessageSquare, CheckCircle, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAuthStore } from '@/src/features/auth/stores/auth.store';
import {
  getProductReviews,
  getProductReviewStats,
  createProductReview,
} from '../api/products.api';

interface ReviewStats {
  average_rating: number;
  total_reviews: number;
  distribution: Record<string, number>;
}

interface Review {
  id: string;
  user_name: string;
  rating: number;
  title: string;
  content: string;
  is_verified_purchase: boolean;
  created_at: string;
}

function StarRow({
  value,
  onChange,
  readonly = false,
  size = 'md',
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  const [hover, setHover] = useState(0);
  const cls = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-7 h-7' : 'w-5 h-5';

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={readonly ? 'cursor-default' : 'cursor-pointer transition-transform hover:scale-110'}
        >
          <Star
            className={`${cls} transition-colors ${
              star <= (hover || value)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-200 fill-gray-200'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function RatingBar({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-gray-500 w-8 shrink-0 text-right">{label}</span>
      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 shrink-0" />
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-yellow-400 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-gray-400 w-8 shrink-0 text-xs">{count}</span>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const date = new Date(review.created_at).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div className="py-5 border-b border-gray-100 last:border-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold text-sm shrink-0">
            {review.user_name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-800">{review.user_name || 'Ẩn danh'}</span>
              {review.is_verified_purchase && (
                <span className="inline-flex items-center gap-1 text-[11px] text-green-600 font-medium">
                  <CheckCircle className="w-3 h-3" />
                  Đã mua hàng
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <StarRow value={review.rating} readonly size="sm" />
              <span className="text-xs text-gray-400">{date}</span>
            </div>
          </div>
        </div>
      </div>

      {review.title && (
        <p className="mt-3 text-sm font-semibold text-gray-800">{review.title}</p>
      )}
      {review.content && (
        <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">{review.content}</p>
      )}
    </div>
  );
}

export function ProductReviews({ productId }: { productId: string }) {
  const { isAuthenticated } = useAuthStore();
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, reviewsRes] = await Promise.all([
        getProductReviewStats(productId),
        getProductReviews(productId),
      ]);
      setStats(statsRes.data);
      setReviews(reviewsRes.data?.results || reviewsRes.data || []);
    } catch {
      // silently ignore
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Vui lòng chọn số sao đánh giá');
      return;
    }
    if (!content.trim()) {
      toast.error('Vui lòng nhập nội dung đánh giá');
      return;
    }

    setSubmitting(true);
    try {
      await createProductReview(productId, { rating, title, content });
      toast.success('Đánh giá đã được gửi, chờ quản trị viên duyệt');
      setRating(0);
      setTitle('');
      setContent('');
      setShowForm(false);
    } catch (err: any) {
      const msg =
        err?.response?.data?.non_field_errors?.[0] ||
        err?.response?.data?.detail ||
        'Không thể gửi đánh giá. Vui lòng thử lại.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats + Write review header */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-6">
        {/* Left: overall score */}
        {stats && (
          <div className="flex items-center gap-5 shrink-0">
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900 leading-none">
                {stats.average_rating > 0 ? stats.average_rating.toFixed(1) : '—'}
              </div>
              <StarRow value={Math.round(stats.average_rating)} readonly size="sm" />
              <p className="text-xs text-gray-400 mt-1">{stats.total_reviews} đánh giá</p>
            </div>
            {/* Distribution bars */}
            <div className="space-y-1.5 min-w-[160px]">
              {[5, 4, 3, 2, 1].map((star) => (
                <RatingBar
                  key={star}
                  label={`${star}`}
                  count={stats.distribution[String(star)] || 0}
                  total={stats.total_reviews}
                />
              ))}
            </div>
          </div>
        )}

        {/* Right: write review button */}
        <div className="sm:ml-auto self-start">
          {isAuthenticated ? (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 rounded-full border-gray-200"
              onClick={() => setShowForm((v) => !v)}
            >
              <MessageSquare className="w-4 h-4" />
              {showForm ? 'Hủy đánh giá' : 'Viết đánh giá'}
            </Button>
          ) : (
            <p className="text-sm text-gray-400">
              <a href="/auth/login" className="text-green-600 hover:underline font-medium">
                Đăng nhập
              </a>{' '}
              để viết đánh giá
            </p>
          )}
        </div>
      </div>

      {/* Write review form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-gray-50 rounded-2xl border border-gray-100 p-5 space-y-4"
        >
          <h3 className="text-sm font-semibold text-gray-700">Đánh giá của bạn</h3>

          {/* Star picker */}
          <div className="space-y-1">
            <label className="text-xs text-gray-500">Chọn số sao *</label>
            <StarRow value={rating} onChange={setRating} size="lg" />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-500">Tiêu đề (không bắt buộc)</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Sản phẩm rất tốt"
              className="h-9 text-sm bg-white"
              maxLength={100}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-500">Nội dung *</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Chia sẻ trải nghiệm thực tế của bạn về sản phẩm..."
              className="resize-none text-sm bg-white"
              rows={4}
              maxLength={1000}
            />
            <p className="text-right text-xs text-gray-400">{content.length}/1000</p>
          </div>

          <div className="flex items-center justify-between pt-1">
            <p className="text-xs text-gray-400 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-green-500" />
              Đánh giá sẽ được hiển thị sau khi admin duyệt
            </p>
            <Button
              type="submit"
              size="sm"
              disabled={submitting}
              className="gap-2 bg-green-600 hover:bg-green-700 text-white rounded-full px-5"
            >
              {submitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              Gửi đánh giá
            </Button>
          </div>
        </form>
      )}

      {/* Reviews list */}
      {reviews.length > 0 ? (
        <div>
          {reviews.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 border border-dashed border-gray-200 rounded-2xl">
          <Star className="w-8 h-8 text-gray-200 mx-auto mb-3 fill-gray-200" />
          <p className="text-sm text-gray-400">Chưa có đánh giá nào</p>
          <p className="text-xs text-gray-300 mt-1">Hãy là người đầu tiên đánh giá sản phẩm này</p>
        </div>
      )}
    </div>
  );
}
