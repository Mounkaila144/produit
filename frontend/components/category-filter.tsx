"use client";

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tag } from 'lucide-react';
import { Category } from '@/lib/types';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  if (!categories || categories.length === 0) return null;

  const handleCategoryClick = (categoryId: string) => {
    if (categoryId === selectedCategory) {
      onSelectCategory(null);
    } else {
      onSelectCategory(categoryId);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center text-sm font-medium text-muted-foreground mb-2">
        <Tag className="mr-2 h-4 w-4" />
        <span>Catégories</span>
      </div>
      
      <ScrollArea className="w-full whitespace-nowrap pb-1">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSelectCategory(null)}
            className="h-8 rounded-full text-xs font-medium"
          >
            Toutes
          </Button>
          
          {categories.map((category) => (
            <Badge
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              className={`px-3 py-1 cursor-pointer hover:bg-primary/10 transition-colors ${
                selectedCategory === category.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background hover:bg-background'
              }`}
              onClick={() => handleCategoryClick(category.id)}
            >
              {category.name}
            </Badge>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}