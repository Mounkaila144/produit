'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Loader2, 
  ImagePlus, 
  Save, 
  ArrowLeft, 
  X 
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
import ImageUpload from '@/components/ImageUpload';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import productService from '@/services/products';
import categoryService, { Category } from '@/services/categories';
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

export default function CreateProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
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

  // Charger les catégories depuis l'API
  useEffect(() => {
    const loadCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const response = await categoryService.getCategories();
        setCategories(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
        setError('Impossible de charger les catégories. Veuillez réessayer.');
      } finally {
        setIsLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  // Soumettre le formulaire
  const onSubmit = async (data: ProductFormValues) => {
    setIsLoading(true);
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
      console.log("Données envoyées au backend:", JSON.stringify(data, null, 2));
      const result = await productService.createProduct(data);
      console.log("Réponse du backend:", JSON.stringify(result, null, 2));
      toast({
        title: 'Succès',
        description: 'Le produit a été créé avec succès!',
      });
      router.push('/admin/products');
    } catch (error) {
      console.error('Erreur lors de la création du produit:', error);
      setError('Impossible de créer le produit. Veuillez vérifier les informations et réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold tracking-tight">Créer un nouveau produit</h1>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
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
                          defaultValue={field.value}
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
                  Création en cours...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Créer le produit
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 