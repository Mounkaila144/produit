'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import tenantService from '@/services/tenants';
import userService from '@/services/users';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Edit, UserCog, Eye } from 'lucide-react';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  tenantId: string | null;
  isActive: boolean;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
  Tenant?: {
    id: string;
    name: string;
  };
}

export default function UsersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [tenants, setTenants] = useState<{id: string, name: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  
  // État pour la création d'un nouvel utilisateur
  const [isCreating, setIsCreating] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'editor',
    tenantId: ''
  });

  // État pour l'édition d'un utilisateur
  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editUserData, setEditUserData] = useState({
    username: '',
    email: '',
    role: '',
    tenantId: ''
  });

  // État pour la visualisation des détails d'un utilisateur
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
    loadTenants();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      // Utiliser le service userService et récupérer les données dans le bon format
      const response = await userService.getAllUsers();
      console.log('Réponse utilisateurs:', response);
      setUsers(response.items || []);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de charger la liste des utilisateurs.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadTenants = async () => {
    try {
      const response = await tenantService.getAllTenants();
      // Utiliser le bon format de réponse (data au lieu de tenants)
      setTenants(response.data.map((tenant: any) => ({
        id: tenant.id,
        name: tenant.name
      })) || []);
    } catch (error) {
      console.error('Erreur lors du chargement des tenants:', error);
    }
  };

  const handleCreateUser = async () => {
    try {
      // Validation des champs obligatoires
      if (!newUser.username || !newUser.email || !newUser.password) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Veuillez remplir tous les champs obligatoires.'
        });
        return;
      }
      
      // Préparer les données pour l'API
      const userData = {
        ...newUser,
        // Si tenantId est "none", on l'envoie comme null
        tenantId: newUser.tenantId === 'none' ? null : newUser.tenantId
      };

      // Utiliser le service au lieu de fetch direct
      await userService.createSuperAdminUser(userData);
      
      toast({
        title: 'Succès',
        description: 'L\'utilisateur a été créé avec succès.'
      });
      
      // Réinitialisation du formulaire
      setNewUser({
        username: '',
        email: '',
        password: '',
        role: 'editor',
        tenantId: ''
      });
      
      setIsCreating(false);
      
      // Rechargement de la liste des utilisateurs
      loadUsers();
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de créer l\'utilisateur.'
      });
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditUserData({
      username: user.username,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId || ''
    });
    setIsEditing(true);
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setIsViewingDetails(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      // Préparer les données pour l'API
      const userData = {
        ...editUserData,
        // Si tenantId est "none" ou une chaîne vide, on l'envoie comme null
        tenantId: !editUserData.tenantId || editUserData.tenantId === 'none' ? null : editUserData.tenantId
      };

      // Appeler l'API pour mettre à jour l'utilisateur
      await userService.updateSuperAdminUser(editingUser.id, userData);
      
      toast({
        title: 'Succès',
        description: 'L\'utilisateur a été mis à jour avec succès.'
      });
      
      setIsEditing(false);
      
      // Rechargement de la liste des utilisateurs
      loadUsers();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de mettre à jour l\'utilisateur.'
      });
    }
  };

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      // Utiliser le service au lieu de fetch direct
      if (isActive) {
        await userService.disableUser(userId);
      } else {
        await userService.enableUser(userId);
      }
      
      toast({
        title: 'Succès',
        description: `L'utilisateur a été ${isActive ? 'désactivé' : 'activé'} avec succès.`
      });
      
      // Rechargement de la liste des utilisateurs
      loadUsers();
    } catch (error) {
      console.error('Erreur lors de la modification du statut:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de modifier le statut de l\'utilisateur.'
      });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Filtrer les utilisateurs en fonction des critères de recherche
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTenant = selectedTenant === 'all' || 
      (selectedTenant === 'null' && user.tenantId === null) || 
      user.tenantId === selectedTenant;
    
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    
    return matchesSearch && matchesTenant && matchesRole;
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Utilisateurs</h1>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>Créer un Utilisateur</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Nom d'utilisateur*</Label>
                  <Input 
                    id="username" 
                    value={newUser.username} 
                    onChange={e => setNewUser({...newUser, username: e.target.value})}
                    placeholder="johndoe" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email*</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={newUser.email} 
                    onChange={e => setNewUser({...newUser, email: e.target.value})}
                    placeholder="john.doe@example.com" 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe*</Label>
                <Input 
                  id="password" 
                  type="password"
                  value={newUser.password} 
                  onChange={e => setNewUser({...newUser, password: e.target.value})}
                  placeholder="********" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Rôle</Label>
                  <Select 
                    value={newUser.role}
                    onValueChange={value => setNewUser({...newUser, role: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrateur</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="editor">Éditeur</SelectItem>
                      <SelectItem value="owner">Propriétaire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tenantId">Tenant</Label>
                  <Select 
                    value={newUser.tenantId}
                    onValueChange={value => setNewUser({...newUser, tenantId: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un tenant" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucun (Superadmin)</SelectItem>
                      {tenants.map(tenant => (
                        <SelectItem key={tenant.id} value={tenant.id}>{tenant.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreating(false)}>Annuler</Button>
                <Button onClick={handleCreateUser}>Créer</Button>
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
            <div>
              <Input
                placeholder="Rechercher par nom ou email"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Select 
                value={selectedTenant}
                onValueChange={setSelectedTenant}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les tenants" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les tenants</SelectItem>
                  <SelectItem value="null">Aucun (Superadmin)</SelectItem>
                  {tenants.map(tenant => (
                    <SelectItem key={tenant.id} value={tenant.id}>{tenant.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select 
                value={selectedRole}
                onValueChange={setSelectedRole}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les rôles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les rôles</SelectItem>
                  <SelectItem value="superadmin">Superadmin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="editor">Éditeur</SelectItem>
                  <SelectItem value="owner">Propriétaire</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Liste des Utilisateurs ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Chargement...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-4">Aucun utilisateur trouvé.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom d'utilisateur</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Dernière connexion</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map(user => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="capitalize">{user.role}</TableCell>
                    <TableCell>{user.Tenant?.name || (user.tenantId === null ? 'Superadmin' : '-')}</TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? "success" : "destructive"}>
                        {user.isActive ? "Actif" : "Inactif"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(user.lastLogin)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetails(user)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Détails
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Éditer
                        </Button>
                        <Button 
                          variant={user.isActive ? "destructive" : "default"} 
                          size="sm"
                          onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                        >
                          <UserCog className="h-4 w-4 mr-1" />
                          {user.isActive ? 'Désactiver' : 'Activer'}
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

      {/* Modal d'édition d'utilisateur */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-username">Nom d'utilisateur</Label>
                <Input 
                  id="edit-username" 
                  value={editUserData.username} 
                  onChange={e => setEditUserData({...editUserData, username: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input 
                  id="edit-email" 
                  type="email"
                  value={editUserData.email} 
                  onChange={e => setEditUserData({...editUserData, email: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-role">Rôle</Label>
                <Select 
                  value={editUserData.role}
                  onValueChange={value => setEditUserData({...editUserData, role: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="superadmin">Superadmin</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="editor">Éditeur</SelectItem>
                    <SelectItem value="customer">Client</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-tenant">Tenant</Label>
                <Select 
                  value={editUserData.tenantId || 'none'}
                  onValueChange={value => setEditUserData({...editUserData, tenantId: value === 'none' ? '' : value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un tenant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun (Superadmin)</SelectItem>
                    {tenants.map(tenant => (
                      <SelectItem key={tenant.id} value={tenant.id}>{tenant.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditing(false)}>Annuler</Button>
              <Button onClick={handleUpdateUser}>Enregistrer</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de détails utilisateur */}
      <Dialog open={isViewingDetails} onOpenChange={setIsViewingDetails}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Détails de l'utilisateur</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-bold">ID</Label>
                  <p>{selectedUser.id}</p>
                </div>
                <div>
                  <Label className="font-bold">Statut</Label>
                  <Badge variant={selectedUser.isActive ? "success" : "destructive"}>
                    {selectedUser.isActive ? "Actif" : "Inactif"}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-bold">Nom d'utilisateur</Label>
                  <p>{selectedUser.username}</p>
                </div>
                <div>
                  <Label className="font-bold">Email</Label>
                  <p>{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-bold">Rôle</Label>
                  <p className="capitalize">{selectedUser.role}</p>
                </div>
                <div>
                  <Label className="font-bold">Tenant</Label>
                  <p>{selectedUser.Tenant?.name || (selectedUser.tenantId === null ? 'Superadmin' : '-')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-bold">Date de création</Label>
                  <p>{formatDate(selectedUser.createdAt)}</p>
                </div>
                <div>
                  <Label className="font-bold">Dernière connexion</Label>
                  <p>{formatDate(selectedUser.lastLogin)}</p>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsViewingDetails(false)}>Fermer</Button>
                <Button onClick={() => {
                  setIsViewingDetails(false);
                  handleEditUser(selectedUser);
                }}>Éditer</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 