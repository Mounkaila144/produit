"use client";

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface SearchFilterProps {
  onSearch: (query: string) => void;
  initialValue?: string;
  placeholder?: string;
}

// Simple debounce function
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function SearchFilter({ 
  onSearch, 
  initialValue = '', 
  placeholder = 'Rechercher des produits...' 
}: SearchFilterProps) {
  const [searchValue, setSearchValue] = useState(initialValue);
  const debouncedSearchValue = useDebounce(searchValue, 300);
  
  useEffect(() => {
    onSearch(debouncedSearchValue);
  }, [debouncedSearchValue, onSearch]);
  
  // Gérer la soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchValue);
  };
  
  return (
    <form 
      onSubmit={handleSubmit}
      className="relative w-full"
    >
      <div className="relative flex items-center">
        <Input
          type="text"
          placeholder={placeholder}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full pl-10 pr-4 h-11 rounded-md focus-visible:ring-primary border-input bg-background"
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
          <Search className="h-4 w-4" />
        </div>
        <div className="absolute right-1 top-1/2 transform -translate-y-1/2">
          <Button 
            type="submit" 
            size="sm" 
            variant="ghost" 
            className="h-8 px-3 text-muted-foreground hover:text-foreground"
          >
            Rechercher
          </Button>
        </div>
      </div>
    </form>
  );
}