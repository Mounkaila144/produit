'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, XCircle } from 'lucide-react';
import tenantService from '@/services/tenants';

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
  loginHistory?: {
    timestamp: string;
    ipAddress: string;
    userAgent: string;
    success: boolean;
  }[];
  tenant?: {
    name: string;
  };
}

interface Permission {
  id: string;
  name: string;
  description: string;
  isGranted: boolean;
}

export default function UserDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [tenants, setTenants] = useState<{id: string, name: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  
  // État pour l'édition de l'utilisateur
  const [editUser, setEditUser] = useState({
    username: '',
    email: '',
    role: '',
    tenantId: ''
  });
  
  // État pour le changement de mot de passe
  const [passwordChange, setPasswordChange] = useState({
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    loadUser();
    loadTenants();
    loadPermissions();
  }, [params.id]);

  const loadUser = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/superadmin/users/${params.id}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des informations de l\'utilisateur');
      }
      
      const data = await response.json();
      setUser(data.user);
      
      // Initialiser les données d'édition
      setEditUser({
        username: data.user.username,
        email: data.user.email,
        role: data.user.role,
        tenantId: data.user.tenantId || ''
      });
    } catch (error) {
      console.error('Erreur lors du chargement de l\'utilisateur:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de charger les informations de l\'utilisateur.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadTenants = async () => {
    try {
      const response = await tenantService.getAllTenants();
      setTenants(response.tenants.map((tenant: any) => ({
        id: tenant.id,
        name: tenant.name
      })) || []);
    } catch (error) {
      console.error('Erreur lors du chargement des tenants:', error);
    }
  };

  const loadPermissions = async () => {
    try {
      const response = await fetch(`/api/superadmin/users/${params.id}/permissions`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des permissions');
      }
      
      const data = await response.json();
      setPermissions(data.permissions || []);
    } catch (error) {
      console.error('Erreur lors du chargement des permissions:', error);
    }
  };

  const handleUpdateUser = async () => {
    setIsSaving(true);
    try {
      // Préparer les données pour l'API
      const updateData = {
        ...editUser,
        // Si tenantId est "none", on l'envoie comme null
        tenantId: editUser.tenantId === 'none' ? null : editUser.tenantId
      };

      const response = await fetch(`/api/superadmin/users/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la mise à jour de l\'utilisateur');
      }
      
      toast({
        title: 'Succès',
        description: 'Informations de l\'utilisateur mises à jour avec succès.'
      });
      
      // Recharger les informations de l'utilisateur
      loadUser();
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de mettre à jour l\'utilisateur.'
      });
    }
  };

  const handleChangePassword = async () => {
    try {
      // Validation des champs
      if (!passwordChange.password) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Veuillez saisir un mot de passe.'
        });
        return;
      }
      
      if (passwordChange.password !== passwordChange.confirmPassword) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Les mots de passe ne correspondent pas.'
        });
        return;
      }
      
      const response = await fetch(`/api/superadmin/users/${params.id}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: passwordChange.password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors du changement de mot de passe');
      }
      
      toast({
        title: 'Succès',
        description: 'Mot de passe modifié avec succès.'
      });
      
      // Réinitialiser le formulaire et fermer la boîte de dialogue
      setPasswordChange({
        password: '',
        confirmPassword: ''
      });
      setIsChangingPassword(false);
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de changer le mot de passe.'
      });
    }
  };

  const handleTogglePermission = async (permissionId: string, isGranted: boolean) => {
    try {
      const action = isGranted ? 'revoke' : 'grant';
      const response = await fetch(`/api/superadmin/users/${params.id}/permissions/${permissionId}/${action}`, {
        method: 'PUT'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erreur lors de la ${isGranted ? 'révocation' : 'attribution'} de la permission`);
      }
      
      toast({
        title: 'Succès',
        description: `Permission ${isGranted ? 'révoquée' : 'attribuée'} avec succès.`
      });
      
      // Mettre à jour l'état local des permissions
      setPermissions(prevPermissions => 
        prevPermissions.map(perm => 
          perm.id === permissionId ? { ...perm, isGranted: !isGranted } : perm
        )
      );
    } catch (error) {
      console.error('Erreur lors de la modification des permissions:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de modifier les permissions.'
      });
    }
  };

  const handleToggleUserStatus = async () => {
    if (!user) return;
    
    try {
      const action = user.isActive ? 'disable' : 'enable';
      const response = await fetch(`/api/superadmin/users/${params.id}/${action}`, {
        method: 'PUT'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erreur lors de la ${user.isActive ? 'désactivation' : 'activation'} de l'utilisateur`);
      }
      
      toast({
        title: 'Succès',
        description: `L'utilisateur a été ${user.isActive ? 'désactivé' : 'activé'} avec succès.`
      });
      
      // Mettre à jour l'état local
      setUser(prev => prev ? { ...prev, isActive: !prev.isActive } : null);
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

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-8">Chargement...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold mb-4">Utilisateur non trouvé</h1>
          <Button onClick={() => router.push('/super-admin/users')}>
            Retour à la liste des utilisateurs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => router.push('/super-admin/users')}
          >
            Retour
          </Button>
          <h1 className="text-2xl font-bold">Détails de l&apos;utilisateur: {user.username}</h1>
          <Badge variant={user.isActive ? "success" : "destructive"}>
            {user.isActive ? "Actif" : "Inactif"}
          </Badge>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant={user.isActive ? "destructive" : "default"}
            onClick={handleToggleUserStatus}
          >
            {user.isActive ? 'Désactiver' : 'Activer'}
          </Button>
          <Dialog open={isChangingPassword} onOpenChange={setIsChangingPassword}>
            <DialogTrigger asChild>
              <Button variant="outline">Changer le mot de passe</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Changer le mot de passe</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Nouveau mot de passe</Label>
                  <Input 
                    id="password" 
                    type="password"
                    value={passwordChange.password}
                    onChange={e => setPasswordChange({...passwordChange, password: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password"
                    value={passwordChange.confirmPassword}
                    onChange={e => setPasswordChange({...passwordChange, confirmPassword: e.target.value})}
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <Button variant="outline" onClick={() => setIsChangingPassword(false)}>Annuler</Button>
                  <Button onClick={handleChangePassword}>Enregistrer</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="activity">Activité</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Informations de l&apos;utilisateur</CardTitle>
              <CardDescription>
                Informations générales sur l&apos;utilisateur et son accès à la plateforme.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="username">Nom d&apos;utilisateur</Label>
                      <Input 
                        id="username" 
                        value={editUser.username}
                        onChange={e => setEditUser({...editUser, username: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email"
                        value={editUser.email}
                        onChange={e => setEditUser({...editUser, email: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Rôle</Label>
                      <Select 
                        value={editUser.role}
                        onValueChange={value => setEditUser({...editUser, role: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir un rôle" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="superadmin">Superadmin</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="editor">Éditeur</SelectItem>
                          <SelectItem value="owner">Propriétaire</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tenantId">Tenant</Label>
                      <Select 
                        value={editUser.tenantId}
                        onValueChange={value => setEditUser({...editUser, tenantId: value})}
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
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>Annuler</Button>
                    <Button onClick={handleUpdateUser}>Enregistrer</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Nom d&apos;utilisateur</p>
                      <p className="text-base">{user.username}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                      <p className="text-base">{user.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Rôle</p>
                      <p className="text-base capitalize">{user.role}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tenant</p>
                      <p className="text-base">{user.tenant?.name || (user.tenantId === null ? 'Superadmin' : '-')}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Date de création</p>
                      <p className="text-base">{formatDate(user.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Dernière modification</p>
                      <p className="text-base">{formatDate(user.updatedAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Dernière connexion</p>
                      <p className="text-base">{formatDate(user.lastLogin)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Statut</p>
                      <Badge variant={user.isActive ? "success" : "destructive"}>
                        {user.isActive ? "Actif" : "Inactif"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={() => setIsEditing(true)}>Modifier</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Historique de connexion</CardTitle>
              <CardDescription>
                Historique des tentatives de connexion de l&apos;utilisateur
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!user.loginHistory || user.loginHistory.length === 0 ? (
                <div className="text-center py-4">Aucun historique de connexion disponible.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Adresse IP</TableHead>
                      <TableHead>Navigateur</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user.loginHistory.map((entry, index) => (
                      <TableRow key={index}>
                        <TableCell>{formatDate(entry.timestamp)}</TableCell>
                        <TableCell>{entry.ipAddress}</TableCell>
                        <TableCell className="max-w-xs truncate">{entry.userAgent}</TableCell>
                        <TableCell>
                          {entry.success ? (
                            <Badge variant="success" className="flex items-center">
                              <CheckCircle className="w-4 h-4 mr-1" /> Succès
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="flex items-center">
                              <XCircle className="w-4 h-4 mr-1" /> Échec
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="permissions">
          <Card>
            <CardHeader>
              <CardTitle>Permissions</CardTitle>
              <CardDescription>
                Gérer les permissions spécifiques de l&apos;utilisateur
              </CardDescription>
            </CardHeader>
            <CardContent>
              {permissions.length === 0 ? (
                <div className="text-center py-4">Aucune permission définie pour ce rôle.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Permission</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {permissions.map(permission => (
                      <TableRow key={permission.id}>
                        <TableCell className="font-medium">{permission.name}</TableCell>
                        <TableCell>{permission.description}</TableCell>
                        <TableCell>
                          <Badge variant={permission.isGranted ? "success" : "secondary"}>
                            {permission.isGranted ? "Accordée" : "Non accordée"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant={permission.isGranted ? "destructive" : "default"} 
                            size="sm"
                            onClick={() => handleTogglePermission(permission.id, permission.isGranted)}
                          >
                            {permission.isGranted ? 'Révoquer' : 'Accorder'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 