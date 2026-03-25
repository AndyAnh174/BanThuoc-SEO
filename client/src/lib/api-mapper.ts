export interface MappedProduct {
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
    requiresPrescription: boolean;
    isLiked?: boolean;
    short_description?: string;
    quantity_per_unit?: string;
    rating?: number;
    reviewCount?: number;
}

export function mapApiProducts(products: any[]): MappedProduct[] {
    if (!Array.isArray(products)) {
        console.warn('mapApiProducts received non-array input:', products);
        return [];
    }

    return products.map(product => {
        let imageUrl = null;

        // Handle primary_image object from generic ProductListSerializer
        if (product.primary_image && typeof product.primary_image === 'object') {
            imageUrl = product.primary_image.image_url || null;
        }
        // Handle images array from generic ProductDetailSerializer or other views
        else if (Array.isArray(product.images) && product.images.length > 0) {
            // Find primary
            const primary = product.images.find((img: any) => img.is_primary);
            if (primary) {
                imageUrl = primary.image_url;
            } else {
                imageUrl = product.images[0].image_url;
            }
        }
        // Handle simple image string if legacy or mapped elsewhere
        else if (typeof product.image === 'string') {
            imageUrl = product.image;
        } else if (typeof product.imageUrl === 'string') {
            imageUrl = product.imageUrl;
        }

        // Ensure numeric values
        // Handle both camelCase (from transformer) and snake_case (from raw API)
        const priceStr = product.price;
        const price = typeof priceStr === 'string' ? parseFloat(priceStr) : Number(priceStr);

        const salePriceSource = product.salePrice ?? product.sale_price;
        const salePrice = salePriceSource ? (typeof salePriceSource === 'string' ? parseFloat(salePriceSource) : Number(salePriceSource)) : null;

        const stockQuantity = Number(product.stockQuantity ?? product.stock_quantity ?? 0);
        const requiresPrescription = Boolean(product.requiresPrescription ?? product.requires_prescription ?? false);
        const isFeatured = Boolean(product.isFeatured ?? product.is_featured ?? false);
        const isLiked = Boolean(product.isLiked ?? product.is_liked ?? false);

        // Mapping keys that frontend expects in specific casing
        // ProductCard/Details expect snake_case for these two for some reason
        const short_description = product.shortDescription ?? product.short_description ?? '';
        const quantity_per_unit = product.quantityPerUnit ?? product.quantity_per_unit ?? '';

        const rating = Number(product.rating) || 0;
        const reviewCount = Number(product.reviewCount ?? product.review_count ?? product.likesCount ?? product.likes_count ?? 0);

        return {
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: isNaN(price) ? 0 : price,
            salePrice: salePrice,
            imageUrl: imageUrl,
            category: product.category || null,
            manufacturer: product.manufacturer || null,
            unit: product.unit || '',
            stockQuantity,
            requiresPrescription,
            isFeatured,
            isLiked,
            short_description,
            quantity_per_unit,
            rating,
            reviewCount,
        };
    });
}
