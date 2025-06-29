'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  PlusCircle,
  Pencil,
  Trash2,
  ArrowUpDown,
  Search,
  Loader2,
  FilterX,
  EyeIcon,
  Tag,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import productService, { Product } from '@/services/products';
import categoryService, { Category } from '@/services/categories';
import { formatCurrency, formatDate, buildImageUrl } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

// Interface pour les données de pagination
interface PaginationData {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
}

// Interface pour la réponse de l'API des produits
interface ExtendedProductsResponse {
  data: Product[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  pagination?: PaginationData;
}

export default function ProductsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    categoryId: '',
    minPrice: '',
    maxPrice: '',
    status: ''
  });
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const itemsPerPage = 20;

  // Fonction pour charger les produits
  const loadData = async (page = currentPage) => {
    setIsLoading(true);
    setError(null);
    try {
      // Construire les paramètres de requête
      const params: any = { page, limit: itemsPerPage };
      if (currentSearchTerm) params.search = currentSearchTerm;
      if (filters.categoryId) params.categoryId = filters.categoryId;
      if (filters.minPrice) params.minPrice = Number(filters.minPrice);
      if (filters.maxPrice) params.maxPrice = Number(filters.maxPrice);
      if (filters.status === 'active') params.isActive = true;
      if (filters.status === 'inactive') params.isActive = false;

      console.log("Chargement des produits avec paramètres:", params);

      // Utiliser un appel direct à l'API pour débogage
      const paramsString = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        paramsString.append(key, String(value));
      });
      
      // Appel API direct pour vérifier la réponse brute
      const debugResponse = await fetch(`/api/products?${paramsString.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          'X-Debug': 'true',
          'x-tenant-id': user?.tenantId || localStorage.getItem('tenantId') || ''
        }
      });
      
      const debugData = await debugResponse.json();
      console.log("Réponse API directe:", debugData);

      // Charger les produits et les catégories en parallèle
      const [productsResponse, categoriesResponse] = await Promise.all([
        productService.getProducts(params) as unknown as ExtendedProductsResponse,
        categoryService.getCategories()
      ]);

      console.log("Réponse du service productService:", productsResponse);

      // Enregistrer les propriétés essentielles pour le débogage
      console.log("Propriétés reçues:", {
        data: Array.isArray(productsResponse.data) ? productsResponse.data.length : typeof productsResponse.data,
        total: productsResponse.total,
        page: productsResponse.page,
        limit: productsResponse.limit,
        totalPages: productsResponse.totalPages
      });

      // Extraire les données de pagination correctement
      setProducts(productsResponse.data);
      setCategories(categoriesResponse.data);
      
      // DEBUG: Analyser les images des produits
      console.log("🖼️ DEBUGGING IMAGES - Analyse des produits reçus:");
      productsResponse.data.forEach((product, index) => {
        console.log(`📦 Produit ${index + 1}: ${product.name}`);
        console.log(`  - ID: ${product.id}`);
        console.log(`  - Images (brut):`, product.images);
        console.log(`  - Type de images:`, typeof product.images);
        console.log(`  - Est un array:`, Array.isArray(product.images));
        console.log(`  - Longueur:`, Array.isArray(product.images) ? product.images.length : 'N/A');
        
        if (Array.isArray(product.images) && product.images.length > 0) {
          console.log(`  - Première image:`, product.images[0]);
          console.log(`  - Type première image:`, typeof product.images[0]);
          console.log(`  - URL construite:`, product.images[0]);
        } else {
          console.log(`  - ❌ Aucune image valide trouvée pour ${product.name}`);
        }
        console.log('---');
      });
      
      // Récupérer les valeurs de pagination depuis le format de réponse du backend
      const total = productsResponse.total || (productsResponse.pagination?.totalItems || 0);
      const currentPg = productsResponse.page || (productsResponse.pagination?.currentPage || page);
      const totalPgs = productsResponse.totalPages || (productsResponse.pagination?.totalPages || 1);
      
      setTotalCount(total);
      setLoadedCount(productsResponse.data.length);
      setCurrentPage(currentPg);
      setTotalPages(totalPgs);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setError('Impossible de charger les produits. Veuillez réessayer plus tard.');
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les données au premier rendu et quand les filtres changent
  useEffect(() => {
    loadData(1); // Toujours revenir à la première page quand les filtres changent
  }, [currentSearchTerm, filters]);

  // DEBUG: Test de la fonction buildImageUrl
  useEffect(() => {
    console.log("🧪 TEST buildImageUrl:");
    console.log("  - Image simple:", buildImageUrl("compressed_test.jpeg", "5d58f416-8beb-4db4-9dbb-d4596e901c11"));
    console.log("  - URL complète:", buildImageUrl("https://example.com/image.jpg"));
    console.log("  - Placeholder:", buildImageUrl("https://placehold.co/100x100?text=Test"));
    console.log("  - Vide:", buildImageUrl(""));
    console.log("  - Chemin /uploads:", buildImageUrl("/uploads/tenant/image.jpg"));
  }, []);

  // Gérer la recherche
  const handleSearch = () => {
    setCurrentSearchTerm(searchTerm);
  };

  // Gérer la touche Enter pour la recherche
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Pagination - page précédente
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      loadData(currentPage - 1);
    }
  };

  // Pagination - page suivante
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      loadData(currentPage + 1);
    }
  };

  // Supprimer un produit
  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;

    setIsProcessing(true);
    try {
      // Appeler l'API pour supprimer le produit
      await productService.deleteProduct(selectedProduct.id);
      
      // Supprimer le produit de l'état local
      setProducts(prevProducts => 
        prevProducts.filter(product => product.id !== selectedProduct.id)
      );
      
      setIsDeleteDialogOpen(false);
      
      toast({
        title: 'Succès',
        description: `Le produit "${selectedProduct.name}" a été supprimé.`
      });
    } catch (error) {
      console.error('Erreur lors de la suppression du produit:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de supprimer le produit. Veuillez réessayer.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Changer le statut d'un produit (activer/désactiver)
  const handleToggleStatus = async (product: Product) => {
    try {
      let response;
      if (product.isActive) {
        response = await productService.deactivateProduct(product.id);
        toast({
          title: 'Succès',
          description: `Le produit "${product.name}" a été désactivé.`
        });
      } else {
        response = await productService.activateProduct(product.id);
        toast({
          title: 'Succès',
          description: `Le produit "${product.name}" a été activé.`
        });
      }
      
      // Mettre à jour le produit dans l'état local
      setProducts(prevProducts => 
        prevProducts.map(p => p.id === product.id ? response.data : p)
      );
    } catch (error) {
      console.error('Erreur lors du changement de statut du produit:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de modifier le statut du produit.'
      });
    }
  };

  // Réinitialiser tous les filtres
  const resetFilters = () => {
    setFilters({
      categoryId: '',
      minPrice: '',
      maxPrice: '',
      status: ''
    });
    setSearchTerm('');
  };

  // Obtenir le nom de la catégorie à partir de son ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : '-';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Gestion des produits</h1>
        <Button onClick={() => router.push('/admin/products/create')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Ajouter un produit
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex items-center flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Rechercher des produits..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10 max-w-md"
          />
          <Button 
            variant="outline" 
            className="ml-2" 
            onClick={handleSearch}
            disabled={isLoading}
          >
            Rechercher
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsFilterVisible(!isFilterVisible)}>
            {isFilterVisible ? 'Masquer les filtres' : 'Afficher les filtres'}
          </Button>
          {(filters.categoryId || filters.minPrice || filters.maxPrice || filters.status) && (
            <Button variant="ghost" onClick={resetFilters}>
              <FilterX className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
          )}
        </div>
      </div>

      {isFilterVisible && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="category-filter">Catégorie</Label>
                <Select 
                  value={filters.categoryId} 
                  onValueChange={(value) => setFilters({...filters, categoryId: value})}
                >
                  <SelectTrigger id="category-filter">
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
              <div>
                <Label htmlFor="min-price">Prix min (CFA)</Label>
                <Input
                  id="min-price"
                  type="number"
                  placeholder="Prix minimum"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                  min={0}
                />
              </div>
              <div>
                <Label htmlFor="max-price">Prix max (CFA)</Label>
                <Input
                  id="max-price"
                  type="number"
                  placeholder="Prix maximum"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                  min={0}
                />
              </div>
              <div>
                <Label htmlFor="status-filter">Statut</Label>
                <Select 
                  value={filters.status} 
                  onValueChange={(value) => setFilters({...filters, status: value})}
                >
                  <SelectTrigger id="status-filter">
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous les statuts</SelectItem>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Chargement des produits...</span>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>
                  <Button variant="ghost" className="p-0 h-auto flex items-center" onClick={() => {}}>
                    <span>Prix</span>
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex justify-center items-center">
                      <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                      <span>Chargement des produits...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Aucun produit trouvé.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => {
                  // DEBUG: Log au moment du rendu de l'image
                  const hasImages = product.images && Array.isArray(product.images) && product.images.length > 0;
                  const rawImagePath = hasImages ? product.images[0] : '';
                  const imageUrl = buildImageUrl(rawImagePath, user?.tenantId || product.tenantId);
                  
                  console.log(`🎨 RENDU IMAGE pour ${product.name}:`, {
                    productId: product.id,
                    tenantId: user?.tenantId || product.tenantId,
                    rawImages: product.images,
                    rawImagePath,
                    hasImages,
                    imageUrl,
                    finalSrc: imageUrl,
                    isAbsoluteUrl: imageUrl.startsWith('http'),
                    isPlaceholder: imageUrl.includes('placehold.co'),
                    windowLocation: typeof window !== 'undefined' ? window.location.href : 'SSR'
                  });
                  
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="relative h-16 w-16 rounded-md overflow-hidden">
                          <img 
                            src={imageUrl} 
                            alt={product.name}
                            className="object-cover h-full w-full"
                            onLoad={() => {
                              console.log(`✅ Image chargée avec succès pour ${product.name}:`, imageUrl);
                            }}
                            onError={(e) => {
                              console.log(`❌ Erreur de chargement d'image pour ${product.name}:`, {
                                originalSrc: imageUrl,
                                productImages: product.images,
                                tenantId: user?.tenantId || product.tenantId,
                                error: e,
                                timestamp: new Date().toISOString()
                              });
                              (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=Error';
                            }}
                          />
                        </div>
                      </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{formatCurrency(product.price)}</TableCell>
                    <TableCell>{getCategoryName(product.categoryId)}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                      <Badge variant={product.isActive ? "default" : "secondary"}>
                        {product.isActive ? "Actif" : "Inactif"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => router.push(`/admin/products/${product.id}`)}
                          title="Voir le produit"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => router.push(`/admin/products/${product.id}/edit`)}
                          title="Modifier le produit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleToggleStatus(product)}
                          title={product.isActive ? "Désactiver le produit" : "Activer le produit"}
                        >
                          {product.isActive ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                        </Button>
                        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="text-red-500"
                              onClick={() => {
                                setSelectedProduct(product);
                                setIsDeleteDialogOpen(true);
                              }}
                              title="Supprimer le produit"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action ne peut pas être annulée. Cela supprimera définitivement le produit 
                                <span className="font-bold"> {selectedProduct?.name}</span>.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel disabled={isProcessing}>
                                Annuler
                              </AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleDeleteProduct();
                                }}
                                disabled={isProcessing}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                                                  </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-muted-foreground">
          Affichage de {loadedCount} produit(s) sur {totalCount} • Page {currentPage} sur {totalPages}
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            disabled={isLoading || currentPage <= 1}
            onClick={handlePreviousPage}
          >
            Page précédente
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            disabled={isLoading || currentPage >= totalPages}
            onClick={handleNextPage}
          >
            Page suivante
          </Button>
        </div>
      </div>
    </div>
  );
} 