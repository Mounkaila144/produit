'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  ShoppingCart,
  Users,
  Package,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Plus,
  Clock,
  FileText,
  RefreshCw
} from 'lucide-react';
import dashboardService, { DashboardStats, RecentActivity, TopProduct } from '@/services/dashboard';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      if (isRefreshing) {
        toast({
          title: 'Actualisation',
          description: 'Les données sont en cours d\'actualisation.',
        });
      } else {
        setIsLoading(true);
      }
      
      // Charger les données du tableau de bord depuis l'API
      const [dashboardStats, recentActivities, topSellingProducts] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRecentActivities(3),
        dashboardService.getTopProducts(3)
      ]);

      setStats(dashboardStats);
      setActivities(recentActivities);
      setTopProducts(topSellingProducts);
      
      if (isRefreshing) {
        toast({
          title: 'Actualisation terminée',
          description: 'Les données ont été mises à jour.',
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données du tableau de bord:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de charger les données du tableau de bord.'
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [toast]);

  // Fonction pour actualiser les données
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardData();
  };

  // Calculer l'évolution des revenus en pourcentage (simulé pour l'instant)
  const calculateRevenueTrend = () => {
    return { value: 5, isPositive: true };
  };

  const revenueTrend = calculateRevenueTrend();

  // Formater la date
  const formatDate = (dateString: string) => {
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
      <div className="flex flex-col items-center justify-center h-64 animate-fade-in">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Chargement des données du tableau de bord...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <Button 
          variant="subtle"
          size="sm"
          onClick={handleRefresh}
          loading={isRefreshing}
          icon={<RefreshCw className="h-4 w-4" />}
        >
          Actualiser
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-elevation">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produits</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
            <p className="text-xs text-muted-foreground">
              Produits dans votre catalogue
            </p>
          </CardContent>
        </Card>
        
        <Card className="card-elevation">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Catégories</CardTitle>
            <BarChart className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCategories || 0}</div>
            <p className="text-xs text-muted-foreground">
              Base de catalogue
            </p>
          </CardContent>
        </Card>
        
        <Card className="card-elevation">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <div className="flex items-center space-x-1 text-xs">
              <span className="text-muted-foreground">utilisateurs inscrits</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-elevation">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Statistiques</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3 éléments</div>
            <div className="flex items-center space-x-1 text-xs">
              <span className="text-muted-foreground">vues dans le dashboard</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="card">
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
            <CardDescription>
              Les dernières actions effectuées sur la plateforme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4 hover:bg-muted/50 p-2 rounded-md transition-colors">
                    <div className="p-2 rounded-full bg-primary/10">
                      {activity.type === 'product_added' && <Plus className="h-5 w-5 text-green-600" />}
                      {activity.type === 'order_placed' && <ShoppingCart className="h-5 w-5 text-blue-600" />}
                      {activity.type === 'user_registered' && <Users className="h-5 w-5 text-purple-600" />}
                      {activity.type === 'review_submitted' && <FileText className="h-5 w-5 text-orange-600" />}
                    </div>
                    <div className="space-y-1 flex-1">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-muted-foreground flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDate(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-6 border rounded-md border-dashed">
                  <p className="text-sm text-muted-foreground">Aucune activité récente</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="card">
          <CardHeader>
            <CardTitle>Produits récents</CardTitle>
            <CardDescription>
              Les derniers produits ajoutés à votre catalogue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.length > 0 ? (
                topProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between hover:bg-muted/50 p-2 rounded-md transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="rounded-md overflow-hidden w-12 h-12 bg-muted flex items-center justify-center shadow-sm">
                        {product.images && Array.isArray(product.images) && product.images.length > 0 ? (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="h-6 w-6 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="flex items-center text-sm text-muted-foreground space-x-2">
                          <span className="badge badge-outline">Stock: {product.stock}</span>
                          <span className="badge badge-primary">{formatCurrency(product.price)}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="hover-transform">
                      Voir
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center p-6 border rounded-md border-dashed">
                  <p className="text-sm text-muted-foreground">Aucun produit récent</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 