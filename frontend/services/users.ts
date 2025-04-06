import { apiService } from './api';
import { PaginatedUsers, User, UserFilters } from './auth';

interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface UpdateUserData {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  status?: 'active' | 'inactive' | 'locked';
}

// Ajoutons une interface pour la réponse spécifique du backend
interface ApiResponse<T> {
  success: boolean;
  count?: number;
  items?: T[];
  data?: T;
}

export const userService = {
  // Récupérer tous les utilisateurs pour le tenant
  getUsers: (filters: UserFilters = {}): Promise<PaginatedUsers> => {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.role) params.append('role', filters.role);
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    
    return apiService.get<PaginatedUsers>(`/users?${params.toString()}`);
  },
  
  // Récupérer un utilisateur par son ID
  getUserById: (id: string): Promise<User> => 
    apiService.get<User>(`/users/${id}`),
  
  // Créer un nouvel utilisateur
  createUser: (userData: CreateUserData): Promise<User> => 
    apiService.post<User>('/users', userData),
  
  // Mettre à jour un utilisateur existant
  updateUser: (id: string, userData: UpdateUserData): Promise<User> => 
    apiService.put<User>(`/users/${id}`, userData),
  
  // Supprimer un utilisateur
  deleteUser: (id: string): Promise<void> => 
    apiService.delete<void>(`/users/${id}`),
  
  // Récupérer tous les utilisateurs pour le super admin
  getAllUsers: (filters: UserFilters & { tenantId?: string } = {}): Promise<ApiResponse<User>> => {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.role) params.append('role', filters.role);
    if (filters.status) params.append('status', filters.status);
    if (filters.tenantId) params.append('tenantId', filters.tenantId);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    
    return apiService.get<ApiResponse<User>>(`/superadmin/users${params.toString() ? `?${params.toString()}` : ''}`);
  },
  
  // Récupérer un utilisateur par son ID pour le super admin
  getSuperAdminUserById: (id: string): Promise<ApiResponse<User>> => 
    apiService.get<ApiResponse<User>>(`/superadmin/users/${id}`),
  
  // Créer un nouvel utilisateur par le super admin
  createSuperAdminUser: (userData: CreateUserData & { tenantId?: string }): Promise<ApiResponse<User>> => 
    apiService.post<ApiResponse<User>>('/superadmin/users', userData),
  
  // Mettre à jour un utilisateur existant par le super admin
  updateSuperAdminUser: (id: string, userData: UpdateUserData & { tenantId?: string }): Promise<User> => 
    apiService.put<User>(`/superadmin/users/${id}`, userData),
  
  // Supprimer un utilisateur par le super admin
  deleteSuperAdminUser: (id: string): Promise<void> => 
    apiService.delete<void>(`/superadmin/users/${id}`),
  
  // Activer un utilisateur
  enableUser: (id: string): Promise<User> => 
    apiService.put<User>(`/superadmin/users/${id}/enable`, {}),
  
  // Désactiver un utilisateur
  disableUser: (id: string): Promise<User> => 
    apiService.put<User>(`/superadmin/users/${id}/disable`, {}),
};

export default userService; 