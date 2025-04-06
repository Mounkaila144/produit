'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Building2, Edit } from 'lucide-react';
import { apiService } from '@/services/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tenant as TenantServiceInterface } from '@/services/tenant.service';
import tenantService from '@/services/tenants';

// Type étendu pour le tenant avec des champs supplémentaires
interface ExtendedTenant {
  id?: string;
  name?: string;
  domain?: string;
  description?: string;
  contactInfo?: {
    email: string;
    phone: string;
  } | string;
}

// Interface pour la réponse d'API
interface TenantApiResponse {
  success?: boolean;
  data?: {
    id: string;
    name: string;
    domain: string;
    description?: string;
    contactInfo?: any;
    [key: string]: any;
  };
  [key: string]: any;
}

export default function SettingsPage() {
  // État pour les données du tenant
  const [tenant, setTenant] = useState<ExtendedTenant>({
    name: '',
    domain: '',
    description: '',
    contactInfo: {
      email: '',
      phone: ''
    }
  });
  
  // État pour le chargement et la soumission
  const [isLoadingTenant, setIsLoadingTenant] = useState(true);
  const [isSubmittingTenant, setIsSubmittingTenant] = useState(false);
  
  // État pour le modal d'édition
  const [isEditing, setIsEditing] = useState(false);
  const [editedTenant, setEditedTenant] = useState<ExtendedTenant>({});
  
  // Charger les données du tenant au chargement de la page
  useEffect(() => {
    console.log("**** useEffect de la page settings s'exécute ****");
    const loadTenantData = async () => {
      console.log("**** Fonction loadTenantData s'exécute ****");
      try {
        setIsLoadingTenant(true);
        
        if (typeof window !== 'undefined') {
          const tenantId = localStorage.getItem('tenantId');
          console.log("**** Tenant ID récupéré depuis localStorage:", tenantId, " ****");
          
          if (tenantId) {
            console.log("Récupération des données du tenant avec ID:", tenantId);
            
            try {
              // Récupérer les données du tenant directement via l'API
              console.log("**** Utilisation de l'API directe avec la route /tenant/profile ****");
              const response = await apiService.get<TenantApiResponse>('/tenant/profile');
              console.log("Réponse du serveur (tenant):", response);
              
              if (response && response.data) {
                const tenantData = response.data;
                
                // Traitement de contactInfo
                let contactInfo = {
                  email: '',
                  phone: ''
                };
                
                if (tenantData.contactInfo) {
                  if (typeof tenantData.contactInfo === 'string') {
                    try {
                      contactInfo = JSON.parse(tenantData.contactInfo);
                    } catch (e) {
                      console.error('Erreur lors du parsing de contactInfo:', e);
                    }
                  } else if (typeof tenantData.contactInfo === 'object') {
                    contactInfo = tenantData.contactInfo as any;
                  }
                }
                
                const loadedTenant = {
                  id: tenantData.id,
                  name: tenantData.name,
                  domain: tenantData.domain,
                  description: tenantData.description || '',
                  contactInfo
                };
                
                setTenant(loadedTenant);
                setEditedTenant(loadedTenant);
              }
            } catch (apiError) {
              console.error("Erreur API lors de la récupération du tenant:", apiError);
              toast.error('Impossible de récupérer les informations du tenant');
            }
          } else {
            toast.error('ID du tenant non trouvé');
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données du tenant:', error);
        toast.error('Impossible de charger les informations du tenant');
      } finally {
        setIsLoadingTenant(false);
      }
    };
    
    loadTenantData();
  }, []);
  
  // Soumettre les modifications du tenant
  const handleTenantSubmit = async () => {
    if (!tenant.id) {
      toast.error('ID du tenant manquant');
      return;
    }
    
    try {
      setIsSubmittingTenant(true);
      
      // Préparer les données à envoyer
      const tenantData: ExtendedTenant = {
        name: editedTenant.name,
        domain: editedTenant.domain,
        description: editedTenant.description,
        contactInfo: editedTenant.contactInfo
      };
      
      console.log("Envoi des données du tenant:", tenantData);
      
      // Utiliser l'API directement pour la mise à jour
      try {
        const updateResponse = await apiService.put('/tenant/profile', tenantData);
        console.log("Réponse de mise à jour du tenant:", updateResponse);
        setTenant(editedTenant);
        setIsEditing(false);
        toast.success('Informations de la boutique mises à jour avec succès');
      } catch (apiError) {
        console.error("Erreur API lors de la mise à jour du tenant:", apiError);
        toast.error('Échec de la mise à jour des informations de la boutique');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du tenant:', error);
      toast.error('Échec de la mise à jour des informations de la boutique');
    } finally {
      setIsSubmittingTenant(false);
    }
  };
  
  const handleEditClick = () => {
    setEditedTenant(tenant);
    setIsEditing(true);
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Paramètres</h1>
        <p className="text-gray-500">Gérez les informations de votre boutique</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            <span>Informations de la boutique</span>
          </CardTitle>
          <CardDescription>Consultez et modifiez les informations principales de votre boutique</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {isLoadingTenant ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nom de la boutique</Label>
                  <div className="font-medium">{tenant.name || '-'}</div>
                </div>
                
                <div className="space-y-2">
                  <Label>Domaine</Label>
                  <div className="font-medium">{tenant.domain || '-'}</div>
                  <p className="text-sm text-gray-500">
                    Votre boutique est accessible à l'adresse: {tenant.domain ? `${tenant.domain}.votre-domaine.com` : '-'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Description</Label>
                <div className="font-medium">{tenant.description || '-'}</div>
              </div>
              
              <Separator className="my-4" />
              
              <h3 className="text-lg font-medium">Informations de contact</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email de contact</Label>
                  <div className="font-medium">{typeof tenant.contactInfo === 'object' ? tenant.contactInfo?.email || '-' : '-'}</div>
                </div>
                
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <div className="font-medium">{typeof tenant.contactInfo === 'object' ? tenant.contactInfo?.phone || '-' : '-'}</div>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <Button 
                  onClick={handleEditClick}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Modifier les informations
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Dialog pour éditer le tenant */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier {tenant.name}</DialogTitle>
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
              <Textarea
                id="edit-description"
                value={editedTenant.description || ''}
                onChange={e => setEditedTenant({...editedTenant, description: e.target.value})}
                className="mt-1"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-contactEmail">Email de contact</Label>
                <Input
                  id="edit-contactEmail"
                  type="email"
                  placeholder="contact@example.com"
                  value={typeof editedTenant.contactInfo === 'object' ? editedTenant.contactInfo?.email || '' : ''}
                  onChange={e => setEditedTenant({
                    ...editedTenant, 
                    contactInfo: {
                      email: e.target.value,
                      phone: typeof editedTenant.contactInfo === 'object' ? editedTenant.contactInfo?.phone || '' : ''
                    }
                  })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-contactPhone">Téléphone de contact</Label>
                <Input
                  id="edit-contactPhone"
                  placeholder="+33123456789"
                  value={typeof editedTenant.contactInfo === 'object' ? editedTenant.contactInfo?.phone || '' : ''}
                  onChange={e => setEditedTenant({
                    ...editedTenant, 
                    contactInfo: {
                      email: typeof editedTenant.contactInfo === 'object' ? editedTenant.contactInfo?.email || '' : '',
                      phone: e.target.value
                    }
                  })}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(false)}
              >
                Annuler
              </Button>
              <Button 
                onClick={handleTenantSubmit}
                disabled={isSubmittingTenant}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isSubmittingTenant ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 