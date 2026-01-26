'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Check, ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryNode {
  id: string;
  name: string;
  children?: CategoryNode[];
}

interface CategorySelectorProps {
  value?: string;
  onChange: (value: string) => void;
  tree: CategoryNode[];
  placeholder?: string;
  error?: string;
}

interface FlatCategory {
  id: string;
  name: string;
  type: string;
  level: number;
  breadcrumb: string;
}

export const CategorySelector = ({ value, onChange, tree, placeholder = "Chọn danh mục", error }: CategorySelectorProps) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Flatten tree and build breadcrumbs
  const flattenOptions = useMemo(() => {
    const result: FlatCategory[] = [];
    
    const traverse = (nodes: CategoryNode[], parentPath: string[]) => {
      for (const node of nodes) {
        const currentPath = [...parentPath, node.name];
        result.push({
          id: node.id,
          name: node.name,
          type: 'CATEGORY', // Can extend later
          level: parentPath.length,
          breadcrumb: currentPath.join(' > ')
        });
        
        if (node.children?.length) {
          traverse(node.children, currentPath);
        }
      }
    };
    
    traverse(tree, []);
    return result;
  }, [tree]);

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return flattenOptions;
    return flattenOptions.filter(opt => 
      opt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opt.breadcrumb.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [flattenOptions, searchTerm]);

  const selectedOption = flattenOptions.find(opt => opt.id === value);

  return (
    <div className="relative">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            role="combobox" 
            aria-expanded={open}
            className={cn(
                "w-full justify-between font-normal text-left",
                !value && "text-muted-foreground",
                error && "border-red-500"
            )}
          >
            {selectedOption ? (
                <span className="truncate">{selectedOption.breadcrumb}</span>
            ) : (
                <span className="truncate">{placeholder}</span>
            )}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] p-0" align="start">
            <div className="p-2 border-b sticky top-0 bg-popover z-10">
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Tìm danh mục..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 h-9"
                    />
                </div>
            </div>
            <div className="max-h-60 overflow-y-auto p-1">
                {filteredOptions.length === 0 ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                        Không tìm thấy danh mục
                    </div>
                ) : (
                    filteredOptions.map((option) => (
                        <div 
                            key={option.id}
                            className={cn(
                                "relative flex select-none items-center rounded-sm px-2 py-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 cursor-pointer",
                                value === option.id && "bg-accent text-accent-foreground"
                            )}
                            onClick={() => {
                                onChange(option.id);
                                setOpen(false);
                            }}
                        >
                            <div className="flex flex-col gap-0.5">
                                <span className={cn("font-medium", value === option.id && "text-primary")}>
                                  {option.name}
                                </span>
                                {option.breadcrumb !== option.name && (
                                  <span className="text-xs text-muted-foreground truncate" title={option.breadcrumb}>
                                    {option.breadcrumb}
                                  </span>
                                )}
                            </div>
                            {value === option.id && (
                                <Check className="ml-auto h-4 w-4 text-primary" />
                            )}
                        </div>
                    ))
                )}
            </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
