import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/src/features/layout';
import { ProductCard } from '@/src/features/products/components/ProductCard';
import { mapApiProducts } from '@/src/lib/api-mapper';

interface Props {
  params: Promise<{ slug: string }>;
}

const BASE_URL = 'https://banthuocsi.vn';
const API_BASE =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://backend:8000/api';

export const revalidate = 3600;

async function fetchManufacturer(slug: string) {
  const res = await fetch(`${API_BASE}/manufacturers/${slug}/`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  return res.json();
}

async function fetchProductsByManufacturer(slug: string) {
  const res = await fetch(
    `${API_BASE}/products/?manufacturer=${encodeURIComponent(slug)}&page_size=48&status=ACTIVE`,
    { next: { revalidate: 600 } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.results || [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const m = await fetchManufacturer(slug);
  if (!m) return { title: 'Nhà sản xuất không tồn tại' };

  const title = `${m.name} - Sản phẩm chính hãng`;
  const description =
    m.description ||
    `Mua sản phẩm ${m.name} chính hãng tại BanThuoc. Đa dạng dược phẩm, giá tốt, giao hàng nhanh.`;
  const canonical = `${BASE_URL}/manufacturers/${slug}`;

  return {
    title: m.name,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      url: canonical,
      siteName: 'BanThuoc',
      locale: 'vi_VN',
      title,
      description,
    },
  };
}

export default async function ManufacturerDetailPage({ params }: Props) {
  const { slug } = await params;
  const m = await fetchManufacturer(slug);
  if (!m) notFound();

  const apiProducts = await fetchProductsByManufacturer(slug);
  const products = mapApiProducts(apiProducts);

  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Sản phẩm ${m.name}`,
    description:
      m.description || `Tất cả sản phẩm của ${m.name} tại BanThuoc`,
    url: `${BASE_URL}/manufacturers/${slug}`,
    isPartOf: { '@type': 'WebSite', name: 'BanThuoc', url: BASE_URL },
    about: {
      '@type': 'Brand',
      name: m.name,
      ...(m.logo_url && { logo: m.logo_url }),
    },
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: BASE_URL },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Nhà sản xuất',
        item: `${BASE_URL}/products`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: m.name,
        item: `${BASE_URL}/manufacturers/${slug}`,
      },
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
      <div className="container mx-auto px-4 py-8">
        <nav className="text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-blue-600">Trang chủ</Link>
          <span className="mx-2">/</span>
          <Link href="/products" className="hover:text-blue-600">Sản phẩm</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{m.name}</span>
        </nav>

        <h1 className="text-3xl font-bold mb-2 text-gray-900">{m.name}</h1>
        {m.description && (
          <p className="text-gray-600 mb-6 max-w-3xl">{m.description}</p>
        )}

        {products.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            Chưa có sản phẩm nào từ nhà sản xuất này.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                slug={p.slug}
                price={p.price}
                salePrice={p.salePrice}
                imageUrl={p.imageUrl || undefined}
                category={p.category || undefined}
                manufacturer={p.manufacturer || undefined}
                unit={p.unit}
                stockQuantity={p.stockQuantity}
                requiresPrescription={p.requiresPrescription}
                isFeatured={p.isFeatured}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
