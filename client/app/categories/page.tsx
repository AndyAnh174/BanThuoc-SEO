export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import Link from 'next/link';
import { MainLayout } from '@/src/features/layout';
import { Pill, ChevronRight } from 'lucide-react';

const BASE_URL = 'https://banthuocsi.vn';
const API_BASE =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://backend:8000/api';

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  children?: Category[];
  product_count?: number;
}

export const metadata: Metadata = {
  title: 'Danh mục sản phẩm',
  description: 'Khám phá tất cả danh mục sản phẩm tại BanThuoc: thuốc, thực phẩm chức năng, dược mỹ phẩm, thiết bị y tế và nhiều hơn nữa.',
  alternates: { canonical: `${BASE_URL}/categories` },
  openGraph: {
    type: 'website',
    url: `${BASE_URL}/categories`,
    siteName: 'BanThuoc',
    locale: 'vi_VN',
    title: 'Danh mục sản phẩm | BanThuoc',
    description: 'Khám phá tất cả danh mục sản phẩm tại BanThuoc.',
  },
};

async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/categories/tree/?active_only=true`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : (data.results || []);
}

export default async function CategoriesPage() {
  const categories = await fetchCategories();

  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Danh mục sản phẩm',
    description: 'Tất cả danh mục sản phẩm tại BanThuoc',
    url: `${BASE_URL}/categories`,
    isPartOf: { '@type': 'WebSite', name: 'BanThuoc', url: BASE_URL },
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Danh mục', item: `${BASE_URL}/categories` },
    ],
  };

  return (
    <MainLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <div className="min-h-screen bg-gray-50">
        {/* Hero */}
        <div className="bg-gradient-to-br from-green-600 to-green-500 text-white">
          <div className="container mx-auto px-4 py-10 md:py-14">
            <nav className="text-sm text-green-100 mb-3">
              <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
              <span className="mx-2 opacity-50">/</span>
              <span className="text-white">Danh mục sản phẩm</span>
            </nav>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Danh mục sản phẩm</h1>
            <p className="text-green-100 max-w-xl text-sm md:text-base">
              Khám phá tất cả danh mục sản phẩm dược phẩm chính hãng tại BanThuoc
            </p>
          </div>
        </div>

        {/* Category grid */}
        <div className="container mx-auto px-4 py-8">
          {categories.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              Chưa có danh mục nào.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/categories/${cat.slug}`}
                  className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-green-200 transition-all duration-300 p-5 flex flex-col"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <Pill className="w-6 h-6 text-green-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors line-clamp-2 text-base">
                        {cat.name}
                      </h2>
                      {cat.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{cat.description}</p>
                      )}
                      {cat.children && cat.children.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {cat.children.slice(0, 3).map((child) => (
                            <span
                              key={child.slug}
                              className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full"
                            >
                              {child.name}
                            </span>
                          ))}
                          {cat.children.length > 3 && (
                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-400 rounded-full">
                              +{cat.children.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-green-500 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
