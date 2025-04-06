'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

/**
 * Hook personnalisé pour récupérer le tenant ID de différentes sources
 * Ordre de priorité: session > localStorage
 */
export const useTenantId = () => {
  const { data: session } = useSession();
  const [tenantId, setTenantId] = useState<string | null>(null);

  useEffect(() => {
    const getTenantId = () => {
      // 1. Vérifier la session
      if (session?.user?.tenantId) {
        setTenantId(session.user.tenantId);
        return;
      }

      // 2. Vérifier localStorage
      if (typeof window !== 'undefined') {
        // Essayer d'abord tenantId puis adminTenantId
        const localTenantId = localStorage.getItem('tenantId') || 
                             localStorage.getItem('adminTenantId');
        
        if (localTenantId) {
          setTenantId(localTenantId);
          return;
        }
      }

      // Aucun tenant ID trouvé
      setTenantId(null);
    };

    getTenantId();
  }, [session]);

  // Retourner un objet structuré, même si tenantId est null
  return { 
    tenantId, 
    setTenantId: (id: string | null) => setTenantId(id) 
  };
};

export default useTenantId; 