import { apiService } from './api';

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  status?: 'active' | 'inactive' | 'pending' | 'suspended';
  active?: boolean;
  plan: string;
  usersCount?: number;
  createdAt: string;
  expiresAt: string;
  storageUsed?: number;
  storageLimit?: number;
  features?: Record<string, boolean>;
  owner?: {
    id: string;
    name?: string;
    email: string;
    username?: string;
  };
  subscription?: {
    id: string;
    plan: string;
    status: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
  };
  payments?: {
    id: string;
    amount: number;
    status: string;
    date: string;
  }[];
  statistics?: {
    dailyActiveUsers: number;
    monthlyActiveUsers: number;
    totalUsers: number;
    totalProducts: number;
    totalOrders: number;
    revenueLastMonth: number;
    revenueThisMonth: number;
  };
}

interface TenantsResponse {
  success: boolean;
  count: number;
  data: Tenant[];
}

interface TenantResponse {
  tenant: Tenant;
}

const tenantService = {
  // Récupérer tous les tenants pour le super admin
  getAllTenants: (): Promise<TenantsResponse> => 
    apiService.get<TenantsResponse>('/superadmin/tenants'),
  
  // Récupérer un tenant spécifique pour le super admin
  getTenant: (id: string): Promise<TenantResponse> => 
    apiService.get<TenantResponse>(`/superadmin/tenants/${id}`),
  
  // Créer un nouveau tenant
  createTenant: (tenantData: Partial<Tenant>): Promise<TenantResponse> => 
    apiService.post<TenantResponse>('/superadmin/tenants', tenantData),
  
  // Mettre à jour un tenant existant
  updateTenant: (id: string, tenantData: Partial<Tenant>): Promise<TenantResponse> => {
    // Vérifier les données à envoyer en console
    console.log("Données avant transformation:", tenantData);
    
    // Préparer les données à envoyer, en ne gardant que les champs attendus par le backend
    // Attention à bien utiliser planType (backend) et non plan (frontend)
    const backendData: Record<string, any> = {};
    
    // Copier les champs un par un pour s'assurer qu'ils sont correctement nommés
    if (tenantData.name !== undefined) backendData.name = tenantData.name || '';
    if (tenantData.description !== undefined) backendData.description = tenantData.description || '';
    if (tenantData.domain !== undefined) backendData.domain = tenantData.domain || '';
    if (tenantData.plan !== undefined) backendData.planType = tenantData.plan; // Conversion de plan à planType
    if (tenantData.status !== undefined) backendData.active = tenantData.status === 'active'; // Conversion de status à active
    
    // Traiter contactInfo spécialement
    if (tenantData.contactInfo !== undefined) {
      if (typeof tenantData.contactInfo === 'object' && tenantData.contactInfo !== null) {
        backendData.contactInfo = tenantData.contactInfo;
      } else if (tenantData.contactInfo === null || tenantData.contactInfo === undefined) {
        backendData.contactInfo = {};
      } else {
        // Si c'est une chaîne, essayer de la parser en JSON
        try {
          backendData.contactInfo = JSON.parse(tenantData.contactInfo as string);
        } catch (e) {
          backendData.contactInfo = {}; // Fallback si parsing échoue
        }
      }
    }
    
    console.log("Données transformées envoyées au backend:", backendData);
    
    return apiService.put<TenantResponse>(`/superadmin/tenants/${id}`, backendData);
  },
  
  // Mettre à jour le statut d'un tenant
  updateTenantStatus: (id: string, status: 'active' | 'inactive' | 'pending' | 'suspended'): Promise<TenantResponse> => 
    apiService.put<TenantResponse>(`/superadmin/tenants/${id}/status`, { status }),
  
  // Activer un tenant
  activateTenant: (id: string): Promise<TenantResponse> => 
    apiService.put<TenantResponse>(`/superadmin/tenants/${id}/enable`, {}),
  
  // Désactiver un tenant
  deactivateTenant: (id: string): Promise<TenantResponse> => 
    apiService.put<TenantResponse>(`/superadmin/tenants/${id}/disable`, {}),
  
  // Renouveler l'abonnement d'un tenant
  renewSubscription: (id: string, plan?: string, expirationDate?: string): Promise<TenantResponse> => {
    // Préparer les données pour le renouvellement
    const renewalData: Record<string, any> = {};
    
    // Si un plan est spécifié, l'utiliser (planType dans le backend)
    if (plan) {
      renewalData.planType = plan;
    }
    
    // Utiliser la date d'expiration fournie ou définir une nouvelle date pour 1 an
    if (expirationDate) {
      // S'assurer que la date est au format ISO string pour le backend
      renewalData.expiresAt = new Date(expirationDate).toISOString();
    } else {
      // Par défaut, on renouvelle pour 1 an
      const renewalDate = new Date();
      renewalDate.setFullYear(renewalDate.getFullYear() + 1);
      renewalData.expiresAt = renewalDate.toISOString();
    }
    
    console.log("Données de renouvellement d'abonnement:", renewalData);
    console.log("URL de l'appel:", `/superadmin/tenants/${id}/renew`);
    
    // S'assurer que la requête est envoyée correctement avec tous les paramètres
    return apiService.put<TenantResponse>(`/superadmin/tenants/${id}/renew`, renewalData);
  },
  
  // Récupérer les statistiques d'un tenant
  getTenantStats: (id: string): Promise<any> => 
    apiService.get<any>(`/superadmin/tenants/${id}/stats`),
  
  // Supprimer un tenant
  deleteTenant: (id: string): Promise<void> => 
    apiService.delete<void>(`/superadmin/tenants/${id}`),
    
  // Récupérer le tenant courant (pour les utilisateurs du tenant)
  getCurrentTenant: (): Promise<Tenant> => {
    // Cette méthode est utilisée par le TenantContext pour charger les informations
    // du tenant actuel basé sur le tenantId stocké dans localStorage
    const tenantId = typeof window !== 'undefined' ? localStorage.getItem('tenantId') : null;
    
    if (!tenantId) {
      return Promise.reject(new Error('Aucun ID de tenant trouvé'));
    }

    // Vérifier si l'ID du tenant est "Login", ce qui n'est pas un ID valide
    if (tenantId === 'Login' || tenantId === 'login') {
      // Supprimer cet ID incorrect du localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('tenantId');
      }
      return Promise.reject(new Error('ID de tenant invalide'));
    }
    
    return apiService.get<Tenant>(`/tenant-admin/${tenantId}`);
  },
  
  // Récupérer le profil du tenant par son domaine
  getTenantByDomain: (domain: string): Promise<Tenant> => 
    apiService.get<Tenant>(`/tenant-admin/domain/${domain}`),
  
  // Assigner un propriétaire à un tenant
  assignOwner: (id: string, userId: string): Promise<TenantResponse> => 
    apiService.post<TenantResponse>(`/superadmin/tenants/${id}/owner`, { userId }),
};

export default tenantService; 