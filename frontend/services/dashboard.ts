import { apiService } from './api';

export interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  totalUsers: number;
  revenueToday: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  revenueTrend: {
    date: string;
    amount: number;
  }[];
  lowStockProducts: number;
  pendingOrders: number;
}

export interface RecentActivity {
  id: string;
  type: 'product_added' | 'order_placed' | 'user_registered' | 'review_submitted';
  message: string;
  userId: string;
  userName?: string;
  timestamp: string;
  objectId?: string;
}

export interface TopProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  imageUrl?: string;
  totalSold: number;
  totalRevenue: number;
}

// Mapping des données du tenant dashboard vers notre format attendu
const mapTenantDashboardToStats = (response: any): DashboardStats => {
  const data = response.data;
  
  // Données par défaut si certaines valeurs sont manquantes
  return {
    totalProducts: data?.stats?.products || 0,
    totalCategories: data?.stats?.categories || 0,
    totalUsers: data?.stats?.users || 0,
    totalOrders: 0, // Non fourni par l'API
    revenueToday: 0, // Non fourni par l'API
    revenueThisMonth: 0, // Non fourni par l'API
    revenueLastMonth: 0, // Non fourni par l'API
    revenueTrend: [], // Non fourni par l'API
    lowStockProducts: 0, // Non fourni par l'API
    pendingOrders: 0 // Non fourni par l'API
  };
};

// Conversion des produits récents en activités récentes
const mapRecentProductsToActivities = (response: any): RecentActivity[] => {
  const recentProducts = response.data?.recentProducts || [];
  
  return recentProducts.map((product: any) => ({
    id: product.id,
    type: 'product_added',
    message: `Nouveau produit ajouté: ${product.name}`,
    userId: product.tenantId,
    timestamp: product.createdAt,
    objectId: product.id
  }));
};

// Conversion des produits récents en top produits
const mapRecentProductsToTopProducts = (response: any): TopProduct[] => {
  const recentProducts = response.data?.recentProducts || [];
  
  return recentProducts.map((product: any) => ({
    id: product.id,
    name: product.name,
    price: product.price || 0,
    stock: product.stock || 0,
    imageUrl: product.images?.[0] || '',
    totalSold: 0, // Non fourni par l'API
    totalRevenue: 0 // Non fourni par l'API
  }));
};

const dashboardService = {
  // Récupérer les statistiques du tableau de bord
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiService.get('/tenant-admin/dashboard');
    return mapTenantDashboardToStats(response);
  },

  // Récupérer les activités récentes
  getRecentActivities: async (limit: number = 5): Promise<RecentActivity[]> => {
    const response = await apiService.get('/tenant-admin/dashboard');
    return mapRecentProductsToActivities(response).slice(0, limit);
  },

  // Récupérer les produits les plus vendus
  getTopProducts: async (limit: number = 5): Promise<TopProduct[]> => {
    const response = await apiService.get('/tenant-admin/dashboard');
    return mapRecentProductsToTopProducts(response).slice(0, limit);
  },

  // Récupérer les commandes récentes (non disponible, retourne un tableau vide)
  getRecentOrders: async (limit: number = 5): Promise<any[]> => {
    return [];
  },
};

export default dashboardService; 