import { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getBlogPost, getLatestPosts, BlogPostDetail } from '@/src/features/blog/api/blog';
import { MainLayout } from '@/src/features/layout';
import { BlogViewTracker } from '@/src/features/blog/components/BlogViewTracker';
import type { Props as PageProps } from './types';

export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await getBlogPost(slug);
    const ogImageUrl = post.og_image_url || post.cover_image
      || `https://banthuocsi.vn/api/blog/og-image/${slug}/`;

    return {
      title: post.seo_title || post.title,
      description: post.seo_description || post.excerpt?.slice(0, 160) || '',
      openGraph: {
        title: post.seo_title || post.title,
        description: post.seo_description || post.excerpt?.slice(0, 160) || '',
        type: 'article',
        publishedTime: post.published_at || post.created_at,
        modifiedTime: post.updated_at,
        authors: [post.author_name],
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: post.title,
          },
        ],
        url: `https://banthuocsi.vn/blog/${slug}`,
        siteName: 'BanThuocSi',
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.excerpt,
        images: [ogImageUrl],
      },
      alternates: {
        canonical: `https://banthuocsi.vn/blog/${slug}`,
      },
    };
  } catch {
    return { title: 'Bài viết không tồn tại' };
  }
}

export const revalidate = 300;

// ─── Structured Data ────────────────────────────────────────────
const SITE_URL = 'https://banthuocsi.vn';
const PUBLISHER_NAME = 'BanThuocSi - Ngọc Kim Ngân Pharma';
const PUBLISHER_LOGO = `${SITE_URL}/2.png`;

function buildBlogPostingJsonLd(post: BlogPostDetail) {
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/blog/${post.slug}`,
    },
    headline: post.seo_title || post.title,
    description: post.seo_description || post.excerpt?.slice(0, 160) || '',
    url: `${SITE_URL}/blog/${post.slug}`,
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at || post.published_at || post.created_at,
    inLanguage: 'vi',
    timeRequired: `PT${post.reading_time_minutes}M`,
    author: {
      '@type': 'Person',
      name: post.author_name,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: PUBLISHER_NAME,
      logo: {
        '@type': 'ImageObject',
        url: PUBLISHER_LOGO,
      },
    },
    interactionStatistic: {
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/ViewAction',
      userInteractionCount: post.view_count,
    },
  };

  if (post.og_image_url || post.cover_image) {
    jsonLd.image = post.og_image_url || post.cover_image;
  }

  if (post.tags && post.tags.length > 0) {
    jsonLd.keywords = post.tags.join(', ');
    jsonLd.about = post.tags.map((tag: string) => ({
      '@type': 'Thing',
      name: tag,
    }));
  }

  return jsonLd;
}

function buildBlogBreadcrumbJsonLd(post: BlogPostDetail) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: post.seo_title || post.title, item: `${SITE_URL}/blog/${post.slug}` },
    ],
  };
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params;
  let post: BlogPostDetail;

  try {
    post = await getBlogPost(slug);
  } catch {
    notFound();
  }

  const latestPosts = await getLatestPosts(4).catch(() => []);

  return (
    <MainLayout fullWidth>
    <BlogViewTracker slug={slug} />
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBlogPostingJsonLd(post)) }}
    />
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBlogBreadcrumbJsonLd(post)) }}
    />
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <nav className="text-sm text-gray-500 flex items-center gap-2">
          <Link href="/" className="hover:text-green-700">Trang chủ</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-green-700">Blog</Link>
          <span>/</span>
          <span className="text-gray-900 truncate max-w-xs">{post.title}</span>
        </nav>
      </div>

      <article className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="mb-8 mt-6">
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags?.map((tag: string) => (
                <Link
                  key={tag}
                  href={`/blog?tag=${tag}`}
                  className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full hover:bg-green-100 transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
              <span>{post.author_name}</span>
              <span>·</span>
              <span>
                {post.published_at
                  ? new Date(post.published_at).toLocaleDateString('vi-VN', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })
                  : new Date(post.created_at).toLocaleDateString('vi-VN', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
              </span>
              <span>·</span>
              <span>{post.reading_time_minutes} phút đọc</span>
              <span>·</span>
              <span>{post.view_count} lượt xem</span>
            </div>
          </header>

          {/* Cover Image */}
          {post.cover_image && (
            <div className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden mb-8">
              <Image
                src={post.cover_image}
                alt={post.title}
                fill
                priority
                sizes="(max-width: 1200px) 100vw, 900px"
                className="object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div
            className="prose prose-lg prose-green max-w-none mb-12
              prose-headings:text-gray-900
              prose-p:text-gray-700 prose-p:leading-relaxed
              prose-a:text-green-600 prose-a:no-underline hover:prose-a:underline
              prose-img:rounded-xl prose-img:shadow-md
              prose-strong:text-gray-900
              prose-blockquote:border-green-500 prose-blockquote:bg-green-50 prose-blockquote:py-2 prose-blockquote:rounded-r-lg
              [&_iframe]:max-w-full
              [&_img]:max-w-full [&_img]:h-auto"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Author bio */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-lg">
                {post.author_name?.[0] || 'B'}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{post.author_name}</p>
                <p className="text-sm text-gray-500">Dược sĩ tại BanThuocSi</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <Link
              href="/blog"
              className="text-green-600 hover:text-green-700 font-medium flex items-center gap-2"
            >
              ← Quay lại Blog
            </Link>
          </div>
        </div>
      </article>

      {/* Related Posts Sidebar */}
      {latestPosts.length > 0 && (
        <section className="bg-white border-t border-gray-200 py-12">
          <div className="container mx-auto px-4">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Bài viết mới nhất</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {latestPosts.filter(p => p.slug !== slug).slice(0, 4).map(post => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group"
                >
                  <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-gray-100 mb-3">
                    {post.cover_image ? (
                      <Image
                        src={post.cover_image}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">
                        📄
                      </div>
                    )}
                  </div>
                  <h4 className="font-medium text-gray-900 line-clamp-2 group-hover:text-green-700 transition-colors text-sm">
                    {post.title}
                  </h4>
                  <span className="text-xs text-gray-400 mt-1 block">
                    {post.reading_time_minutes} phút đọc
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
    </MainLayout>
  );
}
