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

// Liste des tenants autorisés en développement avec leurs vrais IDs
const devTenants: Record<string, string> = {
  'mounkaila': '9cdf014a-4a75-4bbd-9023-2a9fa70828fd', // ID réel du tenant mounkaila
  'bio': '13e58189-7a01-4c43-9ff0-9df634754a15',       // ID réel du tenant bio
  'librairie': '24f6919a-8b12-5d54-0ee1-10e745865b26', // ID réel du tenant librairie
  'norre': '35f7929b-9c23-6e65-1ff2-21f856976c37'      // ID réel du tenant norre
};

// Service pour les tenants
export const TenantService = {
  // Récupérer un tenant par son path (domaine)
  async getTenantByPath(path: string): Promise<Tenant | null> {
    try {
      // En développement, vérifier dans la liste prédéfinie
      if (process.env.NODE_ENV === 'development') {
        // Vérifier si le tenant existe dans notre liste
        if (!Object.keys(devTenants).includes(path)) {
          console.error(`Tenant "${path}" non trouvé dans la liste des tenants de développement`);
          return null;
        }
        
        const tenantId = devTenants[path];
        
        // Tenant de développement
        return {
          id: tenantId,
          name: `Boutique ${path}`,
          description: `Numero Whatsapp: ${path}`,
          domain: path,
          logoUrl: null,
          active: true,
          expiresAt: new Date(2099, 12, 31).toISOString(),
          planType: 'development',
          contactInfo: JSON.stringify({
            email: `contact@${path}.example.com`,
            phone: '+33123456789'
          }),
          ownerId: 'dev-owner'
        };
      }
      
      // En production, appel à l'API
      const response = await fetch(`/api/tenants/domain/${path}`);
      
      if (!response.ok) {
        console.error(`Erreur lors de la récupération du tenant (${path}):`, response.statusText);
        return null;
      }
      
      const result = await response.json();
      
      if (!result.success) {
        console.error('Échec de la récupération du tenant:', result.message);
        return null;
      }
      
      return result.data as Tenant;
    } catch (error) {
      console.error('Erreur lors de la récupération du tenant:', error);
      return null;
    }
  },
  
  // Vérifier si un tenant existe
  async checkTenantExists(path: string): Promise<boolean> {
    try {
      // En développement, vérifier dans la liste prédéfinie
      if (process.env.NODE_ENV === 'development') {
        return Object.keys(devTenants).includes(path);
      }
      
      const response = await fetch(`/api/tenants/domain/${path}`);
      return response.ok;
    } catch (error) {
      console.error('Erreur lors de la vérification du tenant:', error);
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
      console.log(`Récupération des produits pour le tenant ID: ${tenantId}`);
      
      // Appel à l'API backend pour récupérer les produits du tenant
      // Ici, nous utilisons l'URL de votre API backend réelle
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
      
      // Construire l'URL avec les paramètres de requête
      let url = `${apiUrl}/api/products`;
      
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
      
      console.log(`Envoi de la requête à: ${url} avec en-tête x-tenant-id: ${tenantId}`);
      
      // Appel à l'API backend avec l'en-tête x-tenant-id
      const response = await fetch(url, {
        headers: {
          'x-tenant-id': tenantId
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Erreur lors de la récupération des produits:`, errorText);
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }
      
      const responseData = await response.json();
      console.log('Réponse complète:', responseData);
      
      // L'API renvoie les données sous la forme { success, data, count, pagination }
      if (!responseData.success || !responseData.data) {
        console.error('Format de réponse invalide ou erreur côté serveur');
        return [];
      }
      
      const products = responseData.data;
      console.log(`${products.length} produits récupérés pour le tenant ${tenantId}`);
      
      // Retourner les produits avec la structure attendue par l'application
      return {
        products: products.map((product: any) => {
          // Extraire l'URL de l'image du produit
          let imageUrl = 'https://picsum.photos/seed/product/400/400'; // Image par défaut
          
          // Tenter d'extraire une image des formats possibles
          if (product.images) {
            if (Array.isArray(product.images) && product.images.length > 0) {
              // Format directement en tableau
              imageUrl = `${apiUrl}${product.images[0]}`;
            } else if (typeof product.images === 'string') {
              try {
                // Format JSON stringifié
                const parsedImages = JSON.parse(product.images);
                if (Array.isArray(parsedImages) && parsedImages.length > 0 && parsedImages[0].url) {
                  imageUrl = `${apiUrl}${parsedImages[0].url}`;
                }
              } catch (e) {
                console.warn('Erreur de parsing des images:', e);
              }
            }
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
      console.error('Erreur lors de la récupération des produits:', error);
      
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
  }
};

export default TenantService; 