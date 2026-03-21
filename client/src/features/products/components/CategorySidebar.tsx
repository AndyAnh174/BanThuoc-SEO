'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Filter, RotateCcw, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  maxPrice = 1000000,
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

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    if (!showApplyButton) onFilterChange?.(updated);
  };

  const toggleCategory = (categoryId: string) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter((c) => c !== categoryId)
      : [...filters.categories, categoryId];
    updateFilters({ categories: newCategories });
  };

  const toggleManufacturer = (manufacturerId: string) => {
    const newManufacturers = filters.manufacturers.includes(manufacturerId)
      ? filters.manufacturers.filter((m) => m !== manufacturerId)
      : [...filters.manufacturers, manufacturerId];
    updateFilters({ manufacturers: newManufacturers });
  };

  const resetFilters = () => {
    const reset = { ...defaultFilters, priceRange: { min: 0, max: maxPrice } };
    setFilters(reset);
    onFilterChange?.(reset);
  };

  const applyFilters = () => onApplyFilters?.(filters);

  const activeFiltersCount =
    filters.categories.length +
    filters.manufacturers.length +
    (filters.onSaleOnly ? 1 : 0) +
    (filters.requiresPrescription !== undefined ? 1 : 0);

  return (
    <div className={cn('sticky top-4 rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white', className)}>
      {/* Gradient header */}
      <div className="bg-gradient-to-br from-green-600 to-green-500 px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Filter className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-white text-base leading-tight">Bộ lọc</h2>
              {activeFiltersCount > 0 && (
                <p className="text-green-100 text-xs">{activeFiltersCount} đang áp dụng</p>
              )}
            </div>
          </div>
          {activeFiltersCount > 0 && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white text-xs font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              Đặt lại
            </button>
          )}
        </div>
      </div>

      {/* Filter sections */}
      <div className="divide-y divide-gray-100">
        {/* Category */}
        <div className="px-5 py-4">
          <CategoryFilter
            categories={categories}
            selectedCategories={filters.categories}
            onToggleCategory={toggleCategory}
          />
        </div>

        {/* Price */}
        <div className="px-5 py-4">
          <PriceFilter
            priceRange={filters.priceRange}
            maxPrice={maxPrice}
            onPriceChange={(priceRange) => updateFilters({ priceRange })}
          />
        </div>

        {/* Manufacturer */}
        <div className="px-5 py-4">
          <ManufacturerFilter
            manufacturers={manufacturers}
            selectedManufacturers={filters.manufacturers}
            onToggleManufacturer={toggleManufacturer}
          />
        </div>

        {/* Other filters */}
        <div className="px-5 py-4">
          <OtherFilters
            onSaleOnly={filters.onSaleOnly || false}
            inStockOnly={filters.inStockOnly || true}
            requiresPrescription={filters.requiresPrescription}
            onSaleOnlyChange={(checked) => updateFilters({ onSaleOnly: checked })}
            onInStockOnlyChange={(checked) => updateFilters({ inStockOnly: checked })}
            onPrescriptionChange={(value) => updateFilters({ requiresPrescription: value })}
          />
        </div>
      </div>

      {/* Apply button */}
      {showApplyButton && (
        <div className="px-5 pb-5">
          <Button
            onClick={applyFilters}
            className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl h-10 font-semibold"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Áp dụng bộ lọc
          </Button>
        </div>
      )}
    </div>
  );
}

export default CategorySidebar;
