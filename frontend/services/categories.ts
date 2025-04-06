import { apiService } from './api';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  productsCount?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  tenantId: string;
}

export interface CategoryCreateData {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface CategoryUpdateData {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface CategoryResponse {
  data: Category;
  message: string;
}

export interface CategoriesListResponse {
  data: Category[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const categoryService = {
  // Récupérer toutes les catégories
  getCategories: (params?: { page?: number; limit?: number; search?: string }): Promise<CategoriesListResponse> =>
    apiService.get<CategoriesListResponse>('/categories', { params }),

  // Récupérer une catégorie par son ID
  getCategory: (id: string): Promise<CategoryResponse> =>
    apiService.get<CategoryResponse>(`/categories/${id}`),

  // Créer une nouvelle catégorie
  createCategory: (data: CategoryCreateData): Promise<CategoryResponse> =>
    apiService.post<CategoryResponse>('/categories', data),

  // Mettre à jour une catégorie
  updateCategory: (id: string, data: CategoryUpdateData): Promise<CategoryResponse> =>
    apiService.put<CategoryResponse>(`/categories/${id}`, data),

  // Supprimer une catégorie
  deleteCategory: (id: string): Promise<{ message: string }> =>
    apiService.delete<{ message: string }>(`/categories/${id}`),

  // Activer une catégorie
  activateCategory: (id: string): Promise<CategoryResponse> =>
    apiService.patch<CategoryResponse>(`/categories/${id}/activate`),

  // Désactiver une catégorie
  deactivateCategory: (id: string): Promise<CategoryResponse> =>
    apiService.patch<CategoryResponse>(`/categories/${id}/deactivate`),

  // Obtenir des statistiques sur les catégories
  getCategoryStats: (): Promise<{ totalCategories: number; activeCategories: number; }> =>
    apiService.get<{ totalCategories: number; activeCategories: number; }>('/categories/stats'),
};

export default categoryService; 