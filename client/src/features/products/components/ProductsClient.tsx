'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProductCard, CategorySidebar } from '@/src/features/products';
import { getProducts, getCategories, getManufacturers } from '@/src/features/products';
import { mapApiProducts, MappedProduct } from '@/src/lib/api-mapper';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
  X,
  Home,
  ChevronRight as Chevron,
  PackageSearch,
  ArrowUpDown,
} from 'lucide-react';

interface Category { id: string; name: string; slug: string; children?: Category[]; }
interface Manufacturer { id: string; name: string; slug: string; }

export function ProductsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<MappedProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = 12;
  const category = searchParams.get('category') || '';
  const manufacturer = searchParams.get('manufacturer') || '';
  const search = searchParams.get('search') || '';
  const ordering = searchParams.get('ordering') || '-created_at';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';

  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [catRes, manuRes] = await Promise.all([getCategories(), getManufacturers()]);
        if (catRes.data?.results) setCategories(catRes.data.results);
        else if (Array.isArray(catRes.data)) setCategories(catRes.data);
        if (manuRes.data?.results) setManufacturers(manuRes.data.results);
        else if (Array.isArray(manuRes.data)) setManufacturers(manuRes.data);
      } catch (error) { console.error('Failed to fetch filters:', error); }
    };
    fetchFilters();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params: Record<string, string | number> = { page, page_size: pageSize, ordering };
        if (category) params.category = category;
        if (manufacturer) params.manufacturer = manufacturer;
        if (minPrice) params.min_price = minPrice;
        if (maxPrice) params.max_price = maxPrice;

        let response;
        if (search) {
          response = await import('@/src/features/products').then(m => m.searchProducts(search, params));
        } else {
          response = await getProducts(params);
        }

        if (response.data) {
          const data = response.data as { count: number; results: any[] };
          const mappedProducts = mapApiProducts(data.results || []);
          setProducts(mappedProducts);
          setTotalCount(data.count || 0);
        }
      } catch (error) { console.error('Failed to fetch products:', error); }
      finally { setLoading(false); }
    };
    fetchProducts();
  }, [page, category, manufacturer, search, ordering, minPrice, maxPrice]);

  const updateFilters = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value); else params.delete(key);
    });
    if (!updates.page) params.set('page', '1');
    router.push(`/products?${params.toString()}`);
  }, [searchParams, router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchInput });
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const activeFilters: { key: string; label: string }[] = [];
  if (category) {
    const cat = categories.find(c => c.slug === category);
    if (cat) activeFilters.push({ key: 'category', label: cat.name });
  }
  if (manufacturer) {
    const manu = manufacturers.find(m => m.slug === manufacturer);
    if (manu) activeFilters.push({ key: 'manufacturer', label: manu.name });
  }
  if (search) activeFilters.push({ key: 'search', label: `"${search}"` });

  const currentCategoryName = category
    ? categories.find(c => c.slug === category)?.name || 'Sản phẩm'
    : 'Tất cả sản phẩm';

  const sidebarFilters = {
    categories: category ? [category] : [],
    manufacturers: manufacturer ? [manufacturer] : [],
    priceRange: { min: minPrice ? Number(minPrice) : 0, max: maxPrice ? Number(maxPrice) : 1000000 },
  };

  const handleFilterChange = (filters: any) => {
    updateFilters({
      category: filters.categories[0] || '',
      manufacturer: filters.manufacturers[0] || '',
      min_price: filters.priceRange.min?.toString() || '',
      max_price: filters.priceRange.max?.toString() || '',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb / hero strip */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-1.5 text-sm text-gray-500">
            <Link href="/" className="flex items-center gap-1 hover:text-green-600 transition-colors">
              <Home className="w-3.5 h-3.5" />
              <span>Trang chủ</span>
            </Link>
            <Chevron className="w-3.5 h-3.5 text-gray-300" />
            <span className="text-gray-900 font-medium">{currentCategoryName}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Sidebar Desktop ── */}
          <aside className="hidden lg:block w-64 shrink-0">
            <CategorySidebar
              categories={categories}
              manufacturers={manufacturers}
              initialFilters={sidebarFilters}
              onFilterChange={handleFilterChange}
            />
          </aside>

          {/* ── Main content ── */}
          <div className="flex-1 min-w-0">

            {/* Top bar */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 mb-5">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                {/* Title + count */}
                <div className="flex items-baseline gap-3">
                  <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                    {currentCategoryName}
                  </h1>
                  {!loading && (
                    <span className="text-sm text-gray-400 font-normal">
                      {totalCount.toLocaleString('vi-VN')} sản phẩm
                    </span>
                  )}
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  {/* Search */}
                  <form onSubmit={handleSearch} className="relative flex-1 sm:w-60">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <Input
                      type="search"
                      placeholder="Tìm kiếm sản phẩm..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      className="pl-9 pr-4 h-9 rounded-full border-gray-200 focus-visible:ring-green-500 bg-gray-50 text-sm"
                    />
                  </form>

                  {/* Sort */}
                  <Select value={ordering} onValueChange={(value) => updateFilters({ ordering: value })}>
                    <SelectTrigger className="h-9 w-44 rounded-full border-gray-200 bg-gray-50 text-sm gap-1.5">
                      <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <SelectValue placeholder="Sắp xếp" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-created_at">Mới nhất</SelectItem>
                      <SelectItem value="price">Giá thấp → cao</SelectItem>
                      <SelectItem value="-price">Giá cao → thấp</SelectItem>
                      <SelectItem value="name">A → Z</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Mobile filter button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="lg:hidden h-9 rounded-full border-gray-200 gap-1.5 px-3"
                    onClick={() => setShowMobileFilters(true)}
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    Lọc
                    {activeFilters.length > 0 && (
                      <span className="w-5 h-5 flex items-center justify-center bg-green-600 text-white text-xs rounded-full font-semibold">
                        {activeFilters.length}
                      </span>
                    )}
                  </Button>
                </div>
              </div>

              {/* Active filter chips */}
              {activeFilters.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Đang lọc:</span>
                  {activeFilters.map((filter) => (
                    <span
                      key={filter.key}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-medium"
                    >
                      {filter.label}
                      <button
                        onClick={() => updateFilters({ [filter.key]: '' })}
                        className="w-3.5 h-3.5 flex items-center justify-center rounded-full hover:bg-green-200 transition-colors"
                        aria-label="Xóa bộ lọc"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                  <button
                    onClick={() => router.push('/products')}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors underline underline-offset-2"
                  >
                    Xóa tất cả
                  </button>
                </div>
              )}
            </div>

            {/* Product grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(12)].map((_, i) => (
                  <Skeleton key={i} className="h-80 rounded-xl" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <PackageSearch className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-base font-semibold text-gray-800 mb-1">Không tìm thấy sản phẩm</h3>
                <p className="text-sm text-gray-400 mb-5 text-center max-w-xs">
                  Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để xem nhiều kết quả hơn.
                </p>
                <Button
                  variant="outline"
                  className="rounded-full border-green-200 text-green-700 hover:bg-green-50 text-sm"
                  onClick={() => router.push('/products')}
                >
                  Xóa bộ lọc
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    slug={product.slug}
                    price={product.price}
                    salePrice={product.salePrice}
                    imageUrl={product.imageUrl || undefined}
                    category={product.category || undefined}
                    manufacturer={product.manufacturer || undefined}
                    unit={product.unit}
                    stockQuantity={product.stockQuantity}
                    isFeatured={product.isFeatured}
                    rating={product.rating}
                    reviewCount={product.reviewCount}
                    short_description={product.short_description}
                    quantity_per_unit={product.quantity_per_unit}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-8">
                <Button
                  variant="outline"
                  size="icon"
                  className="w-9 h-9 rounded-full border-gray-200 hover:border-green-300 hover:bg-green-50 disabled:opacity-40"
                  disabled={page <= 1}
                  onClick={() => updateFilters({ page: (page - 1).toString() })}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (page <= 3) pageNum = i + 1;
                  else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = page - 2 + i;

                  const isActive = page === pageNum;
                  return (
                    <Button
                      key={pageNum}
                      size="icon"
                      className={
                        isActive
                          ? 'w-9 h-9 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-sm shadow-green-200 font-semibold'
                          : 'w-9 h-9 rounded-full border border-gray-200 bg-white hover:border-green-300 hover:bg-green-50 text-gray-600 font-medium'
                      }
                      variant={isActive ? 'default' : 'outline'}
                      onClick={() => updateFilters({ page: pageNum.toString() })}
                    >
                      {pageNum}
                    </Button>
                  );
                })}

                <Button
                  variant="outline"
                  size="icon"
                  className="w-9 h-9 rounded-full border-gray-200 hover:border-green-300 hover:bg-green-50 disabled:opacity-40"
                  disabled={page >= totalPages}
                  onClick={() => updateFilters({ page: (page + 1).toString() })}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filters drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowMobileFilters(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Bộ lọc</h3>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full w-8 h-8"
                onClick={() => setShowMobileFilters(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-4">
              <CategorySidebar
                categories={categories}
                manufacturers={manufacturers}
                initialFilters={sidebarFilters}
                onFilterChange={(filters) => {
                  handleFilterChange(filters);
                  setShowMobileFilters(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductsClient;
