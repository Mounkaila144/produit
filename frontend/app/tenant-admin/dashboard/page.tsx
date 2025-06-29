'use client';

import useTenant from '@/hooks/useTenant';
import useFetch from '@/hooks/useFetch';
import { productService, tenantService } from '@/services';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Users, ShoppingCart, CreditCard, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { buildImageUrl } from '@/lib/utils';

export default function DashboardPage() {
  const { tenant } = useTenant();
  
  // Récupération des statistiques
  const { data: stats, isLoading: statsLoading } = useFetch(
    () => tenantService.getTenantStats(),
    { skip: !tenant }
  );

  // Récupération des produits récents
  const { data: recentProducts, isLoading: productsLoading } = useFetch(
    () => productService.getProducts({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
    { skip: !tenant }
  );

  if (statsLoading || productsLoading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec informations du tenant */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{tenant.name}</h1>
          <p className="text-muted-foreground">{tenant.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Plan: {tenant.getPlanName()}
          </span>
          <span className="text-sm text-muted-foreground">
            Statut: {tenant.getStatusName()}
          </span>
        </div>
      </div>

      {/* Alertes */}
      {tenant.isNearExpiration && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertCircle className="h-5 w-5" />
            <p>
              Votre abonnement expire dans{' '}
              {formatDistanceToNow(new Date(tenant.expirationDate!), {
                locale: fr,
              })}
            </p>
          </div>
        </div>
      )}

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produits</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
            <p className="text-xs text-muted-foreground">
              Produits actifs dans votre boutique
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Utilisateurs actifs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">
              Commandes ce mois-ci
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'CFA',
              }).format(stats?.monthlyRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Revenus ce mois-ci
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Produits récents */}
      <Card>
        <CardHeader>
          <CardTitle>Produits récents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentProducts?.items.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  {product.images && Array.isArray(product.images) && product.images.length > 0 && (
                    <img
                      src={buildImageUrl(product.images[0], tenant?.id)}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded"
                      onError={(e) => {
                        console.log(`❌ Erreur image dashboard ${product.name}:`, product.images[0]);
                        (e.target as HTMLImageElement).src = 'https://placehold.co/48x48?text=No+Image';
                      }}
                    />
                  )}
                  <div>
                    <h3 className="font-medium">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'CFA',
                      }).format(product.price)}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Stock: {product.stock}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 