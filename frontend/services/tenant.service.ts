'use client';

// Interface pour les données du tenant
export interface Tenant {
  id: string;
  name: string;
  description: string;
  domain: string;
  logoUrl: string | null;
  active: boolean;
  expiresAt: string;
  planType: string;
  contactInfo: string | {
    email: string;
    phone: string;
  };
  ownerId: string;
}

// Service pour les tenants
export const TenantService = {
  // Récupérer un tenant par son path (domaine)
  async getTenantByPath(path: string): Promise<Tenant | null> {
    try {
      // Utiliser l'API route "direct", qui ne passe pas par l'extractTenant middleware
      const response = await fetch(`/api/direct/tenants/by-domain/${path}`, {
        cache: 'no-cache',
        next: { revalidate: 0 }
      });
      
      if (!response.ok) {
        return null;
      }
      
      const result = await response.json();
      
      if (!result.success) {
        return null;
      }
      
      return result.data as Tenant;
    } catch (error) {
      return null;
    }
  },
  
  // Vérifier si un tenant existe
  async checkTenantExists(path: string): Promise<boolean> {
    try {
      const tenant = await this.getTenantByPath(path);
      return tenant !== null;
    } catch (error) {
      return false;
    }
  },
  
  // Obtenir les produits d'un tenant
  async getTenantProducts(tenantId: string, options: {
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    limit?: number;
    page?: number;
    sort?: string;
  } = {}) {
    try {
      // Utiliser la route directe qui contourne le middleware tenant
      let url = `/api/direct/products/tenant/${tenantId}`;
      
      // Ajouter les paramètres de filtrage, tri et pagination
      const queryParams = new URLSearchParams();
      
      if (options.search) queryParams.append('search', options.search);
      if (options.category) queryParams.append('category', options.category);
      if (options.minPrice) queryParams.append('minPrice', options.minPrice.toString());
      if (options.maxPrice) queryParams.append('maxPrice', options.maxPrice.toString());
      if (options.limit) queryParams.append('limit', options.limit.toString());
      if (options.page) queryParams.append('page', options.page.toString());
      if (options.sort) queryParams.append('sort', options.sort);
      
      // Ajouter les paramètres à l'URL s'il y en a
      const queryString = queryParams.toString();
      if (queryString) {
        url = `${url}?${queryString}`;
      }
      
      // Appel à l'API route du frontend
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }
      
      const responseData = await response.json();
      
      // L'API renvoie les données sous la forme { success, data, count, pagination }
      if (!responseData.success || !responseData.data) {
        return {
          products: [],
          pagination: {
            totalItems: 0,
            totalPages: 0,
            currentPage: 1,
            itemsPerPage: 0
          },
          totalCount: 0
        };
      }
      
      const products = responseData.data;
      
      // Retourner les produits avec la structure attendue par l'application
      return {
        products: products.map((product: any) => {
          // Traiter les images JSON comme dans productService
          let processedImages = [];
          if (product.images) {
            if (typeof product.images === 'string') {
              try {
                processedImages = JSON.parse(product.images);
                console.log(`✅ Images parsées pour ${product.name} (TenantService):`, processedImages);
              } catch (e) {
                console.error(`❌ Erreur parsing images pour ${product.name} (TenantService):`, product.images, e);
                processedImages = [];
              }
            } else if (Array.isArray(product.images)) {
              processedImages = product.images;
            }
          }
          
          // Extraire l'URL de l'image du produit
          let imageUrl = '';
          if (Array.isArray(processedImages) && processedImages.length > 0) {
            imageUrl = processedImages[0];
          } else {
            imageUrl = ''; // Sera géré par buildImageUrl dans ProductCard
          }
          
          return {
            id: product.id,
            name: product.name,
            description: product.description || "Aucune description disponible",
            price: parseFloat(product.price) || 0,
            category: product.Category?.name || "Non catégorisé",
            image: imageUrl,
            inStock: product.stock > 0,
            freeShipping: product.freeShipping === true
          };
        }),
        pagination: responseData.pagination || {
          totalItems: products.length,
          totalPages: 1,
          currentPage: 1,
          itemsPerPage: products.length
        },
        totalCount: responseData.count || products.length
      };
    } catch (error) {
      // En cas d'erreur, retourner un objet vide avec la même structure
      return {
        products: [],
        pagination: {
          totalItems: 0,
          totalPages: 0,
          currentPage: 1,
          itemsPerPage: 0
        },
        totalCount: 0
      };
    }
  },
  
  // Récupérer les statistiques du tenant (dashboard)
  getTenantStats: async (): Promise<any> => {
    try {
      const response = await fetch('/api/tenant-admin/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return null;
    }
  }
};

export default TenantService; 