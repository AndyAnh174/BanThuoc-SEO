'use client';

import React, { useState, useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ChevronDown, ChevronRight, Search, X } from 'lucide-react';
import { Category } from './filter.types';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategories: string[];
  onToggleCategory: (categoryId: string) => void;
}

export function CategoryFilter({
  categories,
  selectedCategories,
  onToggleCategory,
}: CategoryFilterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;
    const search = searchTerm.toLowerCase();

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
  }, [categories, searchTerm]);

  const toggleExpand = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const renderCategory = (category: Category, level = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const isChecked = selectedCategories.includes(category.id);

    return (
      <div key={category.id} className={level > 0 ? 'ml-4' : ''}>
        <div className="flex items-center gap-2 py-1">
          {hasChildren && (
            <button
              onClick={() => toggleExpand(category.id)}
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
              onCheckedChange={() => onToggleCategory(category.id)}
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
    <div className="space-y-2">
      <div className="flex items-center justify-between w-full py-2 border-b">
        <h3 className="font-medium text-sm text-gray-900">Danh mục</h3>
      </div>
      <div className="space-y-2">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Tìm danh mục..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
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
      </div>
    </div>
  );
}

export default CategoryFilter;
