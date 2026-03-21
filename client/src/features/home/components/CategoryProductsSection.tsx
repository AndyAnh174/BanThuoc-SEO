'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductCard } from '@/src/features/products';
import { getProducts, getCategories } from '@/src/features/products';
import { mapApiProducts, MappedProduct } from '@/src/lib/api-mapper';
import { ArrowRight, Pill, Stethoscope, Apple, BookOpen, Tag } from 'lucide-react';

interface RootCategory {
    id: string;
    name: string;
    slug: string;
}

interface CategorySection {
    category: RootCategory;
    products: MappedProduct[];
}

// Icon + accent color cho tung danh muc cha
const CATEGORY_STYLE: Record<string, { icon: React.ReactNode; accent: string; bg: string; pill: string }> = {
    'thuoc': {
        icon: <Pill className="w-5 h-5" />,
        accent: 'text-blue-600',
        bg: 'bg-blue-600',
        pill: 'bg-blue-50 text-blue-700 border-blue-100',
    },
    'thiet-bi-y-te': {
        icon: <Stethoscope className="w-5 h-5" />,
        accent: 'text-green-600',
        bg: 'bg-green-600',
        pill: 'bg-green-50 text-green-700 border-green-100',
    },
    'thuc-pham-chuc-nang': {
        icon: <Apple className="w-5 h-5" />,
        accent: 'text-orange-500',
        bg: 'bg-orange-500',
        pill: 'bg-orange-50 text-orange-700 border-orange-100',
    },
    'sach': {
        icon: <BookOpen className="w-5 h-5" />,
        accent: 'text-purple-600',
        bg: 'bg-purple-600',
        pill: 'bg-purple-50 text-purple-700 border-purple-100',
    },
};

const DEFAULT_STYLE = {
    icon: <Tag className="w-5 h-5" />,
    accent: 'text-gray-600',
    bg: 'bg-gray-600',
    pill: 'bg-gray-50 text-gray-700 border-gray-100',
};

function SectionSkeleton() {
    return (
        <section className="py-6">
            <div className="container mx-auto px-4">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <Skeleton className="h-7 w-48" />
                        <Skeleton className="h-8 w-24" />
                    </div>
                    <div className="p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-72 rounded-xl" />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function CategoryBlock({ section }: { section: CategorySection }) {
    const style = CATEGORY_STYLE[section.category.slug] || DEFAULT_STYLE;

    return (
        <section className="py-6">
            <div className="container mx-auto px-4">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {/* Accent bar */}
                                <div className={`w-1 h-7 rounded-full ${style.bg} shrink-0`} />
                                <span className={`${style.accent}`}>{style.icon}</span>
                                <h2 className="text-lg font-bold text-gray-900">
                                    {section.category.name}
                                </h2>
                                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${style.pill} hidden sm:inline-flex`}>
                                    {section.products.length} sản phẩm
                                </span>
                            </div>
                            <Link href={`/products?category=${section.category.slug}`}>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-sm text-gray-500 hover:text-gray-900 gap-1.5 rounded-full"
                                >
                                    Xem tất cả
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Products grid */}
                    <div className="p-5">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {section.products.map((product) => (
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

                        {/* "Xem thêm" button ở cuối section */}
                        <div className="mt-5 text-center">
                            <Link href={`/products?category=${section.category.slug}`}>
                                <Button
                                    variant="outline"
                                    className={`rounded-full border-gray-200 text-sm gap-2 hover:border-current ${style.accent}`}
                                >
                                    Xem thêm {section.category.name}
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export function CategoryProductsSection() {
    const [sections, setSections] = useState<CategorySection[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                // Lay danh muc (loc ra root categories - ko co parent)
                const catRes = await getCategories();
                const allCats: any[] = catRes.data?.results || catRes.data || [];
                const rootCats: RootCategory[] = allCats
                    .filter((c: any) => !c.parent)
                    .filter((c: any) => c.slug !== 'sach') // bo "sach" khoi trang chu
                    .slice(0, 5); // toi da 5 danh muc

                // Fetch san pham cho tung danh muc song song
                const results = await Promise.all(
                    rootCats.map(async (cat) => {
                        try {
                            const res = await getProducts({
                                category: cat.slug,
                                page_size: 8,
                                ordering: '-created_at',
                            });
                            const raw = res.data?.results || [];
                            return {
                                category: cat,
                                products: mapApiProducts(raw),
                            };
                        } catch {
                            return { category: cat, products: [] };
                        }
                    })
                );

                // Chi hien cac danh muc co san pham
                setSections(results.filter((s) => s.products.length > 0));
            } catch (err) {
                console.error('CategoryProductsSection error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, []);

    if (loading) {
        return (
            <>
                <SectionSkeleton />
                <SectionSkeleton />
                <SectionSkeleton />
            </>
        );
    }

    if (sections.length === 0) return null;

    return (
        <>
            {sections.map((section) => (
                <CategoryBlock key={section.category.id} section={section} />
            ))}
        </>
    );
}

export default CategoryProductsSection;
