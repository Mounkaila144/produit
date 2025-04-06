'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Tenant } from '@/services/tenants';
import tenantService from '@/services/tenants';
import userService from '@/services/users';
import { CheckCircle, XCircle, Search, ArrowUpDown, Plus, UserPlus, Edit, Power, Calendar } from 'lucide-react';

export default function TenantsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof Tenant>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // État pour la création d'un nouveau tenant
  const [isCreatingTenant, setIsCreatingTenant] = useState(false);
  const [newTenant, setNewTenant] = useState({
    name: '',
    domain: '',
    description: '',
    plan: 'basic',
    expiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    contactInfo: {
      email: '',
      phone: ''
    },
    features: {},
    storageLimit: 0,
    ownerEmail: '',
    ownerName: ''
  });

  const [users, setUsers] = useState([]);
  const [isAssigningOwner, setIsAssigningOwner] = useState(false);
  const [selectedOwnerId, setSelectedOwnerId] = useState('');
  const [activeTenantId, setActiveTenantId] = useState<string | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isViewingTenant, setIsViewingTenant] = useState(false);
  const [isEditingTenant, setIsEditingTenant] = useState(false);
  const [editedTenant, setEditedTenant] = useState<Partial<Tenant>>({});
  const [isManagingSubscription, setIsManagingSubscription] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState({
    plan: 'basic',
    expiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
  });

  useEffect(() => {
    loadTenants();
    loadUsers();
  }, []);

  const loadTenants = async () => {
    setIsLoading(true);
    try {
      const response = await tenantService.getAllTenants();
      
      // Convertir la propriété active en status
      const tenantsWithStatus = (response.data || []).map(tenant => ({
        ...tenant,
        status: tenant.status || (tenant.active ? 'active' : 'inactive')
      }));
      
      setTenants(tenantsWithStatus);
      console.log('Tenants chargés:', tenantsWithStatus);
    } catch (error) {
      console.error('Erreur lors du chargement des tenants:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de charger la liste des tenants.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await userService.getAllUsers();
      console.log('Utilisateurs chargés:', response);
      setUsers(response.items || []);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    }
  };

  const handleCreateTenant = async () => {
    try {
      // Validation des champs obligatoires
      if (!newTenant.name || !newTenant.domain) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Veuillez remplir tous les champs obligatoires (nom et domaine).'
        });
        return;
      }

      // Utiliser le service tenant pour créer un nouveau tenant
      await tenantService.createTenant({
        name: newTenant.name,
        domain: newTenant.domain,
        description: newTenant.description,
        plan: newTenant.plan,
        expiresAt: newTenant.expiresAt,
        contactInfo: newTenant.contactInfo,
        features: newTenant.features,
        storageLimit: newTenant.storageLimit,
        owner: {
          name: newTenant.ownerName,
          email: newTenant.ownerEmail
        }
      });
      
      toast({
        title: 'Succès',
        description: 'Le tenant a été créé avec succès.'
      });
      
      // Réinitialisation du formulaire
      setNewTenant({
        name: '',
        domain: '',
        description: '',
        plan: 'basic',
        expiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        contactInfo: {
          email: '',
          phone: ''
        },
        features: {},
        storageLimit: 0,
        ownerEmail: '',
        ownerName: ''
      });
      
      setIsCreatingTenant(false);
      
      // Rechargement de la liste des tenants
      loadTenants();
    } catch (error) {
      console.error('Erreur lors de la création du tenant:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de créer le tenant.'
      });
    }
  };

  const handleToggleTenantStatus = async (tenantId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      
      // Utiliser les bonnes méthodes selon le statut
      if (newStatus === 'active') {
        await tenantService.activateTenant(tenantId);
      } else {
        await tenantService.deactivateTenant(tenantId);
      }
      
      toast({
        title: 'Succès',
        description: `Le statut du tenant a été mis à jour avec succès.`
      });
      
      // Mettre à jour l'état local
      setTenants(prevTenants =>
        prevTenants.map(tenant =>
          tenant.id === tenantId ? { ...tenant, status: newStatus as 'active' | 'inactive' } : tenant
        )
      );
    } catch (error) {
      console.error('Erreur lors de la modification du statut:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de modifier le statut du tenant.'
      });
    }
  };

  const handleSort = (field: keyof Tenant) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  // Filtrer les tenants en fonction des critères de recherche
  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = searchTerm === '' || 
      tenant.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      tenant.domain?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || tenant.status === statusFilter;
    
    const matchesPlan = planFilter === 'all' || tenant.plan === planFilter;
    
    return matchesSearch && matchesStatus && matchesPlan;
  });

  // Trier les tenants
  const sortedTenants = [...filteredTenants].sort((a, b) => {
    if (sortField === 'createdAt' || sortField === 'expiresAt') {
      const dateA = new Date(a[sortField] || 0).getTime();
      const dateB = new Date(b[sortField] || 0).getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    }
    
    if (typeof a[sortField] === 'string' && typeof b[sortField] === 'string') {
      return sortDirection === 'asc' 
        ? (a[sortField] as string).localeCompare(b[sortField] as string)
        : (b[sortField] as string).localeCompare(a[sortField] as string);
    }
    
    return sortDirection === 'asc'
      ? (a[sortField] as number) - (b[sortField] as number)
      : (b[sortField] as number) - (a[sortField] as number);
  });

  // Obtenir les plans uniques pour le filtre
  const uniquePlans = [...new Set(tenants.map(tenant => tenant.plan))].filter(Boolean);

  const handleAssignOwner = async () => {
    if (!activeTenantId || !selectedOwnerId) return;
    
    try {
      await tenantService.assignOwner(activeTenantId, selectedOwnerId);
      
      toast({
        title: 'Succès',
        description: 'Le propriétaire a été assigné avec succès.'
      });
      
      setIsAssigningOwner(false);
      setActiveTenantId(null);
      
      // Recharger la liste des tenants
      loadTenants();
    } catch (error) {
      console.error('Erreur lors de l\'assignation du propriétaire:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible d\'assigner le propriétaire.'
      });
    }
  };

  // Fonction pour charger les détails d'un tenant
  const loadTenantDetails = async (tenantId: string) => {
    try {
      const response = await tenantService.getTenant(tenantId);
      if (!response || !response.data) {
        throw new Error('Réponse invalide du serveur');
      }
      
      const data = response.data;
      setSelectedTenant(data);
      
      // Initialiser les données d'édition
      setEditedTenant({
        name: data.name,
        domain: data.domain,
        description: data.description || '',
        plan: data.plan || 'basic',
        status: data.status || (data.active ? 'active' : 'inactive'),
        expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString().split('T')[0] : '',
        contactInfo: typeof data.contactInfo === 'string' 
          ? JSON.parse(data.contactInfo)
          : data.contactInfo || { email: '', phone: '' },
        features: data.features || {},
        storageLimit: data.storageLimit || 0
      });
      
      return data;
    } catch (error) {
      console.error('Erreur lors du chargement des détails du tenant:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de charger les détails du tenant.'
      });
      return null;
    }
  };

  const handleViewTenant = async (tenantId: string) => {
    const tenant = await loadTenantDetails(tenantId);
    if (tenant) {
      setIsViewingTenant(true);
    }
  };

  const handleEditTenant = async (tenantId: string) => {
    const tenant = await loadTenantDetails(tenantId);
    if (tenant) {
      setIsEditingTenant(true);
    }
  };

  const handleUpdate = async () => {
    if (!selectedTenant) return;
    
    try {
      // Validation de base
      if (!editedTenant.name) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Le nom est obligatoire.'
        });
        return;
      }
      
      console.log("État editedTenant AVANT envoi:", JSON.stringify(editedTenant, null, 2));
      
      // Format ISO pour la date d'expiration
      const formattedExpiresAt = editedTenant.expiresAt 
        ? new Date(editedTenant.expiresAt).toISOString() 
        : undefined;
        
      console.log("Date d'expiration brute:", editedTenant.expiresAt);
      console.log("Date d'expiration formatée:", formattedExpiresAt);
      
      // Inclure tous les champs nécessaires pour la mise à jour
      const updateData = {
        name: editedTenant.name,
        description: editedTenant.description || '',
        domain: editedTenant.domain,
        planType: editedTenant.plan,
        active: editedTenant.status === 'active',
        expiresAt: formattedExpiresAt,
        contactInfo: editedTenant.contactInfo || {}
      };
      
      console.log("Données complètes envoyées:", JSON.stringify(updateData, null, 2));
      
      // Appel direct à l'API pour éviter toute transformation
      const response = await fetch(`/api/superadmin/tenants/${selectedTenant.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updateData)
      });
      
      const responseData = await response.json();
      console.log("Réponse complète du serveur:", JSON.stringify(responseData, null, 2));
      
      if (!response.ok) {
        throw new Error(responseData.message || 'Erreur lors de la mise à jour');
      }
      
      toast({
        title: 'Succès',
        description: 'Le tenant a été mis à jour avec succès.'
      });
      
      setIsEditingTenant(false);
      
      // Recharger la liste des tenants
      loadTenants();
    } catch (error) {
      console.error('Erreur détaillée lors de la mise à jour du tenant:', error);
      
      let errorMessage = 'Impossible de mettre à jour le tenant.';
      
      // Extraire un message d'erreur plus précis si disponible
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: errorMessage
      });
    }
  };

  const handleUpdateSubscription = async () => {
    if (!activeTenantId) return;
    
    try {
      // Préparation des données d'abonnement
      const subscriptionDetails = {
        planType: subscriptionData.plan,
        expiresAt: subscriptionData.expiresAt
      };
      
      console.log("Mise à jour de l'abonnement:", subscriptionDetails);
      console.log("Date d'expiration avant envoi:", subscriptionData.expiresAt);
      console.log("Date formatée:", new Date(subscriptionData.expiresAt).toISOString());
      
      // Appel à l'API pour mettre à jour l'abonnement
      const response = await tenantService.renewSubscription(
        activeTenantId, 
        subscriptionData.plan, 
        subscriptionData.expiresAt
      );
      
      console.log("Réponse complète du serveur:", response);
      
      toast({
        title: 'Succès',
        description: "L'abonnement a été mis à jour avec succès."
      });
      
      setIsManagingSubscription(false);
      setActiveTenantId(null);
      
      // Recharger la liste des tenants
      loadTenants();
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'abonnement:", error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: "Impossible de mettre à jour l'abonnement."
      });
    }
  };

  // Fonction pour initialiser les données d'abonnement lors de l'ouverture de la modale
  const handleManageSubscription = (tenant: Tenant) => {
    setActiveTenantId(tenant.id);
    
    // Initialiser les données d'abonnement à partir du tenant sélectionné
    setSubscriptionData({
      plan: tenant.plan || 'basic',
      expiresAt: tenant.expiresAt ? new Date(tenant.expiresAt).toISOString().split('T')[0] : 
        new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
    });
    
    setIsManagingSubscription(true);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Tenants</h1>
        <Dialog open={isCreatingTenant} onOpenChange={setIsCreatingTenant}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Créer un Tenant
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un nouveau tenant</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nom du tenant</Label>
                  <Input
                    id="name"
                    placeholder="Entrez le nom"
                    value={newTenant.name}
                    onChange={(e) => setNewTenant({...newTenant, name: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="domain">Domaine</Label>
                  <Input
                    id="domain"
                    placeholder="sous-domaine-unique"
                    value={newTenant.domain}
                    onChange={(e) => setNewTenant({...newTenant, domain: e.target.value})}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Description du tenant"
                  value={newTenant.description}
                  onChange={(e) => setNewTenant({...newTenant, description: e.target.value})}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="plan">Plan</Label>
                  <Select 
                    value={newTenant.plan}
                    onValueChange={(value) => setNewTenant({...newTenant, plan: value})}
                  >
                    <SelectTrigger id="plan" className="mt-1">
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
                  <Label htmlFor="expiresAt">Date d'expiration</Label>
                  <Input
                    id="expiresAt"
                    type="date"
                    value={newTenant.expiresAt}
                    onChange={(e) => setNewTenant({...newTenant, expiresAt: e.target.value})}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="storageLimit">Limite de stockage (Mo)</Label>
                  <Input
                    id="storageLimit"
                    type="number"
                    placeholder="0"
                    value={newTenant.storageLimit.toString()}
                    onChange={(e) => setNewTenant({...newTenant, storageLimit: parseInt(e.target.value) || 0})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="contactEmail">Email de contact</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    placeholder="contact@example.com"
                    value={newTenant.contactInfo.email}
                    onChange={(e) => setNewTenant({
                      ...newTenant, 
                      contactInfo: {...newTenant.contactInfo, email: e.target.value}
                    })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactPhone">Téléphone de contact</Label>
                  <Input
                    id="contactPhone"
                    placeholder="+33123456789"
                    value={newTenant.contactInfo.phone}
                    onChange={(e) => setNewTenant({
                      ...newTenant, 
                      contactInfo: {...newTenant.contactInfo, phone: e.target.value}
                    })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="ownerEmail">Email du propriétaire</Label>
                  <Input
                    id="ownerEmail"
                    type="email"
                    placeholder="owner@example.com"
                    value={newTenant.ownerEmail}
                    onChange={(e) => setNewTenant({...newTenant, ownerEmail: e.target.value})}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="ownerName">Nom du propriétaire</Label>
                <Input
                  id="ownerName"
                  placeholder="Entrez le nom"
                  value={newTenant.ownerName}
                  onChange={(e) => setNewTenant({...newTenant, ownerName: e.target.value})}
                  className="mt-1"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreatingTenant(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreateTenant}>
                  Créer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtres de recherche</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Rechercher par nom ou domaine"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <div>
              <Select 
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="suspended">Suspendu</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select 
                value={planFilter}
                onValueChange={setPlanFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les plans" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les plans</SelectItem>
                  {uniquePlans.map(plan => (
                    <SelectItem key={plan} value={plan}>
                      {typeof plan === 'string' ? plan.charAt(0).toUpperCase() + plan.slice(1) : plan}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Liste des Tenants ({filteredTenants.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Chargement...</div>
          ) : sortedTenants.length === 0 ? (
            <div className="text-center py-4">Aucun tenant trouvé.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                    <div className="flex items-center">
                      Nom
                      {sortField === 'name' && (
                        <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('domain')}>
                    <div className="flex items-center">
                      Domaine
                      {sortField === 'domain' && (
                        <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                    <div className="flex items-center">
                      Statut
                      {sortField === 'status' && (
                        <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('plan')}>
                    <div className="flex items-center">
                      Plan
                      {sortField === 'plan' && (
                        <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('usersCount')}>
                    <div className="flex items-center">
                      Utilisateurs
                      {sortField === 'usersCount' && (
                        <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('createdAt')}>
                    <div className="flex items-center">
                      Créé le
                      {sortField === 'createdAt' && (
                        <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('expiresAt')}>
                    <div className="flex items-center">
                      Expire le
                      {sortField === 'expiresAt' && (
                        <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTenants.map(tenant => (
                  <TableRow key={tenant.id}>
                    <TableCell className="font-medium">{tenant.name}</TableCell>
                    <TableCell>{tenant.domain}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          tenant.status === 'active' ? "success" : 
                          tenant.status === 'pending' ? "warning" : 
                          tenant.status === 'suspended' ? "destructive" : "secondary"
                        }
                        className="flex items-center w-fit"
                      >
                        {tenant.status === 'active' ? (
                          <><CheckCircle className="mr-1 h-3 w-3" /> Actif</>
                        ) : tenant.status === 'inactive' ? (
                          <><XCircle className="mr-1 h-3 w-3" /> Inactif</>
                        ) : tenant.status === 'pending' ? (
                          'En attente'
                        ) : (
                          'Suspendu'
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">{tenant.plan}</TableCell>
                    <TableCell>{tenant.usersCount}</TableCell>
                    <TableCell>{formatDate(tenant.createdAt)}</TableCell>
                    <TableCell>{formatDate(tenant.expiresAt)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewTenant(tenant.id)}
                        >
                          Détails
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditTenant(tenant.id)}
                        >
                          <Edit className="h-4 w-4 mr-1" /> 
                          Éditer
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setActiveTenantId(tenant.id);
                            setIsAssigningOwner(true);
                          }}
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Propriétaire
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleManageSubscription(tenant)}
                        >
                          <Calendar className="h-4 w-4 mr-1" />
                          Abonnement
                        </Button>
                        <Button
                          variant={tenant.status === 'active' ? "destructive" : "default"}
                          size="sm"
                          onClick={() => handleToggleTenantStatus(tenant.id, tenant.status || '')}
                        >
                          <Power className="h-4 w-4 mr-1" />
                          {tenant.status === 'active' ? 'Désactiver' : 'Activer'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Dialog pour assigner un propriétaire */}
      <Dialog open={isAssigningOwner} onOpenChange={(open) => {
        setIsAssigningOwner(open);
        if (!open) setActiveTenantId(null);
      }}>
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
              <Button variant="outline" onClick={() => {
                setIsAssigningOwner(false);
                setActiveTenantId(null);
              }}>Annuler</Button>
              <Button onClick={handleAssignOwner}>Assigner</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog pour afficher les détails d'un tenant */}
      <Dialog open={isViewingTenant} onOpenChange={setIsViewingTenant}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails du tenant {selectedTenant?.name}</DialogTitle>
          </DialogHeader>
          {selectedTenant && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Informations Générales</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Nom</p>
                        <p>{selectedTenant.name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Statut</p>
                        <Badge variant={selectedTenant.active ? "success" : "destructive"}>
                          {selectedTenant.status || (selectedTenant.active ? "Actif" : "Inactif")}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Description</p>
                      <p>{selectedTenant.description || 'Aucune description'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Domaine</p>
                        <p>{selectedTenant.domain}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Domaine personnalisé</p>
                        <p>{selectedTenant.customDomain || '-'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Plan</p>
                        <p className="capitalize">{selectedTenant.plan}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Expire le</p>
                        <p>{formatDate(selectedTenant.expiresAt)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Informations du Propriétaire</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedTenant.owner ? (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Nom</p>
                            <p>{selectedTenant.owner.name}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Email</p>
                            <p>{selectedTenant.owner.email}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">ID</p>
                          <p>{selectedTenant.owner.id}</p>
                        </div>
                      </>
                    ) : (
                      <p>Informations du propriétaire non disponibles</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Utilisateurs</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center text-3xl font-bold">
                    {selectedTenant.usersCount || '0'}
                    <p className="text-sm font-normal text-gray-500 mt-2">utilisateurs</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Stockage</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center text-3xl font-bold">
                    {selectedTenant.storageUsed ? Math.round(selectedTenant.storageUsed / 1024 / 1024) : '0'} Mo
                    <p className="text-sm font-normal text-gray-500 mt-2">
                      sur {selectedTenant.storageLimit ? Math.round(selectedTenant.storageLimit / 1024 / 1024) : '∞'} Mo
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Fonctionnalités</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {selectedTenant.features && Object.entries(selectedTenant.features).length > 0 ? (
                      Object.entries(selectedTenant.features).map(([key, value]) => (
                        <div key={key} className="flex items-center">
                          {value ? (
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500 mr-2" />
                          )}
                          <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500">Aucune fonctionnalité spécifique</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsViewingTenant(false)}>
                  Fermer
                </Button>
                <Button onClick={() => {
                  setIsViewingTenant(false);
                  setIsEditingTenant(true);
                }}>
                  Modifier
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog pour éditer un tenant */}
      <Dialog open={isEditingTenant} onOpenChange={setIsEditingTenant}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le tenant {selectedTenant?.name}</DialogTitle>
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
                <Label htmlFor="edit-expiresAt">Date d'expiration</Label>
                <Input
                  id="edit-expiresAt"
                  type="date"
                  value={editedTenant.expiresAt || ''}
                  onChange={e => setEditedTenant({...editedTenant, expiresAt: e.target.value})}
                  className="mt-1"
                />
              </div>
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
            </div>

            <div className="grid grid-cols-2 gap-4">
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

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditingTenant(false)}>
                Annuler
              </Button>
              <Button onClick={handleUpdate}>
                Enregistrer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog pour gérer l'abonnement */}
      <Dialog open={isManagingSubscription} onOpenChange={(open) => {
        setIsManagingSubscription(open);
        if (!open) setActiveTenantId(null);
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Gérer l'abonnement</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subscription-plan">Plan d'abonnement</Label>
              <Select 
                value={subscriptionData.plan} 
                onValueChange={(value) => setSubscriptionData({...subscriptionData, plan: value})}
              >
                <SelectTrigger id="subscription-plan">
                  <SelectValue placeholder="Sélectionner un plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subscription-expires">Date d'expiration</Label>
              <Input
                id="subscription-expires"
                type="date"
                value={subscriptionData.expiresAt}
                onChange={(e) => setSubscriptionData({...subscriptionData, expiresAt: e.target.value})}
              />
            </div>
            
            <div className="pt-4">
              <div className="bg-blue-50 p-4 rounded-md mb-4">
                <p className="text-sm text-blue-800">
                  En modifiant cet abonnement, vous changez le niveau d'accès et les fonctionnalités disponibles pour ce tenant.
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="border rounded-md p-3 text-center">
                  <h3 className="font-bold">Basic</h3>
                  <p className="text-sm text-gray-500 mt-1">Fonctionnalités limitées</p>
                </div>
                <div className="border rounded-md p-3 text-center">
                  <h3 className="font-bold">Premium</h3>
                  <p className="text-sm text-gray-500 mt-1">Plus d'options avancées</p>
                </div>
                <div className="border rounded-md p-3 text-center">
                  <h3 className="font-bold">Enterprise</h3>
                  <p className="text-sm text-gray-500 mt-1">Support personnalisé</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => {
                setIsManagingSubscription(false);
                setActiveTenantId(null);
              }}>Annuler</Button>
              <Button onClick={handleUpdateSubscription}>Mettre à jour</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 