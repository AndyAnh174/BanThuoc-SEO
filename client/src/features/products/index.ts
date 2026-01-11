/**
 * Products Feature Module
 * 
 * Exports all components, API functions, stores, and types for the products feature.
 */

// Components
export { 
  ProductCard, 
  ProductList, 
  CategorySidebar,
  type ProductCardProps,
  type ProductListProps,
  type CategorySidebarProps,
  type FilterState,
} from './components';

// Re-export component types with prefixes to avoid conflicts
export type { 
  Category as CategoryFilter, 
  Manufacturer as ManufacturerFilter,
  PriceRange as PriceRangeFilter,
} from './components';

// API
export * from './api';

// Stores
export { 
  useProductsStore,
  type Product as ProductState,
  type Category as CategoryState,
  type Manufacturer as ManufacturerState,
  type FlashSaleSession as FlashSaleSessionState,
  type FlashSaleItem as FlashSaleItemState,
  type ProductFilters as ProductFiltersState,
} from './stores';

// Types - Main source of truth for data types
export {
  // Schemas
  categorySchema,
  manufacturerSchema,
  productSchema,
  productImageSchema,
  flashSaleSessionSchema,
  flashSaleItemSchema,
  priceRangeSchema,
  productFiltersSchema,
  productStatusEnum,
  productTypeEnum,
  flashSaleStatusEnum,
  productListResponseSchema,
  searchResponseSchema,
  // Types
  type Category,
  type CategoryType,
  type Manufacturer,
  type Product,
  type ProductImage,
  type ProductStatus,
  type ProductType,
  type FlashSaleSession,
  type FlashSaleItem,
  type FlashSaleStatus,
  type PriceRange,
  type ProductFilters,
  type ProductListResponse,
  type SearchResponse,
} from './types';
