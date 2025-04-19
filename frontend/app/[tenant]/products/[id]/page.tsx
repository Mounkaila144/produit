'use client';

import { useState, useEffect } from 'react';
import { TenantService, Tenant } from '@/services/tenant.service';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { notFound } from 'next/navigation';
import Image from 'next/image';

interface ProductPageProps {
  params: {
    tenant: string;
    id: string;
  };
}

interface ProductsResponse {
  products: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    category?: string;
    image?: string;
    inStock?: boolean;
    freeShipping?: boolean;
  }>;
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
  };
  totalCount: number;
}

export default function ProductPage({ params }: ProductPageProps) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Charger les données du tenant et du produit spécifique
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      try {
        // Charger le tenant
        const tenantData = await TenantService.getTenantByPath(params.tenant);
        setTenant(tenantData);
        
        if (tenantData) {
          // Charger les produits du tenant
          const productsData = await TenantService.getTenantProducts(tenantData.id) as ProductsResponse;
          
          // Trouver le produit spécifique par ID
          const foundProduct = productsData.products.find(p => p.id === params.id);
          setProduct(foundProduct || null);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params.tenant, params.id]);

  const handleAddToCart = () => {
    toast({
      title: "Produit ajouté",
      description: `${product?.name} a été ajouté à votre panier.`
    });
  };

  // Afficher un message de chargement
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-xl">Chargement du produit...</p>
      </div>
    );
  }

  // Afficher une page 404 si le produit n'existe pas
  if (!product) {
    return notFound();
  }

  return (
    <div className="product-detail">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image du produit */}
        <div className="rounded-lg overflow-hidden bg-gray-100">
          {product.image ? (
            <Image 
              src={product.image} 
              alt={product.name} 
              width={600}
              height={600}
              className="w-full h-auto object-cover"
            />
          ) : (
            <div className="w-full h-[400px] flex items-center justify-center bg-gray-200">
              <p className="text-gray-500">Image non disponible</p>
            </div>
          )}
        </div>
        
        {/* Détails du produit */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-sm text-gray-500 mb-4">
            Boutique: {tenant?.name}
          </p>
          
          <div className="flex items-center mb-4">
            <span className="text-2xl font-bold">{product.price.toFixed(2)} CFA</span>
            {product.oldPrice && (
              <span className="ml-2 text-lg text-gray-500 line-through">
                {product.oldPrice.toFixed(2)} CFA
              </span>
            )}
          </div>
          
          <p className="mb-6">{product.description}</p>
          
          <Button 
            onClick={handleAddToCart}
            className="w-full mb-4"
          >
            Ajouter au panier
          </Button>
          
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-2">Détails du produit</h2>
            <ul className="list-disc pl-6 space-y-1">
              {product.category && <li>Catégorie: {product.category}</li>}
              <li>En stock: {product.inStock !== false ? 'Oui' : 'Non'}</li>
              <li>Livraison gratuite: {product.freeShipping === true ? 'Oui' : 'Non'}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 