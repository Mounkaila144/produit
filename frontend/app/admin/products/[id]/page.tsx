'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Pencil,
  Tag,
  PackageCheck,
  ImageIcon,
  ClipboardList,
  Loader2,
  CheckCircle2,
  XCircle,
  CalendarIcon,
  DollarSignIcon,
  ShoppingCartIcon
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

import { formatCurrency, formatDate } from '@/lib/utils';
import productService, { Product } from '@/services/products';
import categoryService, { Category } from '@/services/categories';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const productId = params.id;

  useEffect(() => {
    const loadProduct = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await productService.getProduct(productId);
        setProduct(response.data);

        // Charger la catégorie du produit
        try {
          const categoryResponse = await categoryService.getCategory(response.data.categoryId);
          setCategory(categoryResponse.data);
        } catch (error) {
          console.error('Erreur lors du chargement de la catégorie:', error);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du produit:', error);
        setError('Impossible de charger les détails du produit. Veuillez réessayer plus tard.');
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Chargement des détails du produit...</span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>
          {error || "Produit non trouvé. Veuillez vérifier l'identifiant et réessayer."}
        </AlertDescription>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => router.push('/admin/products')}
        >
          Retour à la liste des produits
        </Button>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push('/admin/products')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
          {product.isFeatured && (
            <Badge variant="secondary" className="ml-2">
              <Tag className="h-3 w-3 mr-1" />
              Mis en avant
            </Badge>
          )}
          <Badge
            variant={product.isActive ? 'success' : 'destructive'}
          >
            {product.isActive ? (
              <><CheckCircle2 className="h-3.5 w-3.5 mr-1" />Actif</>
            ) : (
              <><XCircle className="h-3.5 w-3.5 mr-1" />Inactif</>
            )}
          </Badge>
        </div>
        <Button
          onClick={() => router.push(`/admin/products/${product.id}/edit`)}
        >
          <Pencil className="mr-2 h-4 w-4" />
          Modifier le produit
        </Button>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList>
          <TabsTrigger value="details">
            <ClipboardList className="h-4 w-4 mr-2" />
            Détails
          </TabsTrigger>
          <TabsTrigger value="images">
            <ImageIcon className="h-4 w-4 mr-2" />
            Images
          </TabsTrigger>
          <TabsTrigger value="inventory">
            <PackageCheck className="h-4 w-4 mr-2" />
            Inventaire
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations générales</CardTitle>
                <CardDescription>Détails de base du produit</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">ID</h3>
                  <p className="text-base font-medium">{product.id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Nom</h3>
                  <p className="text-base font-medium">{product.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Catégorie</h3>
                  <p className="text-base font-medium">{category?.name || 'Catégorie inconnue'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Description</h3>
                  <p className="text-base">{product.description}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Mis en avant</h3>
                  <p className="text-base font-medium">{product.isFeatured ? 'Oui' : 'Non'}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dates et prix</CardTitle>
                <CardDescription>Informations temporelles et tarifaires</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <DollarSignIcon className="h-5 w-5 text-gray-500 mr-2" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Prix</h3>
                    <p className="text-xl font-bold text-primary">{formatCurrency(product.price)}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 text-gray-500 mr-2" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Créé le</h3>
                    <p className="text-base">{formatDate(product.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 text-gray-500 mr-2" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Dernière mise à jour</h3>
                    <p className="text-base">{formatDate(product.updatedAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="images" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Images du produit</CardTitle>
              <CardDescription>Galerie d'images pour ce produit</CardDescription>
            </CardHeader>
            <CardContent>
              {product.images && Array.isArray(product.images) && product.images.length > 0 ? (
                <Carousel className="w-full max-w-xl mx-auto">
                  <CarouselContent>
                    {product.images.map((image, index) => (
                      <CarouselItem key={index}>
                        <div className="p-1">
                          <Card>
                            <CardContent className="flex items-center justify-center p-6 h-[300px]">
                              <img
                                src={image}
                                alt={`${product.name} - Image ${index + 1}`}
                                className="max-h-full max-w-full object-contain"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Image+non+disponible';
                                }}
                              />
                            </CardContent>
                          </Card>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              ) : (
                <div className="text-center py-8">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">Aucune image</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Ce produit n'a pas d'images. Vous pouvez en ajouter en modifiant le produit.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Inventaire</CardTitle>
              <CardDescription>Informations sur le stock du produit</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <ShoppingCartIcon className="h-10 w-10 text-primary p-2 bg-primary/10 rounded-full mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Stock actuel</p>
                        <h3 className="text-3xl font-bold">
                          {product.stock}
                          <span className="text-sm font-normal text-gray-500 ml-1">unités</span>
                        </h3>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <div className={`h-10 w-10 rounded-full mr-3 flex items-center justify-center
                        ${product.stock > 10 ? 'bg-green-100 text-green-600' : 
                          product.stock > 0 ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}`}
                      >
                        {product.stock > 10 ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : product.stock > 0 ? (
                          <ShoppingCartIcon className="h-5 w-5" />
                        ) : (
                          <XCircle className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Statut</p>
                        <h3 className="text-xl font-bold">
                          {product.stock > 10 ? 'En stock' : 
                           product.stock > 0 ? 'Stock faible' : 'Rupture de stock'}
                        </h3>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <DollarSignIcon className="h-10 w-10 text-primary p-2 bg-primary/10 rounded-full mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Valeur du stock</p>
                        <h3 className="text-3xl font-bold">
                          {formatCurrency(product.price * product.stock)}
                        </h3>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-primary/5 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Gestion de l'inventaire</h4>
                <p>Pour ajuster les niveaux de stock, veuillez utiliser le formulaire d'édition du produit.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => router.push(`/admin/products/${product.id}/edit`)}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Gérer le stock
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 