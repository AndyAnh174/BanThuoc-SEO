'use client';

interface SeoPreviewProps {
  title: string;
  slug: string;
  description: string;
}

function CharCount({ current, max }: { current: number; max: number }) {
  const ratio = current / max;
  const color =
    ratio <= 0.7 ? 'text-green-600' : ratio <= 0.9 ? 'text-amber-600' : 'text-red-600';
  return (
    <span className={`text-xs font-mono tabular-nums ${color}`}>
      {current}/{max}
    </span>
  );
}

export function SeoPreview({ title, slug, description }: SeoPreviewProps) {
  const titleChars = title.length;
  const descChars = description.length;
  const displayTitle = title || 'Chưa có tiêu đề';
  const displayDesc = description || 'Chưa có mô tả';
  const displayUrl = slug ? `banthuocsi.vn/products/${slug}` : 'banthuocsi.vn/products/...';

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
        Xem trước kết quả Google
      </p>

      {/* Google SERP Card */}
      <div className="border border-gray-200 rounded-lg p-4 bg-white max-w-[600px] font-sans">
        {/* URL breadcrumb */}
        <div className="text-sm text-green-700 leading-none mb-1 truncate">
          https://{displayUrl} &#9660;
        </div>

        {/* Title */}
        <div
          className="text-xl text-blue-700 hover:underline cursor-pointer leading-tight mb-1"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {displayTitle.length > 60 ? displayTitle.slice(0, 57) + '...' : displayTitle}
        </div>

        {/* Description */}
        <div
          className="text-sm text-gray-600 leading-snug"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {displayDesc.length > 160 ? displayDesc.slice(0, 157) + '...' : displayDesc}
        </div>
      </div>

      {/* Character counts */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between max-w-[600px]">
          <span className="text-xs text-gray-500">Tiêu đề SEO</span>
          <CharCount current={titleChars} max={60} />
        </div>
        {titleChars > 60 && (
          <p className="text-xs text-red-500">Tiêu đề quá dài, Google sẽ cắt bớt</p>
        )}
        <div className="flex items-center justify-between max-w-[600px]">
          <span className="text-xs text-gray-500">Mô tả SEO</span>
          <CharCount current={descChars} max={160} />
        </div>
        {descChars > 160 && (
          <p className="text-xs text-red-500">Mô tả quá dài, Google sẽ cắt bớt</p>
        )}
      </div>
    </div>
  );
}
