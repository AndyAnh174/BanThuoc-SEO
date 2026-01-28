'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ShoppingCart, 
  Heart, 
  Share2, 
  ChevronRight, 
  Minus, 
  Plus,
  Star,
  Truck,
  Shield,
  RotateCcw,
  Pill
} from 'lucide-react';
import { toast } from 'sonner';
import { ProductCard } from '@/src/features/products';
import { MappedProduct } from '@/src/lib/api-mapper';
import { toggleFavorite } from '@/src/features/products/api/products.api';
import { useAuthStore } from '@/src/features/auth/stores/auth.store';

interface ProductImage {
  id: string;
  url: string;
  alt?: string;
}

interface ProductDetailProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    salePrice: number | null;
    description: string;
    shortDescription?: string;
    imageUrl: string | null;
    images: ProductImage[];
    category: { id: string; name: string; slug: string } | null;
    manufacturer: { id: string; name: string; slug: string } | null;
    unit: string;
    stockQuantity: number;
    requiresPrescription: boolean;
    isFeatured: boolean;
    sku?: string;
    barcode?: string;
    ingredients?: string;
    usage?: string;
    dosage?: string;
    contraindications?: string;
    sideEffects?: string;
    storage?: string;
    rating?: number;
    reviewCount?: number;
    relatedProducts?: MappedProduct[];
    isLiked?: boolean;
    likesCount?: number;
  };
}

