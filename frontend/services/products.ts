import { apiService } from './api';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  oldPrice?: number;
  stock: number;
  sku: string;
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  categoryId: string;
  categoryName?: string;
  createdAt: string;
  updatedAt: string;
  tenantId: string;
}

export interface ProductCreateData {
  name: string;
  description?: string;
  price: number;
  oldPrice?: number;
  stock: number;
  sku?: string;
  images?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
  categoryId: string;
}

export interface ProductUpdateData {
  name?: string;
  description?: string;
  price?: number;
  oldPrice?: number;
  stock?: number;
  sku?: string;
  images?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
  categoryId?: string;
}

export interface ProductResponse {
  data: Product;
  message: string;
}

export interface ProductsListResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductsStats {
  totalProducts: number;
  activeProducts: number;
  featuredProducts: number;
  lowStockProducts: number;
}

const productService = {
  // Récupérer tous les produits
  getProducts: async (params?: { 
    page?: number; 
    limit?: number; 
    search?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    featured?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ProductsListResponse> => {
    try {
      console.log("Service productService.getProducts - paramètres:", params);
      const response = await apiService.get<any>('/products', { params });
      console.log("Service productService.getProducts - réponse brute:", response);
      
      // Parser les images JSON pour chaque produit
      const processedData = (response.data || []).map((product: any) => {
        // Parser les images si c'est une chaîne JSON
        if (typeof product.images === 'string') {
          try {
            product.images = JSON.parse(product.images);
            console.log(`✅ Images parsées pour ${product.name}:`, product.images);
          } catch (e) {
            console.error(`❌ Erreur parsing images pour ${product.name}:`, product.images, e);
            product.images = [];
          }
        }
        // S'assurer que c'est toujours un tableau
        if (!Array.isArray(product.images)) {
          console.warn(`⚠️ Images non-array pour ${product.name}, conversion en tableau:`, product.images);
          product.images = product.images ? [product.images] : [];
        }
        return product;
      });
      
      // Adapter la réponse au format attendu
      const formattedResponse: ProductsListResponse = {
        data: processedData,
        total: response.count || 0,
        page: params?.page || 1,
        limit: params?.limit || 10,
        totalPages: 1
      };
      
      // Si la pagination est présente dans la réponse
      if (response.pagination) {
        formattedResponse.total = response.pagination.totalItems;
        formattedResponse.page = response.pagination.currentPage;
        formattedResponse.limit = response.pagination.itemsPerPage;
        formattedResponse.totalPages = response.pagination.totalPages;
      }
      
      console.log("Service productService.getProducts - réponse formatée:", formattedResponse);
      return formattedResponse;
    } catch (error) {
      console.error("Service productService.getProducts - erreur:", error);
      throw error;
    }
  },

  // Récupérer un produit par son ID
  getProduct: async (id: string): Promise<ProductResponse> => {
    try {
      const response = await apiService.get<ProductResponse>(`/products/${id}`);
      
      // Parser les images si nécessaire
      if (response.data && typeof response.data.images === 'string') {
        try {
          response.data.images = JSON.parse(response.data.images);
          console.log(`✅ Images parsées pour produit ${response.data.name}:`, response.data.images);
        } catch (e) {
          console.error(`❌ Erreur parsing images pour produit ${response.data.name}:`, response.data.images, e);
          response.data.images = [];
        }
      }
      
      // S'assurer que c'est toujours un tableau
      if (response.data && !Array.isArray(response.data.images)) {
        console.warn(`⚠️ Images non-array pour produit ${response.data.name}, conversion en tableau:`, response.data.images);
        response.data.images = response.data.images ? [response.data.images] : [];
      }
      
      return response;
    } catch (error) {
      console.error("Service getProduct - erreur:", error);
      throw error;
    }
  },

  // Créer un nouveau produit
  createProduct: (data: ProductCreateData): Promise<ProductResponse> => {
    // S'assurer que les images sont un tableau valide
    if (data.images) {
      data.images = data.images.filter(url => typeof url === 'string' && url.trim() !== '');
    } else {
      data.images = [];
    }
    
    console.log("Service createProduct - données formatées:", JSON.stringify(data, null, 2));
    return apiService.post<ProductResponse>('/products', data);
  },

  // Mettre à jour un produit
  updateProduct: (id: string, data: ProductUpdateData): Promise<ProductResponse> => {
    // S'assurer que les images sont un tableau valide
    if (data.images) {
      data.images = data.images.filter(url => typeof url === 'string' && url.trim() !== '');
    }
    
    console.log("Service updateProduct - données formatées:", JSON.stringify(data, null, 2));
    return apiService.put<ProductResponse>(`/products/${id}`, data);
  },

  // Supprimer un produit
  deleteProduct: (id: string): Promise<{ message: string }> =>
    apiService.delete<{ message: string }>(`/products/${id}`),

  // Activer un produit
  activateProduct: (id: string): Promise<ProductResponse> =>
    apiService.patch<ProductResponse>(`/products/${id}/activate`),

  // Désactiver un produit
  deactivateProduct: (id: string): Promise<ProductResponse> =>
    apiService.patch<ProductResponse>(`/products/${id}/deactivate`),

  // Marquer un produit comme mis en avant
  featureProduct: (id: string): Promise<ProductResponse> =>
    apiService.patch<ProductResponse>(`/products/${id}/feature`),

  // Enlever un produit des produits mis en avant
  unfeatureProduct: (id: string): Promise<ProductResponse> =>
    apiService.patch<ProductResponse>(`/products/${id}/unfeature`),

  // Mettre à jour le stock d'un produit
  updateStock: (id: string, quantity: number): Promise<ProductResponse> =>
    apiService.patch<ProductResponse>(`/products/${id}/stock`, { quantity }),

  // Obtenir des statistiques sur les produits
  getProductStats: (): Promise<ProductsStats> =>
    apiService.get<ProductsStats>('/products/stats'),

  // Produits les plus vendus
  getTopSellingProducts: (limit: number = 5): Promise<Product[]> =>
    apiService.get<Product[]>('/products/top-selling', { params: { limit } }),

  // Produits récemment ajoutés
  getRecentProducts: (limit: number = 5): Promise<Product[]> =>
    apiService.get<Product[]>('/products/recent', { params: { limit } }),
};

export default productService; 