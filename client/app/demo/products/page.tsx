'use client';

import { useEffect, useState } from 'react';
import { ProductDetailLayout, getProducts, ProductList } from '@/src/features/products';
import { Loader2 } from 'lucide-react';

interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  sale_price?: number | null;
  unit: string;
  stock_quantity: number;
  requires_prescription: boolean;
  is_featured: boolean;
  category?: {
    name: string;
    slug: string;
  };
  manufacturer?: {
    name: string;
    slug: string;
  };
  images?: Array<{
    id: string;
    image_url: string;
    alt_text?: string;
    is_primary?: boolean;
  }>;
}

// Transform API response to component format
const transformProduct = (apiProduct: ApiProduct) => ({
  id: apiProduct.id,
  name: apiProduct.name,
  slug: apiProduct.slug,
  sku: apiProduct.sku,
  price: apiProduct.price,
  salePrice: apiProduct.sale_price,
  unit: apiProduct.unit,
  stockQuantity: apiProduct.stock_quantity,
  requiresPrescription: apiProduct.requires_prescription,
  isFeatured: apiProduct.is_featured,
  category: apiProduct.category,
  manufacturer: apiProduct.manufacturer,
  images: apiProduct.images?.map(img => ({
    id: img.id,
    imageUrl: img.image_url,
    altText: img.alt_text,
    isPrimary: img.is_primary,
  })) || [],
});

export default function ProductDemoPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await getProducts({ page_size: 10 });
        const apiProducts = response.data.results || response.data || [];
        
        const transformedProducts = apiProducts.map(transformProduct);
        setProducts(transformedProducts);
        
        if (transformedProducts.length > 0) {
          setSelectedProduct(transformedProducts[0]);
        }
      } catch (err: any) {
        console.error('Error fetching products:', err);
        setError(err.message || 'Không thể tải sản phẩm từ API');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Đang tải sản phẩm từ API...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Lỗi kết nối API</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            Đảm bảo Django server đang chạy tại{' '}
            <code className="bg-gray-100 px-2 py-1 rounded">localhost:8000</code>
          </p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📦</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Chưa có sản phẩm</h2>
          <p className="text-gray-600">Hãy seed dữ liệu sản phẩm trước</p>
          <code className="block mt-4 bg-gray-100 p-3 rounded text-sm">
            python manage.py seed_products
          </code>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary text-white py-4 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold">🧪 Product Components Demo</h1>
          <p className="text-green-100">Data từ API - {products.length} sản phẩm</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Product List */}
          <aside className="lg:col-span-1">
            <h2 className="font-bold text-gray-900 mb-4">Chọn sản phẩm để xem chi tiết:</h2>
            <div className="space-y-2">
              {products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedProduct?.id === product.id
                      ? 'border-primary bg-green-50 ring-2 ring-primary/20'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium text-sm line-clamp-2">{product.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                  </p>
                </button>
              ))}
            </div>
          </aside>

          {/* Main content - Product Detail */}
          <div className="lg:col-span-3">
            {selectedProduct ? (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <ProductDetailLayout product={selectedProduct} />
              </div>
            ) : (
              <div className="text-center text-gray-500 py-20">
                Chọn một sản phẩm để xem chi tiết
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>Demo page - BanThuoc Frontend - Data từ Django API</p>
        </div>
      </footer>
    </div>
  );
}
