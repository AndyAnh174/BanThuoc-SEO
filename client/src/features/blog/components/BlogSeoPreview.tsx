'use client';

interface BlogSeoPreviewProps {
  title: string;
  slug: string;
  description?: string;
}

export function BlogSeoPreview({ title, slug, description }: BlogSeoPreviewProps) {
  const domain = 'banthuocsi.vn';
  const titleChars = title.length;
  const descChars = (description || '').length;
  const truncatedTitle = title.length > 60 ? title.slice(0, 57) + '...' : title;
  const truncatedDesc = (description || '').length > 160
    ? description!.slice(0, 157) + '...'
    : (description || '');

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-4 font-sans">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span className="font-semibold">🔍 Google SERP Preview</span>
        <span className="text-gray-300">|</span>
        <span>Mô phỏng cách bài viết hiển thị trên Google</span>
      </div>

      <div className="border border-gray-100 rounded-md p-4 space-y-1 bg-gray-50/50">
        {/* Title */}
        <div className="text-xl text-[#1a0dab] leading-tight cursor-pointer hover:underline">
          {truncatedTitle || '(Chưa có tiêu đề)'}
        </div>

        {/* URL Breadcrumb */}
        <div className="text-sm text-[#006621] leading-tight">
          {domain} &rsaquo; blog &rsaquo; <span className="font-medium">{slug || '...'}</span>
        </div>

        {/* Description */}
        <div className="text-sm text-[#545454] leading-snug line-clamp-2">
          {truncatedDesc || '(Chưa có mô tả)'}
        </div>
      </div>

      {/* Character Counts */}
      <div className="flex flex-wrap gap-3 text-xs">
        <div className={`px-2 py-1 rounded-full ${titleChars <= 60 ? 'bg-green-50 text-green-700' : titleChars <= 65 ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>
          Tiêu đề: <strong>{titleChars}</strong>/60
          {titleChars > 60 && <span className="ml-1">⚠️ Quá dài, Google sẽ cắt</span>}
        </div>
        <div className={`px-2 py-1 rounded-full ${descChars <= 160 ? 'bg-green-50 text-green-700' : descChars <= 165 ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>
          Mô tả: <strong>{descChars}</strong>/160
          {descChars > 160 && <span className="ml-1">⚠️ Quá dài, Google sẽ cắt</span>}
        </div>
        {!title && (
          <div className="px-2 py-1 rounded-full bg-red-50 text-red-700">
            ⚠️ Thiếu tiêu đề SEO
          </div>
        )}
        {!description && (
          <div className="px-2 py-1 rounded-full bg-yellow-50 text-yellow-700">
            ⚠️ Thiếu mô tả SEO — Google sẽ tự động tạo snippet
          </div>
        )}
      </div>
    </div>
  );
}
