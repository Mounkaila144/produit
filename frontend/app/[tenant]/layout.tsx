'use client';

import { ReactNode, useEffect, useState } from 'react';
import { TenantService, Tenant } from '@/services/tenant.service';
import { notFound } from 'next/navigation';

export default function TenantLayout({ 
  children,
  params 
}: { 
  children: ReactNode,
  params: { tenant: string } 
}) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadTenant = async () => {
      setLoading(true);
      
      try {
        // Utiliser le paramètre de route pour charger le tenant
        const tenantData = await TenantService.getTenantByPath(params.tenant);
        setTenant(tenantData);
      } catch (error) {
        console.error('Erreur lors du chargement du tenant:', error);
        setTenant(null);
      } finally {
        setLoading(false);
      }
    };

    loadTenant();
  }, [params.tenant]);

  // Afficher une page non trouvée si le tenant n'existe pas
  if (!loading && !tenant) {
    return notFound();
  }

  // Log pour débug
  useEffect(() => {
    console.log('TenantLayout: Tenant Path actuel:', params.tenant);
    console.log('TenantLayout: Données du tenant:', tenant);
  }, [params.tenant, tenant]);
  
  // Pour simplifier, on retourne directement les enfants
  return (
    <div className="tenant-layout">
      {/* Contenu principal */}
      <main>
        {loading ? (
          <div className="flex justify-center items-center min-h-[50vh]">
            <p className="text-xl">Chargement de la boutique...</p>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
} 