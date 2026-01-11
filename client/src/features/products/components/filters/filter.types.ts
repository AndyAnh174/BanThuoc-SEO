/**
 * Types for filter components
 */

export interface Category {
  id: string;
  name: string;
  slug: string;
  count?: number;
  children?: Category[];
}

export interface Manufacturer {
  id: string;
  name: string;
  slug: string;
  count?: number;
}

export interface PriceRange {
  min: number;
  max: number;
}

export interface FilterState {
  categories: string[];
  manufacturers: string[];
  priceRange: PriceRange;
  requiresPrescription?: boolean;
  onSaleOnly?: boolean;
  inStockOnly?: boolean;
}

export const defaultFilters: FilterState = {
  categories: [],
  manufacturers: [],
  priceRange: { min: 0, max: 10000000 },
  requiresPrescription: undefined,
  onSaleOnly: false,
  inStockOnly: true,
};
