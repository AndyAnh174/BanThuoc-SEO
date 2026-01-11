export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';
export type ProductType = 'MEDICINE' | 'SUPPLEMENT' | 'MEDICAL_DEVICE' | 'COSMETIC' | 'OTHER';

export interface ProductImage {
  id: string;
  image_url: string;
  alt_text?: string;
  is_primary: boolean;
  sort_order: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  
  // Pricing
  price: number;
  sale_price?: number | null;
  
  // Relationships
  category: string; // ID
  category_name?: string;
  manufacturer: string; // ID
  manufacturer_name?: string;
  
  // Details
  product_type: ProductType;
  ingredients?: string;
  dosage?: string;
  usage?: string;
  contraindications?: string;
  side_effects?: string;
  storage?: string;
  
  // Packaging
  unit: string;
  quantity_per_unit?: string;
  
  // Inventory
  stock_quantity: number;
  low_stock_threshold: number;
  
  // Status
  status: ProductStatus;
  requires_prescription: boolean;
  is_featured: boolean;
  
  // SEO
  meta_title?: string;
  meta_description?: string;
  
  // Images
  images?: ProductImage[];
  primary_image?: string | null;
  
  created_at: string;
}

export interface ProductCreateInput {
  sku: string;
  name: string;
  description?: string;
  short_description?: string;
  price: number;
  sale_price?: number | null;
  category: string;
  manufacturer: string;
  product_type: ProductType;
  ingredients?: string;
  dosage?: string;
  usage?: string;
  contraindications?: string;
  side_effects?: string;
  storage?: string;
  unit: string;
  quantity_per_unit?: string;
  stock_quantity: number;
  low_stock_threshold?: number;
  status: ProductStatus;
  requires_prescription: boolean;
  is_featured: boolean;
  meta_title?: string;
  meta_description?: string;
  images?: {
    image_url: string;
    is_primary: boolean;
    sort_order: number;
  }[];
}

export interface ProductUpdateInput extends Partial<ProductCreateInput> {}

export interface ProductListParams {
  page?: number;
  page_size?: number;
  search?: string;
  category?: string;
  manufacturer?: string;
  status?: ProductStatus;
  is_featured?: boolean;
  requires_prescription?: boolean;
  ordering?: string;
}

export interface ProductListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}
