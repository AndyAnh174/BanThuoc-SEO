/**
 * TypeScript types and Zod schemas for products
 */
import { z } from 'zod';

// ============================================================================
// Category Types
// ============================================================================

export interface CategoryType {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string | null;
  parent?: string | null;
  isActive: boolean;
  children?: CategoryType[];
  productCount?: number;
}

export const categorySchema: z.ZodType<CategoryType> = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  image: z.string().url().optional().nullable(),
  parent: z.string().uuid().optional().nullable(),
  isActive: z.boolean().default(true),
  children: z.lazy(() => z.array(categorySchema)).optional(),
  productCount: z.number().optional(),
});

export type Category = z.infer<typeof categorySchema>;

// ============================================================================
// Manufacturer Types
// ============================================================================

export const manufacturerSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  logo: z.string().url().optional().nullable(),
  website: z.string().url().optional().nullable(),
  country: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type Manufacturer = z.infer<typeof manufacturerSchema>;

// ============================================================================
// Product Types
// ============================================================================

export const productStatusEnum = z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'OUT_OF_STOCK']);
export const productTypeEnum = z.enum(['MEDICINE', 'SUPPLEMENT', 'MEDICAL_DEVICE', 'COSMETIC', 'OTHER']);

export type ProductStatus = z.infer<typeof productStatusEnum>;
export type ProductType = z.infer<typeof productTypeEnum>;

export const productImageSchema = z.object({
  id: z.string().uuid(),
  imageUrl: z.string(),
  altText: z.string().optional(),
  isPrimary: z.boolean().default(false),
  sortOrder: z.number().default(0),
});

export type ProductImage = z.infer<typeof productImageSchema>;

export const productSchema = z.object({
  id: z.string().uuid(),
  sku: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  
  // Pricing
  price: z.number().positive(),
  salePrice: z.number().positive().optional().nullable(),
  
  // Relationships
  category: categorySchema.optional(),
  manufacturer: manufacturerSchema.optional(),
  
  // Product details
  productType: productTypeEnum,
  ingredients: z.string().optional(),
  dosage: z.string().optional(),
  usage: z.string().optional(),
  contraindications: z.string().optional(),
  sideEffects: z.string().optional(),
  storage: z.string().optional(),
  
  // Packaging
  unit: z.string().default('Hộp'),
  quantityPerUnit: z.string().optional(),
  
  // Inventory
  stockQuantity: z.number().int().min(0),
  lowStockThreshold: z.number().int().min(0).default(10),
  
  // Status
  status: productStatusEnum,
  requiresPrescription: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  
  // Ratings & Social
  rating: z.number().optional(),
  reviewCount: z.number().optional(),
  isLiked: z.boolean().optional(),
  likesCount: z.number().optional(),
  
  // SEO
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  
  // Images
  images: z.array(productImageSchema).optional(),
  
  // Timestamps
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type Product = z.infer<typeof productSchema>;

// ============================================================================
// Flash Sale Types
// ============================================================================

export const flashSaleStatusEnum = z.enum(['SCHEDULED', 'ACTIVE', 'ENDED', 'CANCELLED']);
export type FlashSaleStatus = z.infer<typeof flashSaleStatusEnum>;

export const flashSaleItemSchema = z.object({
  id: z.string().uuid(),
  product: productSchema,
  originalPrice: z.number().positive(),
  flashSalePrice: z.number().positive(),
  totalQuantity: z.number().int().positive(),
  remainingQuantity: z.number().int().min(0),
  soldQuantity: z.number().int().min(0),
  maxPerUser: z.number().int().positive().default(1),
  discountPercentage: z.number().min(0).max(100),
  soldPercentage: z.number().min(0).max(100),
  isSoldOut: z.boolean(),
});

export type FlashSaleItem = z.infer<typeof flashSaleItemSchema>;

export const flashSaleSessionSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  bannerImage: z.string().url().optional().nullable(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  status: flashSaleStatusEnum,
  maxItemsPerUser: z.number().int().positive().default(1),
  isActive: z.boolean().default(true),
  items: z.array(flashSaleItemSchema).optional(),
  totalItems: z.number().int().optional(),
  availableItems: z.number().int().optional(),
  timeRemaining: z.number().optional().nullable(),
  isCurrentlyActive: z.boolean().optional(),
  isUpcoming: z.boolean().optional(),
  isEnded: z.boolean().optional(),
});

export type FlashSaleSession = z.infer<typeof flashSaleSessionSchema>;

// ============================================================================
// Filter Types
// ============================================================================

export const priceRangeSchema = z.object({
  min: z.number().min(0),
  max: z.number().positive(),
});

export type PriceRange = z.infer<typeof priceRangeSchema>;

export const productFiltersSchema = z.object({
  categories: z.array(z.string().uuid()).default([]),
  manufacturers: z.array(z.string().uuid()).default([]),
  priceRange: priceRangeSchema,
  onSaleOnly: z.boolean().default(false),
  inStockOnly: z.boolean().default(true),
  requiresPrescription: z.boolean().optional(),
});

export type ProductFilters = z.infer<typeof productFiltersSchema>;

// ============================================================================
// API Response Types
// ============================================================================

export const paginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    count: z.number(),
    next: z.string().url().nullable(),
    previous: z.string().url().nullable(),
    results: z.array(itemSchema),
  });

export const productListResponseSchema = paginatedResponseSchema(productSchema);
export type ProductListResponse = z.infer<typeof productListResponseSchema>;

export const searchResponseSchema = z.object({
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
  results: z.array(productSchema),
  facets: z.record(z.string(), z.any()).optional(),
});

export type SearchResponse = z.infer<typeof searchResponseSchema>;
