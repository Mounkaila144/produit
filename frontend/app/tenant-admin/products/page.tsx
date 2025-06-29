'use client';

import useTenant from '@/hooks/useTenant';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import useFetch from '@/hooks/useFetch';
import { productService, categoryService } from '@/services';
import { useState } from 'react';
import { Plus, Search, Filter, Trash2, Edit2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImageUpload } from '@/components/image-upload';
import { Badge } from '@/components/ui/badge';
import { buildImageUrl } from '@/lib/utils';

const productSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  description: z.string().optional(),
  price: z.number().min(0, 'Le prix doit être positif'),
  stock: z.number().min(0, 'Le stock doit être positif'),
  categoryId: z.string().min(1, 'La catégorie est requise'),
  imageUrl: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function ProductsPage() {
  const { tenant } = useTenant();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({
    min: 0,
    max: 1000,
  });

  const { data: products, refetch } = useFetch(
    () => productService.getProducts({
      page,
      limit: 12,
      search,
      categoryId: categoryFilter,
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
    }),
    {
      skip: !tenant,
      dependencies: [page, search, categoryFilter, priceRange],
    }
  );

  const { data: categories } = useFetch(
    () => categoryService.getCategories(),
    { skip: !tenant }
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      categoryId: '',
      imageUrl: '',
    },
  });

  const onSubmit = async (data: ProductFormValues) => {
    setIsLoading(true);
    try {
      await productService.createProduct({
        ...data,
      });

      await refetch();
      reset();
      setIsDialogOpen(false);
      toast({
        title: 'Produit créé',
        description: 'Le produit a été créé avec succès.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la création du produit.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      await productService.deleteProduct(productId);
      await refetch();
      toast({
        title: 'Produit supprimé',
        description: 'Le produit a été supprimé avec succès.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la suppression du produit.',
      });
    }
  };

  const handleImageUpload = (url: string) => {
    setValue('imageUrl', url);
  };

  if (!products || !categories) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Produits</h1>
          <p className="text-muted-foreground">
            Gérez les produits de votre boutique
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau produit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nouveau produit</DialogTitle>
              <DialogDescription>
                Ajoutez un nouveau produit à votre boutique
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom</Label>
                <Input
                  id="name"
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Prix</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    {...register('price', { valueAsNumber: true })}
                  />
                  {errors.price && (
                    <p className="text-sm text-red-500">{errors.price.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    {...register('stock', { valueAsNumber: true })}
                  />
                  {errors.stock && (
                    <p className="text-sm text-red-500">{errors.stock.message}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryId">Catégorie</Label>
                <Select
                  onValueChange={(value) => setValue('categoryId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoryId && (
                  <p className="text-sm text-red-500">{errors.categoryId.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Image</Label>
                <ImageUpload
                  value={register('imageUrl').value}
                  onChange={handleImageUpload}
                  onRemove={() => setValue('imageUrl', '')}
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Création...' : 'Créer'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Recherche</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un produit..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select
                value={categoryFilter}
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes les catégories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Prix minimum</Label>
              <Input
                type="number"
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Prix maximum</Label>
              <Input
                type="number"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des produits */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.items.map((product) => (
          <Card key={product.id}>
            <CardContent className="p-4">
              <div className="relative aspect-square mb-4">
                {product.images && Array.isArray(product.images) && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
                    <span className="text-muted-foreground">Pas d'image</span>
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-background/80 backdrop-blur-sm"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-background/80 backdrop-blur-sm"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <h3 className="font-medium">{product.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {product.description}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-medium">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'CFA',
                  }).format(product.price)}
                </span>
                <Badge variant={product.stock > 0 ? 'default' : 'destructive'}>
                  {product.stock > 0 ? `Stock: ${product.stock}` : 'Rupture de stock'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Affichage de {products.items.length} sur {products.total} produits
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Précédent
          </Button>
          <Button
            variant="outline"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= products.totalPages}
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  );
} 