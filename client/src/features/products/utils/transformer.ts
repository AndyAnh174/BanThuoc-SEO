import { Product } from '../types/product.types';

export const transformProduct = (data: any): Product => {
  if (!data) return data;

  return {
    ...data,
    stockQuantity: data.stock_quantity ?? data.stockQuantity ?? 0,
    lowStockThreshold: data.low_stock_threshold ?? data.lowStockThreshold ?? 10,
    requiresPrescription: data.requires_prescription ?? data.requiresPrescription ?? false,
    isFeatured: data.is_featured ?? data.isFeatured ?? false,
    salePrice: data.sale_price ?? data.salePrice,
    shortDescription: data.short_description ?? data.shortDescription,
    productType: data.product_type ?? data.productType,
    quantityPerUnit: data.quantity_per_unit ?? data.quantityPerUnit,
    metaTitle: data.meta_title ?? data.metaTitle,
    metaDescription: data.meta_description ?? data.metaDescription,
    createdAt: data.created_at ?? data.createdAt,
    updatedAt: data.updated_at ?? data.updatedAt,
    isLiked: data.is_liked ?? data.isLiked ?? false,
    likesCount: data.likes_count ?? data.likesCount ?? 0,
    // Add other fields if necessary
  };
};

export const transformProductList = (data: any) => {
    if (data.results && Array.isArray(data.results)) {
        return {
            ...data,
            results: data.results.map(transformProduct)
        };
    }
    return data;
};
