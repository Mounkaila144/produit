'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Loader2, 
  ImagePlus, 
  Save, 
  ArrowLeft, 
  X,
  AlertTriangle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import productService from '@/services/products';
import categoryService, { Category } from '@/services/categories';
import ImageUpload from '@/components/ImageUpload';
import { useSession } from 'next-auth/react';
import useEffectiveTenantId from '@/hooks/useEffectiveTenantId';
import uploadService from '@/services/upload';

// Définition du schéma de validation du formulaire
const productFormSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  description: z.string().min(1, 'La description est requise'),
  price: z.coerce.number().min(0, 'Le prix doit être supérieur ou égal à 0'),
  stock: z.coerce.number().int().min(0, 'Le stock doit être un nombre entier positif'),
  categoryId: z.string().min(1, 'La catégorie est requise'),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  images: z.array(z.string()).optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const productId = params.id;
  const { data: session } = useSession();
  const effectiveTenantId = useEffectiveTenantId();
  const [tempImageFiles, setTempImageFiles] = useState<File[]>([]);

  // Initialisation du formulaire avec les valeurs par défaut
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      categoryId: '',
      isActive: true,
      isFeatured: false,
      images: [],
    },
  });

  // Charger les données du produit et les catégories depuis l'API
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingProduct(true);
      setIsLoadingCategories(true);
      setError(null);
      
      try {
        // Charger les catégories et le produit en parallèle
        const [categoriesResponse, productResponse] = await Promise.all([
          categoryService.getCategories(),
          productService.getProduct(productId)
        ]);
        
        setCategories(categoriesResponse.data);
        
        // Remplir le formulaire avec les données du produit
        const product = productResponse.data;
        form.reset({
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          categoryId: product.categoryId,
          isActive: product.isActive,
          isFeatured: product.isFeatured,
          images: Array.isArray(product.images) ? product.images : [],
        });
        
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setError('Impossible de charger le produit ou les catégories. Veuillez réessayer.');
      } finally {
        setIsLoadingProduct(false);
        setIsLoadingCategories(false);
      }
    };

    loadData();
  }, [productId, form]);

  // Soumettre le formulaire
  const onSubmit = async (data: ProductFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      // S'assurer que les images sont un tableau
      data.images = data.images && Array.isArray(data.images) ? data.images : [];
      
      // Si nous avons des images temporaires à uploader
      if (tempImageFiles.length > 0) {
        console.log("Upload des images temporaires:", tempImageFiles.length);
        
        // Récupérer le tenant ID effectif
        const effectiveTenantId = session?.user?.tenantId || 
          (typeof window !== 'undefined' ? localStorage.getItem('tenantId') || localStorage.getItem('adminTenantId') : null);
        
        if (!effectiveTenantId) {
          throw new Error("Tenant ID non trouvé pour l'upload des images.");
        }
        
        try {
          // Filtrer les URLs temporaires (celles qui commencent par "blob:")
          const persistedImages = data.images.filter(url => !url.startsWith('blob:'));
          
          // Uploader toutes les images temporaires
          const uploadPromises = tempImageFiles.map(file => 
            uploadService.uploadSingleFile(file, effectiveTenantId as string)
          );
          
          const uploadResults = await Promise.all(uploadPromises);
          const uploadedUrls = uploadResults.map(result => result.file.url);
          
          console.log("Images uploadées avec succès:", uploadedUrls);
          
          // Mettre à jour les images avec les URLs réelles des fichiers uploadés
          data.images = [...persistedImages, ...uploadedUrls];
          
          console.log("Images finales pour le produit:", data.images);
        } catch (uploadError) {
          console.error("Erreur lors de l'upload des images:", uploadError);
          throw new Error(`Erreur lors de l'upload des images: ${uploadError.message}`);
        }
      }
      
      // Envoyer les données avec les images mises à jour
      const result = await productService.updateProduct(params.id, data);
      toast({
        title: 'Succès',
        description: 'Le produit a été mis à jour avec succès!'
      });
      router.push('/admin/products');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      setError('Impossible de mettre à jour le produit. Veuillez vérifier les informations.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingProduct) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Chargement du produit...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => router.push('/admin/products')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Modifier le produit</h1>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Informations générales */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Informations générales</h2>
                  <Separator />
                  
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom du produit</FormLabel>
                        <FormControl>
                          <Input placeholder="Entrez le nom du produit" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Décrivez le produit"
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Catégorie</FormLabel>
                        <Select
                          disabled={isLoadingCategories}
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez une catégorie" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Prix et stock */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Prix et stock</h2>
                  <Separator />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prix (€)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Options et visibilité */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Options et visibilité</h2>
                  <Separator />

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Actif</FormLabel>
                          <FormDescription>
                            Afficher ce produit sur le site
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isFeatured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Mis en avant</FormLabel>
                          <FormDescription>
                            Mettre en avant ce produit sur la page d'accueil
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="images"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Images du produit</FormLabel>
                        <FormControl>
                          <ImageUpload
                            value={field.value || []}
                            onChange={(urls, files) => {
                              field.onChange(urls);
                              if (files) setTempImageFiles(files);
                            }}
                            maxImages={5}
                            tenantId={effectiveTenantId || undefined}
                            instantUpload={false}
                            tempFiles={tempImageFiles}
                          />
                        </FormControl>
                        <FormDescription>
                          Ajoutez jusqu'à 5 images pour ce produit. Les images seront uploadées lors de l'enregistrement.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/products')}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mise à jour en cours...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer les modifications
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 