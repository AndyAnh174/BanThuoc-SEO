import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MainLayout } from '@/src/features/layout';
import { ProductDetailClient } from '@/app/products/[slug]/ProductDetailClient';

interface Props {
  params: Promise<{ slug: string }>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformProduct(apiProduct: any) {
  // Get primary image URL from images array
  const images = apiProduct.images || [];
  const primaryImage = images.find((img: { is_primary: boolean }) => img.is_primary) || images[0];
  
  return {
    id: apiProduct.id,
    name: apiProduct.name,
    slug: apiProduct.slug,
    price: Number(apiProduct.price) || 0,
    salePrice: apiProduct.sale_price != null ? Number(apiProduct.sale_price) : null,
    description: apiProduct.description || '',
    shortDescription: apiProduct.short_description || '',
    imageUrl: primaryImage?.image_url || null,
    images: images.map((img: { id: string; image_url: string; alt_text?: string; is_primary?: boolean; sort_order?: number }) => ({
      id: img.id,
      url: img.image_url,
      alt: img.alt_text || apiProduct.name,
    })),
    category: apiProduct.category,
    manufacturer: apiProduct.manufacturer,
    unit: apiProduct.unit || 'Hộp',
    stockQuantity: apiProduct.stock_quantity ?? 0,
    requiresPrescription: apiProduct.requires_prescription ?? false,
    isFeatured: apiProduct.is_featured ?? false,
    sku: apiProduct.sku,
    barcode: apiProduct.barcode,
    ingredients: apiProduct.ingredients,
    usage: apiProduct.usage,
    dosage: apiProduct.dosage,
    sideEffects: apiProduct.side_effects,
    storage: apiProduct.storage,
    rating: apiProduct.rating,
    reviewCount: apiProduct.review_count,
  };
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/products/${slug}/`,
      { next: { revalidate: 60 } }
    );
    
    if (!res.ok) {
      return {
        title: 'Sản phẩm không tồn tại | BanThuoc',
      };
    }
    
    const apiProduct = await res.json();
    const images = apiProduct.images || [];
    const primaryImage = images.find((img: { is_primary: boolean }) => img.is_primary) || images[0];
    
    return {
      title: `${apiProduct.name} | BanThuoc`,
      description: apiProduct.short_description || apiProduct.description?.slice(0, 160) || `Mua ${apiProduct.name} chính hãng tại BanThuoc với giá tốt nhất`,
      openGraph: {
        title: apiProduct.name,
        description: apiProduct.short_description || `Mua ${apiProduct.name} chính hãng tại BanThuoc`,
        images: primaryImage?.image_url ? [{ url: primaryImage.image_url }] : [],
      },
    };
  } catch {
    return {
      title: 'Chi tiết sản phẩm | BanThuoc',
    };
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  // Fetch product data on server
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/products/${slug}/`,
      { next: { revalidate: 60 } }
    );
    
    if (!res.ok) {
      notFound();
    }
    
    const apiProduct = await res.json();
    // Transform snake_case API response to camelCase for client
    const product = transformProduct(apiProduct);
    
    return (
      <MainLayout>
        <ProductDetailClient product={product} />
      </MainLayout>
    );
  } catch {
    notFound();
  }
}

