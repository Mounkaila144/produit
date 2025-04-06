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
  Check,
  X,
  AlertCircle
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import categoryService, { 
  Category, 
  CategoryCreateData, 
  CategoryUpdateData 
} from '@/services/categories';
import { formatDate, slugify } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function CategoriesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState<CategoryCreateData>({
    name: '',
    description: '',
    isActive: true
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Récupérer les catégories depuis l'API
  useEffect(() => {
    const loadCategories = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await categoryService.getCategories();
        setCategories(response.data);
        setTotalCount(response.total);
        setLoadedCount(response.data.length);
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
        setError('Impossible de charger les catégories. Veuillez réessayer plus tard.');
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Filtrer les catégories en fonction du terme de recherche
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Créer une nouvelle catégorie
  const handleCreateCategory = async () => {
    // Valider les champs
    if (!newCategory.name.trim()) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Le nom de la catégorie est requis.'
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Générer un slug pour la nouvelle catégorie
      const slug = slugify(newCategory.name);
      
      // Appeler l'API pour créer la catégorie
      const response = await categoryService.createCategory(newCategory);
      
      // Ajouter la nouvelle catégorie à l'état local
      setCategories(prevCategories => [...prevCategories, response.data]);
      
      // Réinitialiser le formulaire et fermer le dialogue
      setNewCategory({
        name: '',
        description: '',
        isActive: true
      });
      setIsAddDialogOpen(false);
      
      toast({
        title: 'Succès',
        description: `La catégorie "${newCategory.name}" a été créée.`
      });
    } catch (error) {
      console.error('Erreur lors de la création de la catégorie:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de créer la catégorie. Veuillez réessayer.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Mettre à jour une catégorie
  const handleUpdateCategory = async () => {
    if (!selectedCategory) return;

    setIsProcessing(true);
    try {
      // Préparer les données à mettre à jour
      const updateData: CategoryUpdateData = {
        name: selectedCategory.name,
        description: selectedCategory.description,
        isActive: selectedCategory.isActive
      };
      
      // Appeler l'API pour mettre à jour la catégorie
      const response = await categoryService.updateCategory(selectedCategory.id, updateData);
      
      // Mettre à jour la catégorie dans l'état local
      setCategories(prevCategories => 
        prevCategories.map(cat => cat.id === selectedCategory.id ? response.data : cat)
      );
      
      setIsEditDialogOpen(false);
      
      toast({
        title: 'Succès',
        description: `La catégorie "${selectedCategory.name}" a été mise à jour.`
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la catégorie:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de mettre à jour la catégorie. Veuillez réessayer.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Supprimer une catégorie
  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;

    setIsProcessing(true);
    try {
      // Appeler l'API pour supprimer la catégorie
      await categoryService.deleteCategory(selectedCategory.id);
      
      // Supprimer la catégorie de l'état local
      setCategories(prevCategories => 
        prevCategories.filter(cat => cat.id !== selectedCategory.id)
      );
      
      setIsDeleteDialogOpen(false);
      
      toast({
        title: 'Succès',
        description: `La catégorie "${selectedCategory.name}" a été supprimée.`
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de la catégorie:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de supprimer la catégorie. Veuillez vérifier qu\'elle n\'est pas utilisée par des produits.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Changer le statut d'une catégorie (activer/désactiver)
  const handleToggleStatus = async (category: Category) => {
    try {
      let response;
      if (category.isActive) {
        response = await categoryService.deactivateCategory(category.id);
        toast({
          title: 'Succès',
          description: `La catégorie "${category.name}" a été désactivée.`
        });
      } else {
        response = await categoryService.activateCategory(category.id);
        toast({
          title: 'Succès',
          description: `La catégorie "${category.name}" a été activée.`
        });
      }
      
      // Mettre à jour la catégorie dans l'état local
      setCategories(prevCategories => 
        prevCategories.map(cat => cat.id === category.id ? response.data : cat)
      );
    } catch (error) {
      console.error('Erreur lors du changement de statut de la catégorie:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de modifier le statut de la catégorie.'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Gestion des catégories</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Ajouter une catégorie
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter une nouvelle catégorie</DialogTitle>
              <DialogDescription>
                Créez une nouvelle catégorie pour vos produits.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nom</Label>
                <Input
                  id="name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                  placeholder="Nom de la catégorie"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                  placeholder="Description de la catégorie"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={newCategory.isActive}
                  onChange={(e) => setNewCategory({...newCategory, isActive: e.target.checked})}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isActive">Actif</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isProcessing}>
                Annuler
              </Button>
              <Button onClick={handleCreateCategory} disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  'Créer la catégorie'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-5 w-5 text-gray-400" />
        <Input
          placeholder="Rechercher des catégories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Chargement des catégories...</span>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">
                  <div className="flex items-center space-x-1">
                    <span>Nom</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-center">Produits</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead>Créée le</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.description || '-'}</TableCell>
                    <TableCell className="text-center">{category.productsCount || 0}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={category.isActive ? 'success' : 'destructive'} 
                        className="cursor-pointer"
                        onClick={() => user?.role === 'admin' && handleToggleStatus(category)}
                      >
                        {category.isActive ? (
                          <><Check className="h-3.5 w-3.5 mr-1" />Actif</>
                        ) : (
                          <><X className="h-3.5 w-3.5 mr-1" />Inactif</>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(category.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Dialog open={isEditDialogOpen && selectedCategory?.id === category.id} onOpenChange={(open) => {
                          if (open) setSelectedCategory(category);
                          setIsEditDialogOpen(open);
                        }}>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setSelectedCategory(category)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Modifier la catégorie</DialogTitle>
                              <DialogDescription>
                                Modifiez les informations de la catégorie sélectionnée.
                              </DialogDescription>
                            </DialogHeader>
                            {selectedCategory && (
                              <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-name">Nom</Label>
                                  <Input
                                    id="edit-name"
                                    value={selectedCategory.name}
                                    onChange={(e) => setSelectedCategory({...selectedCategory, name: e.target.value})}
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-description">Description</Label>
                                  <Input
                                    id="edit-description"
                                    value={selectedCategory.description || ''}
                                    onChange={(e) => setSelectedCategory({...selectedCategory, description: e.target.value})}
                                  />
                                </div>
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id="edit-isActive"
                                    checked={selectedCategory.isActive}
                                    onChange={(e) => setSelectedCategory({...selectedCategory, isActive: e.target.checked})}
                                    className="rounded border-gray-300"
                                  />
                                  <Label htmlFor="edit-isActive">Actif</Label>
                                </div>
                              </div>
                            )}
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isProcessing}>
                                Annuler
                              </Button>
                              <Button onClick={handleUpdateCategory} disabled={isProcessing}>
                                {isProcessing ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Enregistrement...
                                  </>
                                ) : (
                                  'Enregistrer'
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <AlertDialog open={isDeleteDialogOpen && selectedCategory?.id === category.id} onOpenChange={(open) => {
                          if (open) setSelectedCategory(category);
                          setIsDeleteDialogOpen(open);
                        }}>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setSelectedCategory(category)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer la catégorie ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Voulez-vous vraiment supprimer la catégorie &quot;{category.name}&quot; ? 
                                Cette action ne peut pas être annulée et les produits associés seront orphelins.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel disabled={isProcessing}>Annuler</AlertDialogCancel>
                              <AlertDialogAction 
                                className="bg-red-500 hover:bg-red-600" 
                                onClick={handleDeleteCategory}
                                disabled={isProcessing}
                              >
                                {isProcessing ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Suppression...
                                  </>
                                ) : (
                                  'Supprimer'
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    {searchTerm ? 'Aucune catégorie ne correspond à la recherche.' : 'Aucune catégorie trouvée.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
      {loadedCount > 0 && totalCount > loadedCount && (
        <div className="text-center mt-4">
          <Button variant="outline" onClick={() => console.log('Charger plus')}>
            Afficher plus ({loadedCount} sur {totalCount})
          </Button>
        </div>
      )}
    </div>
  );
} 