import { useTenant as useContextTenant } from '@/context/TenantContext';
import { useAuth } from '@/context/AuthContext';

/**
 * Hook personnalisé pour accéder aux informations du tenant avec des fonctionnalités supplémentaires
 */
const useTenant = () => {
  const tenantContext = useContextTenant();
  const { user } = useAuth();

  // Vérifier si l'utilisateur est le propriétaire du tenant
  const isOwner = !!user && !!tenantContext.tenant && user.id === tenantContext.tenant.ownerId;
  
  // Vérifier si le tenant est actif
  const isActive = !!tenantContext.tenant && tenantContext.tenant.status === 'ACTIVE';
  
  // Vérifier si le tenant est proche de l'expiration (moins de 7 jours)
  const isNearExpiration = !!tenantContext.tenant && tenantContext.tenant.expirationDate && 
    (new Date(tenantContext.tenant.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24) < 7;
  
  // Vérifier si le tenant a expiré
  const isExpired = !!tenantContext.tenant && tenantContext.tenant.expirationDate && 
    new Date(tenantContext.tenant.expirationDate) < new Date();
  
  // Récupérer le nom du plan en français
  const getPlanName = () => {
    if (!tenantContext.tenant) return '';
    
    switch (tenantContext.tenant.plan) {
      case 'FREE':
        return 'Gratuit';
      case 'BASIC':
        return 'Basique';
      case 'PREMIUM':
        return 'Premium';
      case 'ENTERPRISE':
        return 'Entreprise';
      default:
        return tenantContext.tenant.plan;
    }
  };
  
  // Récupérer le statut du tenant en français
  const getStatusName = () => {
    if (!tenantContext.tenant) return '';
    
    switch (tenantContext.tenant.status) {
      case 'ACTIVE':
        return 'Actif';
      case 'INACTIVE':
        return 'Inactif';
      case 'SUSPENDED':
        return 'Suspendu';
      default:
        return tenantContext.tenant.status;
    }
  };
  
  return {
    ...tenantContext,
    isOwner,
    isActive,
    isNearExpiration,
    isExpired,
    getPlanName,
    getStatusName,
  };
};

export default useTenant; 