/**
 * Admin Category Types
 */

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  parent: string | null;
  parent_name: string | null;
  is_active: boolean;
  level: number;
  children_count: number;
  product_count: number;
  created_at: string;
  updated_at: string;
}

export interface CategoryTree {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  is_active: boolean;
  level: number;
  product_count: number;
  children: CategoryTree[];
}

export interface CategoryDetail extends Category {
  full_path: string;
  ancestors: { id: string; name: string; slug: string }[];
  children: Category[];
  total_product_count: number;
}

export interface CategoryCreateInput {
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  parent?: string | null;
  is_active?: boolean;
}

export interface CategoryUpdateInput {
  name?: string;
  slug?: string;
  description?: string;
  image?: string;
  parent?: string | null;
  is_active?: boolean;
}

export interface CategoryListParams {
  page?: number;
  page_size?: number;
  search?: string;
  parent?: string;
  is_active?: boolean;
  root_only?: boolean;
  ordering?: string;
}

export interface CategoryListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Category[];
}

export interface CategoryTreeResponse {
  count: number;
  results: CategoryTree[];
}
