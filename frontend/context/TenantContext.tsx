"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import tenantService, { Tenant } from '../services/tenants';

interface TenantContextType {
  tenant: Tenant | null;
  isLoading: boolean;
  error: string | null;
  setCurrentTenant: (tenantId: string) => void;
  clearTenant: () => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Récupérer l'ID du tenant depuis localStorage (défini par l'intercepteur Axios)
    const tenantId = typeof window !== 'undefined' ? localStorage.getItem('tenantId') : null;
    
    if (tenantId) {
      loadTenant();
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadTenant = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const tenantData = await tenantService.getCurrentTenant();
      setTenant(tenantData);
    } catch (err) {
      console.error('Erreur lors du chargement du tenant:', err);
      setError('Impossible de charger les informations du tenant.');
      // Si le tenant n'existe pas ou est inaccessible, effacer l'ID du tenant
      if (typeof window !== 'undefined') {
        localStorage.removeItem('tenantId');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const setCurrentTenant = (tenantId: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tenantId', tenantId);
      loadTenant();
    }
  };

  const clearTenant = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tenantId');
    }
    setTenant(null);
  };

  return (
    <TenantContext.Provider value={{
      tenant,
      isLoading,
      error,
      setCurrentTenant,
      clearTenant
    }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant doit être utilisé à l\'intérieur d\'un TenantProvider');
  }
  return context;
};

export default TenantContext; 