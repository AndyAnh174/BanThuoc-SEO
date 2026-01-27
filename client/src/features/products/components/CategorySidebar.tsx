'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Filter, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

// Import filter sub-components
import { CategoryFilter } from './filters/CategoryFilter';
import { ManufacturerFilter } from './filters/ManufacturerFilter';
import { PriceFilter } from './filters/PriceFilter';
import { OtherFilters } from './filters/OtherFilters';
import {
  type Category,
  type Manufacturer,
  type FilterState,
  defaultFilters,
} from './filters/filter.types';

// Re-export types for external use
export type { Category, Manufacturer, FilterState, PriceRange } from './filters/filter.types';

export interface CategorySidebarProps {
  categories: Category[];
  manufacturers: Manufacturer[];
  initialFilters?: Partial<FilterState>;
  maxPrice?: number;
  onFilterChange?: (filters: FilterState) => void;
  onApplyFilters?: (filters: FilterState) => void;
  showApplyButton?: boolean;
  className?: string;
}

export function CategorySidebar({
  categories,
  manufacturers,
  initialFilters,
  maxPrice = 10000000,
  onFilterChange,
  onApplyFilters,
  showApplyButton = false,
  className,
}: CategorySidebarProps) {
  const [filters, setFilters] = useState<FilterState>({
    ...defaultFilters,
    ...initialFilters,
    priceRange: { min: 0, max: maxPrice },
  });

  // Update filters helper
  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    if (!showApplyButton) {
      onFilterChange?.(updated);
    }
  };

  // Toggle category selection
  const toggleCategory = (categoryId: string) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter((c) => c !== categoryId)
      : [...filters.categories, categoryId];
    updateFilters({ categories: newCategories });
  };

  // Toggle manufacturer selection
  const toggleManufacturer = (manufacturerId: string) => {
    const newManufacturers = filters.manufacturers.includes(manufacturerId)
      ? filters.manufacturers.filter((m) => m !== manufacturerId)
      : [...filters.manufacturers, manufacturerId];
    updateFilters({ manufacturers: newManufacturers });
  };

  // Reset all filters
  const resetFilters = () => {
    const reset = { ...defaultFilters, priceRange: { min: 0, max: maxPrice } };
    setFilters(reset);
    onFilterChange?.(reset);
  };

  // Apply filters (for showApplyButton mode)
  const applyFilters = () => {
    onApplyFilters?.(filters);
  };

  // Count active filters
  const activeFiltersCount =
    filters.categories.length +
    filters.manufacturers.length +
    (filters.onSaleOnly ? 1 : 0) +
    (filters.requiresPrescription !== undefined ? 1 : 0);

  return (
    <Card className={cn('p-4 space-y-6 h-fit', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-gray-900">Bộ lọc</h2>
          {activeFiltersCount > 0 && (
            <span className="px-2 py-0.5 bg-primary text-white text-xs rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-gray-500 hover:text-gray-700 h-8 px-2"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Đặt lại
          </Button>
        )}
      </div>

      {/* Category Filter */}
      <CategoryFilter
        categories={categories}
        selectedCategories={filters.categories}
        onToggleCategory={toggleCategory}
      />

      {/* Price Filter */}
      <PriceFilter
        priceRange={filters.priceRange}
        maxPrice={maxPrice}
        onPriceChange={(priceRange) => updateFilters({ priceRange })}
      />

      {/* Manufacturer Filter */}
      <ManufacturerFilter
        manufacturers={manufacturers}
        selectedManufacturers={filters.manufacturers}
        onToggleManufacturer={toggleManufacturer}
      />

      {/* Other Filters */}
      <OtherFilters
        onSaleOnly={filters.onSaleOnly || false}
        inStockOnly={filters.inStockOnly || true}
        requiresPrescription={filters.requiresPrescription}
        onSaleOnlyChange={(checked) => updateFilters({ onSaleOnly: checked })}
        onInStockOnlyChange={(checked) => updateFilters({ inStockOnly: checked })}
        onPrescriptionChange={(value) => updateFilters({ requiresPrescription: value })}
      />

      {/* Apply Button */}
      {showApplyButton && (
        <Button onClick={applyFilters} className="w-full">
          Áp dụng bộ lọc
        </Button>
      )}
    </Card>
  );
}

export default CategorySidebar;
