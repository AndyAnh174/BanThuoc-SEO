import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MainLayout } from '@/src/features/layout';
import { ProductDetailClient } from '@/app/products/[slug]/ProductDetailClient';
import { mapApiProducts } from '@/src/lib/api-mapper';

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
    contraindications: apiProduct.contraindications,
    sideEffects: apiProduct.side_effects,
    storage: apiProduct.storage,
    rating: apiProduct.rating,
    reviewCount: apiProduct.review_count,
    isLiked: apiProduct.is_liked ?? apiProduct.isLiked ?? false,
    likesCount: apiProduct.likes_count ?? apiProduct.likesCount ?? 0,
    relatedProducts: mapApiProducts(apiProduct.related_products || []),
  };
}

const BASE_URL = 'https://banthuocsi.vn';

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const res = await fetch(
      `${process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://backend:8000/api'}/products/${slug}/`,
      { next: { revalidate: 60 } }
    );

    if (!res.ok) {
      return { title: 'Sản phẩm không tồn tại' };
    }

    const p = await res.json();
    const images = p.images || [];
    const primaryImage = images.find((img: any) => img.is_primary) || images[0];
    const imageUrl = primaryImage?.image_url || null;

    const price = Number(p.sale_price || p.price) || 0;
    const priceFormatted = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

    // Build rich description
    const description =
      p.short_description ||
      (p.description ? p.description.replace(/<[^>]+>/g, '').slice(0, 155) + '...' : null) ||
      `Mua ${p.name} chính hãng tại BanThuoc. Giá ${priceFormatted}. Giao hàng nhanh toàn quốc.`;

    // Build keywords from product data
    const keywords = [
      p.name,
      `mua ${p.name}`,
      `${p.name} chính hãng`,
      `${p.name} giá tốt`,
      p.category?.name,
      p.manufacturer?.name,
      'mua thuốc online',
      'banthuoc',
    ].filter(Boolean) as string[];

    const canonicalUrl = `${BASE_URL}/products/${slug}`;

    return {
      // title sẽ được xử lý qua template "%s | BanThuoc" từ layout
      title: p.name,
      description,
      keywords,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        type: 'website',
        url: canonicalUrl,
        siteName: 'BanThuoc',
        locale: 'vi_VN',
        title: `${p.name} | BanThuoc`,
        description,
        images: imageUrl
          ? [
              {
                url: imageUrl,
                width: 800,
                height: 800,
                alt: p.name,
              },
            ]
          : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${p.name} | BanThuoc`,
        description,
        ...(imageUrl ? { images: [imageUrl] } : {}),
      },
    };
  } catch {
    return { title: 'Chi tiết sản phẩm' };
  }
}

function buildJsonLd(apiProduct: any) {
  const BASE = BASE_URL;
  const images = apiProduct.images || [];
  const primaryImage = images.find((img: any) => img.is_primary) || images[0];
  const price = Number(apiProduct.sale_price || apiProduct.price) || 0;

  const jsonLd: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': apiProduct.product_type?.name === 'Thuốc' ? 'Drug' : 'Product',
    name: apiProduct.name,
    description: apiProduct.short_description || apiProduct.description || '',
    sku: apiProduct.sku,
    url: `${BASE}/products/${apiProduct.slug}`,
    ...(primaryImage?.image_url && { image: primaryImage.image_url }),
    ...(apiProduct.manufacturer && {
      manufacturer: {
        '@type': 'Organization',
        name: apiProduct.manufacturer.name,
      },
    }),
    ...(apiProduct.category && {
      category: apiProduct.category.name,
    }),
    offers: {
      '@type': 'Offer',
      url: `${BASE}/products/${apiProduct.slug}`,
      price: price.toString(),
      priceCurrency: 'VND',
      availability:
        (apiProduct.stock_quantity ?? 0) > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: 'BanThuoc' },
    },
  };

  // Drug-specific fields
  if (apiProduct.ingredients) jsonLd.activeIngredient = apiProduct.ingredients;
  if (apiProduct.dosage) jsonLd.dosageForm = apiProduct.dosage;
  if (apiProduct.usage) jsonLd.howPerformed = apiProduct.usage;
  if (apiProduct.contraindications) jsonLd.contraindication = apiProduct.contraindications;
  if (apiProduct.storage) jsonLd.storageGuidelines = apiProduct.storage;

  // Aggregate rating
  if (apiProduct.rating && apiProduct.review_count) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: apiProduct.rating,
      reviewCount: apiProduct.review_count,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return jsonLd;
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  // Fetch product data on server
  try {
    const res = await fetch(
      `${process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://backend:8000/api'}/products/${slug}/`,
      { next: { revalidate: 60 } }
    );

    if (!res.ok) {
      notFound();
    }

    const apiProduct = await res.json();
    // Transform snake_case API response to camelCase for client
    const product = transformProduct(apiProduct);
    const jsonLd = buildJsonLd(apiProduct);

    return (
      <MainLayout>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ProductDetailClient product={product} />
      </MainLayout>
    );
  } catch {
    notFound();
  }
}

