'use client';

import React, { useState, useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Search, X, Filter, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
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

const defaultFilters: FilterState = {
  categories: [],
  manufacturers: [],
  priceRange: { min: 0, max: 10000000 },
  requiresPrescription: undefined,
  onSaleOnly: false,
  inStockOnly: true,
};

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
  // State
  const [filters, setFilters] = useState<FilterState>({
    ...defaultFilters,
    ...initialFilters,
    priceRange: { min: 0, max: maxPrice },
  });
  const [searchCategory, setSearchCategory] = useState('');
  const [searchManufacturer, setSearchManufacturer] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Filtered lists based on search
  const filteredCategories = useMemo(() => {
    if (!searchCategory.trim()) return categories;
    const search = searchCategory.toLowerCase();
    
    const filterTree = (cats: Category[]): Category[] => {
      return cats.reduce<Category[]>((acc, cat) => {
        const matchesSearch = cat.name.toLowerCase().includes(search);
        const filteredChildren = cat.children ? filterTree(cat.children) : [];
        
        if (matchesSearch || filteredChildren.length > 0) {
          acc.push({
            ...cat,
            children: filteredChildren.length > 0 ? filteredChildren : cat.children,
          });
        }
        return acc;
      }, []);
    };
    
    return filterTree(categories);
  }, [categories, searchCategory]);

  const filteredManufacturers = useMemo(() => {
    if (!searchManufacturer.trim()) return manufacturers;
    const search = searchManufacturer.toLowerCase();
    return manufacturers.filter((m) =>
      m.name.toLowerCase().includes(search)
    );
  }, [manufacturers, searchManufacturer]);

  // Handlers
  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    if (!showApplyButton) {
      onFilterChange?.(updated);
    }
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

  const toggleExpandCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handlePriceChange = (value: number[]) => {
    updateFilters({
      priceRange: { min: value[0], max: value[1] },
    });
  };

  const resetFilters = () => {
    const reset = {
      ...defaultFilters,
      priceRange: { min: 0, max: maxPrice },
    };
    setFilters(reset);
    onFilterChange?.(reset);
  };

  const applyFilters = () => {
    onApplyFilters?.(filters);
  };

  // Format price
  const formatPrice = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}tr`;
    }
    return `${(value / 1000).toFixed(0)}k`;
  };

  // Active filters count
  const activeFiltersCount =
    filters.categories.length +
    filters.manufacturers.length +
    (filters.onSaleOnly ? 1 : 0) +
    (filters.requiresPrescription !== undefined ? 1 : 0);

  // Render category tree
  const renderCategory = (category: Category, level = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const isChecked = filters.categories.includes(category.id);

    return (
      <div key={category.id} className={cn('space-y-1', level > 0 && 'ml-4')}>
        <div className="flex items-center gap-2 py-1">
          {hasChildren && (
            <button
              onClick={() => toggleExpandCategory(category.id)}
              className="p-0.5 hover:bg-gray-100 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-5" />}
          
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Checkbox
              id={`cat-${category.id}`}
              checked={isChecked}
              onCheckedChange={() => toggleCategory(category.id)}
            />
            <Label
              htmlFor={`cat-${category.id}`}
              className="text-sm font-normal cursor-pointer truncate flex-1"
            >
              {category.name}
            </Label>
            {category.count !== undefined && (
              <span className="text-xs text-gray-400">({category.count})</span>
            )}
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="border-l border-gray-200 ml-2">
            {category.children!.map((child) => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className={cn('bg-white rounded-lg border p-4 space-y-6', className)}>
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
            className="text-gray-500 hover:text-gray-700"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Đặt lại
          </Button>
        )}
      </div>

      {/* Categories */}
      <Collapsible defaultOpen className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 border-b">
          <h3 className="font-medium text-sm text-gray-900">Danh mục</h3>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2">
          {/* Category search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm danh mục..."
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
            {searchCategory && (
              <button
                onClick={() => setSearchCategory('')}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          {/* Category list */}
          <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
            {filteredCategories.map((category) => renderCategory(category))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Price Range */}
      <Collapsible defaultOpen className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 border-b">
          <h3 className="font-medium text-sm text-gray-900">Khoảng giá</h3>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 px-1">
          <Slider
            value={[filters.priceRange.min, filters.priceRange.max]}
            onValueChange={handlePriceChange}
            min={0}
            max={maxPrice}
            step={10000}
            className="mb-4"
          />
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {formatPrice(filters.priceRange.min)}
            </span>
            <span className="text-gray-600">
              {formatPrice(filters.priceRange.max)}
            </span>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Manufacturers */}
      <Collapsible defaultOpen className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 border-b">
          <h3 className="font-medium text-sm text-gray-900">Thương hiệu</h3>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2">
          {/* Manufacturer search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm thương hiệu..."
              value={searchManufacturer}
              onChange={(e) => setSearchManufacturer(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>

          {/* Manufacturer list */}
          <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
            {filteredManufacturers.map((manufacturer) => (
              <div key={manufacturer.id} className="flex items-center gap-2 py-1">
                <Checkbox
                  id={`mfr-${manufacturer.id}`}
                  checked={filters.manufacturers.includes(manufacturer.id)}
                  onCheckedChange={() => toggleManufacturer(manufacturer.id)}
                />
                <Label
                  htmlFor={`mfr-${manufacturer.id}`}
                  className="text-sm font-normal cursor-pointer truncate flex-1"
                >
                  {manufacturer.name}
                </Label>
                {manufacturer.count !== undefined && (
                  <span className="text-xs text-gray-400">({manufacturer.count})</span>
                )}
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Other filters */}
      <Collapsible defaultOpen className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 border-b">
          <h3 className="font-medium text-sm text-gray-900">Khác</h3>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-2">
          {/* On sale only */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="on-sale"
              checked={filters.onSaleOnly}
              onCheckedChange={(checked) =>
                updateFilters({ onSaleOnly: checked === true })
              }
            />
            <Label htmlFor="on-sale" className="text-sm font-normal cursor-pointer">
              Đang giảm giá
            </Label>
          </div>

          {/* In stock only */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="in-stock"
              checked={filters.inStockOnly}
              onCheckedChange={(checked) =>
                updateFilters({ inStockOnly: checked === true })
              }
            />
            <Label htmlFor="in-stock" className="text-sm font-normal cursor-pointer">
              Còn hàng
            </Label>
          </div>

          {/* Prescription */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="prescription"
              checked={filters.requiresPrescription === false}
              onCheckedChange={(checked) =>
                updateFilters({
                  requiresPrescription: checked ? false : undefined,
                })
              }
            />
            <Label htmlFor="prescription" className="text-sm font-normal cursor-pointer">
              Không cần kê đơn
            </Label>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Apply button */}
      {showApplyButton && (
        <Button onClick={applyFilters} className="w-full">
          Áp dụng bộ lọc
        </Button>
      )}
    </aside>
  );
}

export default CategorySidebar;
