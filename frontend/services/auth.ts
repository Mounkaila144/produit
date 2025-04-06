import { apiService } from './api';

export interface LoginCredentials {
  email: string;
  password: string;
  tenantId?: string; // Optionnel - sera extrait automatiquement côté serveur par user.tenantId
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  tenantId?: string;
}

export interface AuthResponse {
  token: string;
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
    tenantId?: string;
  };
  // Ces propriétés peuvent être directement sur l'objet de réponse pour le superadmin
  id?: string;
  email?: string;
  username?: string;
  role?: string;
  tenantId?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId?: string;
  createdAt: string;
  updatedAt: string;
  status?: 'active' | 'inactive' | 'locked';
}

export interface UserFilters {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedUsers {
  items: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const authService = {
  // Connexion utilisateur
  login: (credentials: LoginCredentials): Promise<AuthResponse> => 
    apiService.post<AuthResponse>('/auth/login', credentials),
  
  // Connexion super admin
  loginSuperAdmin: (credentials: { email: string; password: string }): Promise<AuthResponse> =>
    apiService.post<AuthResponse>('/auth/super-admin/login', credentials),
  
  // Inscription utilisateur
  register: (userData: RegisterData): Promise<AuthResponse> =>
    apiService.post<AuthResponse>('/auth/register', userData),
  
  // Déconnexion
  logout: (): Promise<void> => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('tenantId');
      localStorage.removeItem('user');
    }
    return Promise.resolve();
  },
  
  // Récupérer le profil utilisateur
  getProfile: async (): Promise<UserProfile> => {
    try {
      // Si nous avons un token, essayer de récupérer le profil
      if (typeof window !== 'undefined' && localStorage.getItem('token')) {
        // Essayer d'obtenir le profil via l'API
        return await apiService.get<UserProfile>('/auth/profile');
      } else {
        throw new Error('Non authentifié');
      }
    } catch (error) {
      console.error('Erreur finale getProfile:', error);
      throw error;
    }
  },
  
  // Vérifier si l'utilisateur est connecté
  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('token');
  },
  
  // Vérifier si l'utilisateur est un super admin
  isSuperAdmin: (): boolean => {
    if (typeof window === 'undefined') return false;
    
    const userStr = localStorage.getItem('user');
    if (!userStr) return false;
    
    try {
      const user = JSON.parse(userStr);
      return user.role === 'superadmin';
    } catch (e) {
      return false;
    }
  },
  
  // Sauvegarder les informations d'authentification
  saveAuth: (authResponse: AuthResponse): void => {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem('token', authResponse.token);
    
    // Gestion du format de réponse pour le superadmin
    const userData = authResponse.user || authResponse;
    
    if (userData.tenantId) {
      localStorage.setItem('tenantId', userData.tenantId);
    }
    
    // Si la réponse n'a pas d'objet user imbriqué (cas du superadmin),
    // créons un objet user à partir des données disponibles
    if (!authResponse.user && authResponse.id) {
      const userObj = {
        id: authResponse.id,
        email: authResponse.email,
        username: authResponse.username,
        role: authResponse.role
      };
      localStorage.setItem('user', JSON.stringify(userObj));
    } else {
      localStorage.setItem('user', JSON.stringify(userData));
    }
  },
};

export default authService; 