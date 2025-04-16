'use client';

import { useState, useEffect } from 'react';
import { TenantService, Tenant } from '@/services/tenant.service';
import { SearchFilter } from '@/components/search-filter';
import { PaginationComponent } from '@/components/ui/pagination';
import { ProductCard } from '@/components/product-card';
import { Container } from '@/components/ui/container';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingBag, Search, Filter, FilterX } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { notFound } from 'next/navigation';

export default function TenantPage({
  params
}: {
  params: { tenant: string }
}) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [productData, setProductData] = useState<{
    products: any[];
    pagination: {
      totalItems: number;
      totalPages: number;
      currentPage: number;
      itemsPerPage: number;
    };
    totalCount: number;
  }>({
    products: [],
    pagination: {
      totalItems: 0,
      totalPages: 0,
      currentPage: 1,
      itemsPerPage: 10
    },
    totalCount: 0
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  
  // Charger les données du tenant et ses produits
  useEffect(() => {
    const loadTenantData = async () => {
      setLoading(true);
      
      try {
        // Charger le tenant
        const tenantData = await TenantService.getTenantByPath(params.tenant);
        setTenant(tenantData);
        
        if (tenantData) {
          // Charger les produits du tenant avec filtres
          const result = await TenantService.getTenantProducts(tenantData.id, {
            search: searchQuery || undefined,
            category: selectedCategory || undefined,
            limit: itemsPerPage,
            page: currentPage
          });
          
          setProductData(result as any);
          
          // Si c'est le premier chargement, extraire les catégories uniques
          if (!searchQuery && !selectedCategory && currentPage === 1) {
            // Extraire les catégories uniques des produits
            const uniqueCategories = Array.from(
              new Set((result as any).products.map((product: any) => product.category))
            ).filter(Boolean) as string[];
            
            setCategories(uniqueCategories);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données du tenant:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTenantData();
  }, [params.tenant, searchQuery, selectedCategory, currentPage]);

  // Gestionnaires
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Réinitialiser à la première page lors d'une nouvelle recherche
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category === "Tous" ? null : category);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setCurrentPage(1);
  };

  // Composant de squelette pour le chargement
  const ProductSkeleton = () => (
    <div className="overflow-hidden bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
      <Skeleton className="aspect-square w-full" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-6 w-1/3 mt-2" />
        <Skeleton className="h-12 w-full mt-2 rounded-full" />
      </div>
    </div>
  );

  // Afficher les squelettes pendant le chargement
  if (loading && !productData.products.length) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-8 w-44" />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Skeleton className="h-12 flex-grow rounded-full" />
            <Skeleton className="h-12 w-32 rounded-full" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {Array(6).fill(0).map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Afficher une page 404 si le tenant n'existe pas
  if (!loading && !tenant) {
    return notFound();
  }

  // Liste de catégories pour le sélecteur
  const categoryOptions = ["Tous", ...(categories || [])];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-7 w-7 text-purple-600" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
              {tenant?.name || "Boutique"}
            </h1>
          </div>
        </div>
      </nav>

      {/* Description du tenant */}
      {tenant?.description && (
        <div className="max-w-3xl mx-auto px-4 py-6">
          <p className="text-gray-600 text-center">{tenant.description}</p>
        </div>
      )}

      {/* Recherche et filtres */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Rechercher un produit..."
                className="pl-12 h-12 text-base rounded-full border-gray-200"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            
            <Select 
              value={selectedCategory || "Tous"} 
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className="w-full md:w-48 h-12 rounded-full border-gray-200">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {(searchQuery || selectedCategory) && (
              <Button
                variant="outline"
                className="h-12 rounded-full border-gray-200 px-4"
                onClick={clearFilters}
              >
                <FilterX className="h-5 w-5 mr-2" />
                Effacer
              </Button>
            )}
          </div>
          
          {/* Nombre de produits */}
          <p className="text-sm text-gray-500">
            {productData.totalCount} produit{productData.totalCount !== 1 ? 's' : ''} trouvé{productData.totalCount !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Liste des produits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {productData.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        {/* Message si aucun produit */}
        {productData.products.length === 0 && !loading && (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center my-8">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-purple-50 mb-6">
              <FilterX className="h-10 w-10 text-purple-500" />
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">Aucun produit trouvé</h3>
            <p className="text-gray-500 mb-6">Essayez d'ajuster vos filtres ou de chercher un autre terme.</p>
            <Button 
              onClick={clearFilters}
              className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8"
            >
              Réinitialiser les filtres
            </Button>
          </div>
        )}
        
        {/* Pagination */}
        {productData.pagination.totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <PaginationComponent 
              totalPages={productData.pagination.totalPages}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* Informations de contact */}
      <div className="mt-16 bg-white py-12 border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Contactez-nous</h2>
          
          {typeof tenant?.contactInfo === 'string' ? (
            (() => {
              try {
                const contactInfo = JSON.parse(tenant.contactInfo);
                return (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      <a href={`mailto:${contactInfo.email}`} className="text-purple-600 hover:underline">{contactInfo.email}</a>
                    </div>
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      <a href={`tel:${contactInfo.phone}`} className="text-purple-600 hover:underline">{contactInfo.phone}</a>
                    </div>
                  </div>
                );
              } catch (e) {
                return (
                  <p className="text-gray-600">Contact: {tenant.contactInfo}</p>
                );
              }
            })()
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <a href={`mailto:${tenant?.contactInfo?.email}`} className="text-purple-600 hover:underline">{tenant?.contactInfo?.email}</a>
              </div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <a href={`tel:${tenant?.contactInfo?.phone}`} className="text-purple-600 hover:underline">{tenant?.contactInfo?.phone}</a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 