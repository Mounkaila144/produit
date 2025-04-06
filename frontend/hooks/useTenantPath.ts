'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Hook personnalisé pour extraire le path du tenant depuis l'URL
 * Fonctionne avec les URLs du format http://localhost:3000/[tenant]
 */
export const useTenantPath = () => {
  const pathname = usePathname();
  const [tenantPath, setTenantPath] = useState<string | null>(null);

  useEffect(() => {
    if (pathname) {
      // Extraire le premier segment après la racine
      const segments = pathname.split('/').filter(Boolean);
      
      if (segments.length > 0) {
        // Le premier segment est le tenant
        setTenantPath(segments[0]);
      }
    }
  }, [pathname]);

  return {
    tenantPath,
    // Pour faciliter la migration
    tenant: tenantPath,
    // Pour la compatibilité avec l'ancien système
    tenantId: tenantPath 
  };
};

export default useTenantPath; 