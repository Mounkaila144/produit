'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import tenantService, { Tenant } from '@/services/tenants';
import userService from '@/services/users';
import { CheckCircle, XCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';

export default function TenantDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTenant, setEditedTenant] = useState<Partial<Tenant>>({});
  const [users, setUsers] = useState([]);
  const [isAssigningOwner, setIsAssigningOwner] = useState(false);
  const [selectedOwnerId, setSelectedOwnerId] = useState('');
  const [isRenewingSubscription, setIsRenewingSubscription] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState({
    plan: '',
    expiresAt: ''
  });

  useEffect(() => {
    loadTenant();
    loadUsers();
  }, [params.id]);

  const loadTenant = async () => {
    setIsLoading(true);
    try {
      // Vérifie que l'ID est défini et non undefined
      if (!params.id || params.id === 'undefined') {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'ID du tenant invalide'
        });
        router.push('/super-admin/tenants');
        return;
      }
      
      const response = await tenantService.getTenant(params.id);
      if (!response || !response.data) {
        throw new Error('Réponse invalide du serveur');
      }
      
      const data = response.data;
      setTenant(data);
      
      // Initialiser les données d'édition avec tous les champs disponibles
      setEditedTenant({
        name: data.name,
        domain: data.domain,
        description: data.description || '',
        plan: data.plan || 'basic',
        logoUrl: data.logoUrl || '',
        status: data.status || (data.active ? 'active' : 'inactive'),
        expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString().split('T')[0] : '',
        contactInfo: typeof data.contactInfo === 'string' 
          ? JSON.parse(data.contactInfo)
          : data.contactInfo || { email: '', phone: '' },
        features: data.features || {},
        storageLimit: data.storageLimit || 0,
        subdomain: data.subdomain || '',
        customDomain: data.customDomain || '',
        maxUsers: data.maxUsers || 0,
        maxProducts: data.maxProducts || 0,
      });
    } catch (error) {
      console.error('Erreur lors du chargement du tenant:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de charger les détails du tenant.'
      });
      router.push('/super-admin/tenants');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await userService.getAllUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    }
  };

  const handleRenewSubscription = async () => {
    if (!tenant) return;
    
    try {
      // Préparer les données de renouvellement
      const renewalData = {
        planType: subscriptionData.plan,
        expiresAt: new Date(subscriptionData.expiresAt).toISOString()
      };
      
      console.log('Données de renouvellement:', renewalData);
      console.log('Tenant ID:', tenant.id);
      console.log('Plan sélectionné:', subscriptionData.plan);
      console.log('Date d\'expiration sélectionnée:', subscriptionData.expiresAt);
      
      // Appel à l'API avec le plan et la date d'expiration
      const result = await tenantService.renewSubscription(
        tenant.id, 
        subscriptionData.plan, 
        subscriptionData.expiresAt
      );
      
      console.log('Résultat du renouvellement:', result);
      
      toast({
        title: 'Succès',
        description: 'L\'abonnement a été renouvelé avec succès.'
      });
      
      setIsRenewingSubscription(false);
      
      // Recharger les données du tenant
      loadTenant();
    } catch (error) {
      console.error('Erreur lors du renouvellement de l\'abonnement:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de renouveler l\'abonnement.'
      });
    }
  };

  const openRenewSubscriptionDialog = () => {
    if (!tenant) return;
    
    // Initialiser les données avec les valeurs actuelles
    setSubscriptionData({
      plan: tenant.planType || tenant.plan || 'basic',
      expiresAt: tenant.expiresAt 
        ? new Date(tenant.expiresAt).toISOString().split('T')[0]
        : new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
    });
    
    setIsRenewingSubscription(true);
  };

  const handleToggleStatus = async () => {
    if (!tenant) return;
    
    try {
      if (tenant.isActive) {
        await tenantService.deactivateTenant(tenant.id);
        toast({
          title: 'Succès',
          description: 'Le tenant a été désactivé.'
        });
      } else {
        await tenantService.activateTenant(tenant.id);
        toast({
          title: 'Succès',
          description: 'Le tenant a été activé.'
        });
      }
      
      // Recharger les données du tenant
      loadTenant();
    } catch (error) {
      console.error('Erreur lors de la modification du statut:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de modifier le statut du tenant.'
      });
    }
  };

  const handleUpdate = async () => {
    if (!tenant) return;
    
    try {
      // Si contactInfo est un objet, le convertir en JSON string si nécessaire
      let updatedData = {...editedTenant};
      
      // Validation de base
      if (!updatedData.name || !updatedData.domain) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Le nom et le domaine sont obligatoires.'
        });
        return;
      }
      
      // Préparation des données pour l'API
      if (updatedData.contactInfo && typeof updatedData.contactInfo === 'object') {
        // Le backend pourrait s'attendre à recevoir contactInfo comme une chaîne JSON
        if (process.env.NEXT_PUBLIC_API_EXPECTS_JSON_STRING === 'true') {
          updatedData.contactInfo = JSON.stringify(updatedData.contactInfo);
        }
      }
      
      await tenantService.updateTenant(tenant.id, updatedData);
      
      toast({
        title: 'Succès',
        description: 'Le tenant a été mis à jour avec succès.'
      });
      
      setIsEditing(false);
      
      // Recharger les données du tenant
      loadTenant();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du tenant:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de mettre à jour le tenant.'
      });
    }
  };

  const handleAssignOwner = async () => {
    if (!tenant || !selectedOwnerId) return;
    
    try {
      await tenantService.assignOwner(tenant.id, selectedOwnerId);
      
      toast({
        title: 'Succès',
        description: 'Le propriétaire a été assigné avec succès.'
      });
      
      setIsAssigningOwner(false);
      
      // Recharger les données du tenant
      loadTenant();
    } catch (error) {
      console.error('Erreur lors de l\'assignation du propriétaire:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible d\'assigner le propriétaire.'
      });
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      console.error(`Erreur de formatage de date pour ${dateString}:`, error);
      return '-';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <p>Chargement des détails du tenant...</p>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <p>Tenant non trouvé.</p>
        <Button onClick={() => router.push('/super-admin/tenants')} className="mt-4">
          Retour à la liste
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{tenant.name}</h1>
          <p className="text-gray-500">ID: {tenant.id}</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => router.push('/super-admin/tenants')}>
            Retour
          </Button>
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            Modifier
          </Button>
          <Button variant="outline" onClick={() => setIsAssigningOwner(true)}>
            Assigner propriétaire
          </Button>
          <Button 
            variant={tenant.isActive ? "destructive" : "default"}
            onClick={handleToggleStatus}
          >
            {tenant.isActive ? 'Désactiver' : 'Activer'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="subscription">Abonnement</TabsTrigger>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations Générales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Nom</p>
                    <p>{tenant.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Statut</p>
                    <Badge variant={tenant.isActive ? "success" : "destructive"}>
                      {tenant.isActive ? "Actif" : "Inactif"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Description</p>
                  <p>{tenant.description || 'Aucune description'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Sous-domaine</p>
                    <p>{tenant.subdomain}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Domaine personnalisé</p>
                    <p>{tenant.customDomain || '-'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date de création</p>
                    <p>{formatDate(tenant.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Dernière mise à jour</p>
                    <p>{formatDate(tenant.updatedAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informations du Propriétaire</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {tenant.owner ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Nom d'utilisateur</p>
                        <p>{tenant.owner.username}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <p>{tenant.owner.email}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">ID</p>
                      <p>{tenant.owner.id}</p>
                    </div>
                  </>
                ) : (
                  <p>Informations du propriétaire non disponibles</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="subscription">
          <Card>
            <CardHeader>
              <CardTitle>Informations d'abonnement</CardTitle>
              <CardDescription>Gérez le plan et la durée de l'abonnement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-500">Plan actuel</h3>
                    <p className="text-xl font-bold capitalize">{tenant.planType || tenant.plan || 'Basic'}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-500">Date d'expiration</h3>
                    <p className="text-xl font-bold">{formatDate(tenant.expiresAt)}</p>
                    
                    {/* Afficher le statut de l'abonnement */}
                    {tenant.expiresAt && new Date(tenant.expiresAt) < new Date() ? (
                      <Badge variant="destructive" className="mt-2">Expiré</Badge>
                    ) : (
                      <Badge variant="success" className="mt-2">Actif</Badge>
                    )}
                  </div>
                  
                  <div className="pt-4">
                    <Button onClick={openRenewSubscriptionDialog}>
                      Renouveler l'abonnement
                    </Button>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-bold mb-3 text-lg">Détails du plan</h3>
                  
                  <div className="space-y-3">
                    {tenant.planType === 'basic' || tenant.plan === 'basic' ? (
                      <>
                        <div className="flex items-center">
                          <CheckCircle className="text-green-500 mr-2 h-5 w-5" />
                          <span>Nombre limité de produits</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="text-green-500 mr-2 h-5 w-5" />
                          <span>Support par email</span>
                        </div>
                        <div className="flex items-center">
                          <XCircle className="text-red-500 mr-2 h-5 w-5" />
                          <span className="text-gray-500">Fonctionnalités avancées</span>
                        </div>
                      </>
                    ) : tenant.planType === 'premium' || tenant.plan === 'premium' ? (
                      <>
                        <div className="flex items-center">
                          <CheckCircle className="text-green-500 mr-2 h-5 w-5" />
                          <span>Nombre illimité de produits</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="text-green-500 mr-2 h-5 w-5" />
                          <span>Support prioritaire</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="text-green-500 mr-2 h-5 w-5" />
                          <span>Fonctionnalités avancées</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center">
                          <CheckCircle className="text-green-500 mr-2 h-5 w-5" />
                          <span>Nombre illimité de produits</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="text-green-500 mr-2 h-5 w-5" />
                          <span>Support dédié 24/7</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="text-green-500 mr-2 h-5 w-5" />
                          <span>Toutes les fonctionnalités</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="text-green-500 mr-2 h-5 w-5" />
                          <span>Personnalisation complète</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Historique de paiement</CardTitle>
            </CardHeader>
            <CardContent>
              {tenant.payments && tenant.payments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tenant.payments.map(payment => (
                      <TableRow key={payment.id}>
                        <TableCell>{formatDate(payment.date)}</TableCell>
                        <TableCell className="capitalize">{tenant.planType || tenant.plan}</TableCell>
                        <TableCell>{payment.amount} €</TableCell>
                        <TableCell>
                          <Badge variant={payment.status === 'completed' ? 'success' : 'secondary'}>
                            {payment.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  Aucun historique de paiement disponible
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Utilisateurs</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-3xl font-bold">
                {tenant.userCount || '0'}
                <p className="text-sm font-normal text-gray-500 mt-2">sur {tenant.maxUsers}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Produits</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-3xl font-bold">
                {tenant.productCount || '0'}
                <p className="text-sm font-normal text-gray-500 mt-2">sur {tenant.maxProducts}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Commandes</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-3xl font-bold">
                {tenant.orderCount || '0'}
                <p className="text-sm font-normal text-gray-500 mt-2">total</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="settings">
          {/* ... existing settings content ... */}
        </TabsContent>
      </Tabs>
      
      {/* Dialog pour assigner un propriétaire */}
      <Dialog open={isAssigningOwner} onOpenChange={setIsAssigningOwner}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assigner un propriétaire</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ownerId">Sélectionner un utilisateur</Label>
              <Select value={selectedOwnerId} onValueChange={setSelectedOwnerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un utilisateur" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.email} ({user.username || user.firstName || ''})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsAssigningOwner(false)}>Annuler</Button>
              <Button onClick={handleAssignOwner}>Assigner</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog pour éditer le tenant */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le tenant {tenant.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[75vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Nom</Label>
                <Input
                  id="edit-name"
                  value={editedTenant.name || ''}
                  onChange={e => setEditedTenant({...editedTenant, name: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-domain">Domaine</Label>
                <Input
                  id="edit-domain"
                  value={editedTenant.domain || ''}
                  onChange={e => setEditedTenant({...editedTenant, domain: e.target.value})}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={editedTenant.description || ''}
                onChange={e => setEditedTenant({...editedTenant, description: e.target.value})}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-plan">Plan</Label>
                <Select 
                  value={editedTenant.plan || 'basic'}
                  onValueChange={value => setEditedTenant({...editedTenant, plan: value})}
                >
                  <SelectTrigger id="edit-plan" className="mt-1">
                    <SelectValue placeholder="Sélectionner un plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-status">Statut</Label>
                <Select 
                  value={editedTenant.status || 'active'}
                  onValueChange={value => setEditedTenant({...editedTenant, status: value as 'active' | 'inactive' | 'pending' | 'suspended'})}
                >
                  <SelectTrigger id="edit-status" className="mt-1">
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="suspended">Suspendu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-logoUrl">URL du logo</Label>
                <Input
                  id="edit-logoUrl"
                  value={editedTenant.logoUrl || ''}
                  onChange={e => setEditedTenant({...editedTenant, logoUrl: e.target.value})}
                  className="mt-1"
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <div>
                <Label htmlFor="edit-expiresAt">Date d'expiration</Label>
                <Input
                  id="edit-expiresAt"
                  type="date"
                  value={editedTenant.expiresAt || ''}
                  onChange={e => setEditedTenant({...editedTenant, expiresAt: e.target.value})}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-2 gap-4">
              <div>
                <Label htmlFor="edit-contactEmail">Email de contact</Label>
                <Input
                  id="edit-contactEmail"
                  type="email"
                  placeholder="contact@example.com"
                  value={editedTenant.contactInfo?.email || ''}
                  onChange={e => setEditedTenant({
                    ...editedTenant, 
                    contactInfo: {...(editedTenant.contactInfo || {}), email: e.target.value}
                  })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-contactPhone">Téléphone de contact</Label>
                <Input
                  id="edit-contactPhone"
                  placeholder="+33123456789"
                  value={editedTenant.contactInfo?.phone || ''}
                  onChange={e => setEditedTenant({
                    ...editedTenant, 
                    contactInfo: {...(editedTenant.contactInfo || {}), phone: e.target.value}
                  })}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-2 gap-4">
              <div>
                <Label htmlFor="edit-subdomain">Sous-domaine</Label>
                <Input
                  id="edit-subdomain"
                  value={editedTenant.subdomain || ''}
                  onChange={e => setEditedTenant({...editedTenant, subdomain: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-customDomain">Domaine personnalisé</Label>
                <Input
                  id="edit-customDomain"
                  value={editedTenant.customDomain || ''}
                  onChange={e => setEditedTenant({...editedTenant, customDomain: e.target.value})}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-3 gap-4">
              <div>
                <Label htmlFor="edit-storageLimit">Limite de stockage (Mo)</Label>
                <Input
                  id="edit-storageLimit"
                  type="number"
                  value={editedTenant.storageLimit || 0}
                  onChange={e => setEditedTenant({...editedTenant, storageLimit: parseInt(e.target.value) || 0})}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-maxUsers">Nombre max d'utilisateurs</Label>
                <Input
                  id="edit-maxUsers"
                  type="number"
                  value={editedTenant.maxUsers || 0}
                  onChange={e => setEditedTenant({...editedTenant, maxUsers: parseInt(e.target.value) || 0})}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-maxProducts">Nombre max de produits</Label>
                <Input
                  id="edit-maxProducts"
                  type="number"
                  value={editedTenant.maxProducts || 0}
                  onChange={e => setEditedTenant({...editedTenant, maxProducts: parseInt(e.target.value) || 0})}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Annuler
              </Button>
              <Button onClick={handleUpdate}>
                Enregistrer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog pour renouveler l'abonnement */}
      <Dialog open={isRenewingSubscription} onOpenChange={setIsRenewingSubscription}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renouveler l'abonnement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="subscription-plan">Plan d'abonnement</Label>
              <Select 
                value={subscriptionData.plan} 
                onValueChange={(value) => setSubscriptionData({...subscriptionData, plan: value})}
              >
                <SelectTrigger id="subscription-plan" className="mt-1">
                  <SelectValue placeholder="Sélectionner un plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="subscription-expires">Date d'expiration</Label>
              <Input
                id="subscription-expires"
                type="date"
                value={subscriptionData.expiresAt}
                onChange={(e) => setSubscriptionData({...subscriptionData, expiresAt: e.target.value})}
                className="mt-1"
              />
            </div>
            
            <div className="pt-4">
              <div className="bg-blue-50 p-4 rounded-md mb-4">
                <p className="text-sm text-blue-800">
                  En renouvelant l'abonnement, la date d'expiration sera mise à jour et les fonctionnalités
                  correspondant au plan sélectionné seront activées.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsRenewingSubscription(false)}>
                Annuler
              </Button>
              <Button onClick={handleRenewSubscription}>
                Renouveler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 