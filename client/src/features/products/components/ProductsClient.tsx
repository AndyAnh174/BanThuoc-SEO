'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from 'lucide-react';

interface Product {
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
  isFeatured: boolean;
  rating?: number;
  reviewCount?: number;
}

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
  children?: Category[];
}

interface Manufacturer {
  id: string;
  name: string;
  slug: string;
}

export function ProductsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State - use MappedProduct for properly transformed data
  const [products, setProducts] = useState<MappedProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filters from URL
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = 12;
  const category = searchParams.get('category') || '';
  const manufacturer = searchParams.get('manufacturer') || '';
  const search = searchParams.get('search') || '';
  const ordering = searchParams.get('ordering') || '-created_at';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';

  // Local search state
  const [searchInput, setSearchInput] = useState(search);

  // Fetch filters data
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [catRes, manuRes] = await Promise.all([
          getCategories(),
          getManufacturers(),
        ]);
        if (catRes.data?.results) {
          setCategories(catRes.data.results);
        } else if (Array.isArray(catRes.data)) {
          setCategories(catRes.data);
        }
        if (manuRes.data?.results) {
          setManufacturers(manuRes.data.results);
        } else if (Array.isArray(manuRes.data)) {
          setManufacturers(manuRes.data);
        }
      } catch (error) {
        console.error('Failed to fetch filters:', error);
      }
    };
    fetchFilters();
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params: Record<string, string | number> = {
          page,
          page_size: pageSize,
          ordering,
        };
        if (category) params.category = category;
        if (manufacturer) params.manufacturer = manufacturer;
        if (search) params.search = search;
        if (minPrice) params.min_price = minPrice;
        if (maxPrice) params.max_price = maxPrice;

        const response = await getProducts(params);
        if (response.data) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const data = response.data as { count: number; results: any[] };
          // Transform API response to frontend format with image URLs
          const mappedProducts = mapApiProducts(data.results || []);
          setProducts(mappedProducts);
          setTotalCount(data.count || 0);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page, category, manufacturer, search, ordering, minPrice, maxPrice]);

  // Update URL params
  const updateFilters = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    // Reset to page 1 when filters change (except page itself)
    if (!updates.page) {
      params.set('page', '1');
    }

    router.push(`/products?${params.toString()}`);
  }, [searchParams, router]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchInput });
  };

  // Pagination
  const totalPages = Math.ceil(totalCount / pageSize);

  // Active filters
  const activeFilters = [];
  if (category) {
    const cat = categories.find(c => c.slug === category);
    if (cat) activeFilters.push({ key: 'category', label: cat.name });
  }
  if (manufacturer) {
    const manu = manufacturers.find(m => m.slug === manufacturer);
    if (manu) activeFilters.push({ key: 'manufacturer', label: manu.name });
  }
  if (search) activeFilters.push({ key: 'search', label: `"${search}"` });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 shrink-0">
          <CategorySidebar
            categories={categories}
            manufacturers={manufacturers}
            initialFilters={{
              categories: category ? [category] : [],
              manufacturers: manufacturer ? [manufacturer] : [],
              priceRange: { 
                min: minPrice ? Number(minPrice) : 0, 
                max: maxPrice ? Number(maxPrice) : 10000000 
              },
            }}
            onFilterChange={(filters) => {
              updateFilters({ 
                category: filters.categories[0] || '', 
                manufacturer: filters.manufacturers[0] || '',
                min_price: filters.priceRange.min?.toString() || '',
                max_price: filters.priceRange.max?.toString() || '',
              });
            }}
          />
        </aside>

        {/* Mobile filters button */}
        <Button
          variant="outline"
          className="lg:hidden flex items-center gap-2"
          onClick={() => setShowMobileFilters(true)}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Bộ lọc
          {activeFilters.length > 0 && (
            <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
              {activeFilters.length}
            </span>
          )}
        </Button>

        {/* Mobile filters drawer */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-80 bg-white p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Bộ lọc</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowMobileFilters(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <CategorySidebar
                categories={categories}
                manufacturers={manufacturers}
                initialFilters={{
                  categories: category ? [category] : [],
                  manufacturers: manufacturer ? [manufacturer] : [],
                  priceRange: { 
                    min: minPrice ? Number(minPrice) : 0, 
                    max: maxPrice ? Number(maxPrice) : 10000000 
                  },
                }}
                onFilterChange={(filters) => {
                  updateFilters({ 
                    category: filters.categories[0] || '', 
                    manufacturer: filters.manufacturers[0] || '',
                    min_price: filters.priceRange.min?.toString() || '',
                    max_price: filters.priceRange.max?.toString() || '',
                  });
                  setShowMobileFilters(false);
                }}
              />
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {category ? categories.find(c => c.slug === category)?.name || 'Sản phẩm' : 'Tất cả sản phẩm'}
              </h1>
              <p className="text-gray-600">{totalCount} sản phẩm</p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Search */}
              <form onSubmit={handleSearch} className="relative flex-1 sm:w-64">
                <Input
                  type="search"
                  placeholder="Tìm kiếm..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </form>

              {/* Sort */}
              <Select value={ordering} onValueChange={(value) => updateFilters({ ordering: value })}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-created_at">Mới nhất</SelectItem>
                  <SelectItem value="price">Giá thấp → cao</SelectItem>
                  <SelectItem value="-price">Giá cao → thấp</SelectItem>
                  <SelectItem value="name">A → Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active filters */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {activeFilters.map((filter) => (
                <span
                  key={filter.key}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                >
                  {filter.label}
                  <button
                    onClick={() => updateFilters({ [filter.key]: '' })}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <button
                onClick={() => router.push('/products')}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Xóa tất cả
              </button>
            </div>
          )}

          {/* Products grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(12)].map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-lg" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm nào</p>
              <Button variant="outline" className="mt-4" onClick={() => router.push('/products')}>
                Xóa bộ lọc
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="icon"
                disabled={page <= 1}
                onClick={() => updateFilters({ page: (page - 1).toString() })}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? 'default' : 'outline'}
                      size="icon"
                      onClick={() => updateFilters({ page: pageNum.toString() })}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="icon"
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
  );
}

export default ProductsClient;