export function ProductDetailClient({ product }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(product.isLiked || false);
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  // Calculate price
  const currentPrice = product.salePrice ?? product.price;
  const isOnSale = product.salePrice !== null && product.salePrice < product.price;
  const discountPercent = isOnSale
    ? Math.round((1 - currentPrice / product.price) * 100)
    : 0;
  const isOutOfStock = product.stockQuantity <= 0;

  // Images are now pre-transformed with url field (from SSR transformation)
  const productImages = Array.isArray(product.images) ? product.images : [];
  const validImages = productImages.filter(img => img && img.url && img.url.trim() !== '');
  
  // Use imageUrl (primary) or first valid image
  const allImages = product.imageUrl && product.imageUrl.trim() !== ''
    ? [{ id: 'main', url: product.imageUrl, alt: product.name }, ...validImages.filter(img => img.url !== product.imageUrl)]
    : validImages;

  // Format price
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  // Handle quantity
  const handleQuantityChange = (delta: number) => {
    const newQty = quantity + delta;
    if (newQty >= 1 && newQty <= product.stockQuantity) {
      setQuantity(newQty);
    }
  };

  // Handle add to cart
  const handleAddToCart = () => {
    // TODO: Implement cart logic
    toast.success(`Đã thêm ${quantity} ${product.name} vào giỏ hàng`);
  };

  // Handle share
  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: product.name,
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Đã sao chép liên kết');
    }
  };

  // Handle favorite toggle
  const handleToggleWishlist = async () => {
    const hasToken = typeof window !== 'undefined' && (!!localStorage.getItem('accessToken') || !!localStorage.getItem('access_token'));
    
    if (!hasToken) {
        toast.error("Vui lòng đăng nhập để thực hiện chức năng này");
        router.push("/auth/login");
        return;
    }

    const previousState = isWishlisted;
    setIsWishlisted(!previousState);

    try {
        await toggleFavorite(product.id);
        toast.success(!previousState ? "Đã thêm vào yêu thích" : "Đã xoá khỏi yêu thích");
    } catch {
        setIsWishlisted(previousState);
        toast.error("Có lỗi xảy ra");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-gray-500 mb-6 overflow-x-auto">
        <Link href="/" className="hover:text-primary whitespace-nowrap">Trang chủ</Link>
        <ChevronRight className="w-4 h-4 mx-2 shrink-0" />
        <Link href="/products" className="hover:text-primary whitespace-nowrap">Sản phẩm</Link>
        {product.category && (
          <>
            <ChevronRight className="w-4 h-4 mx-2 shrink-0" />
            <Link 
              href={`/products?category=${product.category.slug}`} 
              className="hover:text-primary whitespace-nowrap"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-4 h-4 mx-2 shrink-0" />
        <span className="text-gray-900 font-medium truncate">{product.name}</span>
      </nav>

      {/* Product main section */}
      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        {/* Gallery - Thumbnails left, Main image right */}
        <div className="flex gap-4">
          {/* Thumbnails - Vertical on left */}
          {allImages.length > 1 && (
            <div className="flex flex-col gap-2 shrink-0">
              {allImages.map((img, index) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(index)}
                  className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index ? 'border-primary' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={img.alt || `${product.name} ${index + 1}`}
                    fill
                    sizes="64px"
                    className="object-contain p-1"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Main image */}
          <div className="relative flex-1 aspect-square max-w-md bg-white rounded-xl border overflow-hidden">
            {allImages.length > 0 ? (
              <Image
                src={allImages[selectedImage]?.url || '/images/product-placeholder.png'}
                alt={allImages[selectedImage]?.alt || product.name}
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-contain p-4"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                No image
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {isOnSale && (
                <Badge className="bg-red-500 hover:bg-red-600 text-white text-xs">
                  -{discountPercent}%
                </Badge>
              )}
              {product.requiresPrescription && (
                <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 text-xs">
                  <Pill className="w-3 h-3 mr-1" />
                  Rx
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-6">
          {/* Category & Manufacturer */}
          <div className="flex items-center gap-2 text-sm">
            {product.category && (
              <Link 
                href={`/products?category=${product.category.slug}`}
                className="text-primary hover:underline"
              >
                {product.category.name}
              </Link>
            )}
            {product.category && product.manufacturer && <span className="text-gray-300">|</span>}
            {product.manufacturer && (
              <Link 
                href={`/products?manufacturer=${product.manufacturer.slug}`}
                className="text-gray-500 hover:text-primary"
              >
                {product.manufacturer.name}
              </Link>
            )}
          </div>

          {/* Name */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{product.name}</h1>

          {/* Rating */}
          {product.rating !== undefined && product.rating > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.round(product.rating!)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-600">
                {product.rating.toFixed(1)} ({product.reviewCount} đánh giá)
              </span>
            </div>
          )}

          {/* Price */}
          <div className="space-y-1">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary">
                {formatPrice(currentPrice)}
              </span>
              {isOnSale && (
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            <p className="text-gray-500">Đơn vị: {product.unit}</p>
          </div>

          {/* Short description */}
          {product.shortDescription && (
            <p className="text-gray-600">{product.shortDescription}</p>
          )}

          {/* Stock status */}
          {isOutOfStock ? (
            <Badge variant="destructive" className="text-sm">Hết hàng</Badge>
          ) : (
            <Badge variant="outline" className="text-sm text-green-600 border-green-200 bg-green-50">
              Còn {product.stockQuantity} sản phẩm
            </Badge>
          )}

          {/* Quantity & Add to cart */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Quantity selector */}
            <div className="flex items-center border rounded-lg">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= product.stockQuantity}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 flex-1">
              <Button
                size="lg"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Thêm vào giỏ
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleToggleWishlist}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleShare}
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Truck className="w-5 h-5 text-primary" />
              </div>
              <div className="text-sm">
                <p className="font-medium">Giao hàng nhanh</p>
                <p className="text-gray-500">2h nội thành</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div className="text-sm">
                <p className="font-medium">Chính hãng</p>
                <p className="text-gray-500">100% đảm bảo</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <RotateCcw className="w-5 h-5 text-primary" />
              </div>
              <div className="text-sm">
                <p className="font-medium">Đổi trả dễ dàng</p>
                <p className="text-gray-500">Trong 7 ngày</p>
              </div>
            </div>
          </div>

          {/* SKU */}
          {product.sku && (
            <p className="text-sm text-gray-500">
              Mã sản phẩm: <span className="font-medium">{product.sku}</span>
            </p>
          )}
        </div>
      </div>

      {/* Product details tabs */}
      <Tabs defaultValue="description" className="mb-12">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
          <TabsTrigger 
            value="description"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            Mô tả sản phẩm
          </TabsTrigger>
          <TabsTrigger 
            value="usage"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            Cách dùng
          </TabsTrigger>
          <TabsTrigger 
            value="ingredients"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            Thành phần
          </TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="pt-6">
          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: product.description || 'Chưa có mô tả' }}
          />
        </TabsContent>

        <TabsContent value="usage" className="pt-6">
          <div className="space-y-4">
            {product.dosage && (
              <div>
                <h3 className="font-semibold mb-2">Liều dùng</h3>
                <p className="text-gray-600">{product.dosage}</p>
              </div>
            )}
            {product.usage && (
              <div>
                <h3 className="font-semibold mb-2">Hướng dẫn sử dụng</h3>
                <p className="text-gray-600">{product.usage}</p>
              </div>
            )}
            {product.contraindications && (
              <div>
                <h3 className="font-semibold mb-2">Chống chỉ định</h3>
                <p className="text-gray-600">{product.contraindications}</p>
              </div>
            )}
            {product.sideEffects && (
              <div>
                <h3 className="font-semibold mb-2">Tác dụng phụ</h3>
                <p className="text-gray-600">{product.sideEffects}</p>
              </div>
            )}
            {product.storage && (
              <div>
                <h3 className="font-semibold mb-2">Bảo quản</h3>
                <p className="text-gray-600">{product.storage}</p>
              </div>
            )}
            {!product.dosage && !product.usage && !product.sideEffects && !product.storage && (
              <p className="text-gray-500">Chưa có thông tin</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="ingredients" className="pt-6">
          {product.ingredients ? (
            <p className="text-gray-600">{product.ingredients}</p>
          ) : (
            <p className="text-gray-500">Chưa có thông tin thành phần</p>
          )}
        </TabsContent>
      </Tabs>

      {/* Related Products Section */}
      {product.relatedProducts && product.relatedProducts.length > 0 && (
         <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Sản phẩm liên quan</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
               {product.relatedProducts.map(rp => (
                  <ProductCard 
                     key={rp.id}
                     id={rp.id}
                     name={rp.name}
                     slug={rp.slug}
                     price={rp.price}
                     salePrice={rp.salePrice}
                     imageUrl={rp.imageUrl || undefined}
                     category={rp.category || undefined}
                     manufacturer={rp.manufacturer || undefined}
                     unit={rp.unit}
                     stockQuantity={rp.stockQuantity}
                     isFeatured={rp.isFeatured}
                     requiresPrescription={rp.requiresPrescription}
                     rating={rp.rating}
                     reviewCount={rp.reviewCount}
                     short_description={rp.short_description}
                     quantity_per_unit={rp.quantity_per_unit}
                     isLiked={rp.isLiked}
                  />
               ))}
            </div>
         </div>
      )}
    </div>
  );
}

export default ProductDetailClient;
