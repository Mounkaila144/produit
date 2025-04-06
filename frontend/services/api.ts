import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

// Configuration de base pour toutes les requêtes
// Utiliser le proxy Next.js pour éviter les problèmes CORS
const API_URL = '/api';  // URL relative pour utiliser le proxy configuré dans next.config.js

// Instance Axios principale
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 secondes
});

// Intercepteur pour ajouter le token JWT et l'identifiant du tenant
api.interceptors.request.use(
  (config) => {
    // Récupérer le token depuis le localStorage (côté client uniquement)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const tenantId = localStorage.getItem('tenantId');
      const adminTenantId = localStorage.getItem('adminTenantId');
      
      // Debug - afficher les en-têtes dans la console
      console.log('Request URL:', config.url);
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Déterminer si on est sur une page admin
      const isAdminPage = window.location.pathname.startsWith('/admin/');
      const isSuperAdminPage = window.location.pathname.startsWith('/super-admin/');
      console.log('Est sur page admin:', isAdminPage);
      console.log('Est sur page super-admin:', isSuperAdminPage);
      
      // Ne pas ajouter le header X-Tenant-ID pour les routes superadmin
      const isSuperAdminRoute = config.url?.includes('/superadmin/');
      
      if (!isSuperAdminRoute && !isSuperAdminPage) {
        // Ajouter le tenant ID approprié
        if (isAdminPage && adminTenantId) {
          config.headers['X-Tenant-ID'] = adminTenantId;
        } else if (tenantId) {
          config.headers['X-Tenant-ID'] = tenantId;
        }
      }
      
      // Debug - afficher l'ID du tenant utilisé
      console.log('Tenant ID from localStorage:', tenantId);
      
      // Debug - afficher les en-têtes finaux
      console.log('Final request headers:', config.headers);
    }
    
    return config;
  },
  (error) => {
    console.error('Erreur de requête API:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => {
    // Sauvegarder le tenant ID si présent dans une réponse réussie
    if (response.config.headers && response.config.headers['X-Tenant-ID']) {
      const tenantId = response.config.headers['X-Tenant-ID'] as string;
      
      // Si on est sur page admin, sauvegarder comme adminTenantId
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin/')) {
        localStorage.setItem('adminTenantId', tenantId);
      } else {
        localStorage.setItem('tenantId', tenantId);
      }
      
      sessionStorage.setItem('lastTenantId', tenantId);
    }
    
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // Log des erreurs pour le débogage
    console.error('API Error:', error.response?.status, error.response?.data);
    
    // Gestion des erreurs d'authentification (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Si l'API renvoie une erreur d'authentification, rediriger vers la page de connexion
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        // Ne pas supprimer tenantId et adminTenantId lors du logout pour conserver le contexte
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
    
    // Gestion des erreurs de tenant (403 avec message spécifique)
    if (error.response?.status === 403) {
      // Vérifier si l'erreur concerne le tenant
      const errorData = error.response.data as any;
      if (errorData?.message?.includes('tenant')) {
        if (typeof window !== 'undefined') {
          // Rediriger vers une page d'erreur tenant ou la page d'accueil
          window.location.href = '/tenant-error';
        }
      }
    }
    
    // Gestion des erreurs 400 liées au tenant manquant
    if (error.response?.status === 400) {
      const errorData = error.response.data as any;
      if (errorData?.message?.includes('tenant')) {
        console.error('Erreur de tenant:', errorData.message);
        
        // Déterminer le contexte (admin ou non)
        const isAdminContext = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin/');
        
        // Sur page admin, tenter de récupérer le tenant
        if (isAdminContext) {
          const adminTenantId = localStorage.getItem('adminTenantId');
          const fallbackTenantId = localStorage.getItem('tenantId') || sessionStorage.getItem('lastTenantId');
          
          if (adminTenantId || fallbackTenantId) {
            const effectiveTenantId = adminTenantId || fallbackTenantId;
            console.log('Tentative de récupération du tenant admin après erreur:', effectiveTenantId);
            
            // Retenter la requête avec le tenant ID récupéré
            originalRequest.headers = {
              ...originalRequest.headers,
              'X-Tenant-ID': effectiveTenantId
            };
            
            // Sauvegarder pour futurs appels
            localStorage.setItem('adminTenantId', effectiveTenantId as string);
            return axios(originalRequest);
          }
        }
        // Sur page normale, récupérer depuis URL
        else if (typeof window !== 'undefined') {
          const path = window.location.pathname;
          const pathSegments = path.split('/').filter(Boolean);
          if (pathSegments.length > 0 && !['api', 'admin', 'super-admin', 'login', 'Login'].includes(pathSegments[0])) {
            const potentialTenant = pathSegments[0];
            localStorage.setItem('tenantId', potentialTenant);
            console.log('Tenant ID défini depuis URL après erreur:', potentialTenant);
            
            // Retenter la requête avec le nouveau tenant ID
            originalRequest.headers = {
              ...originalRequest.headers,
              'X-Tenant-ID': potentialTenant
            };
            return axios(originalRequest);
          }
        }
      }
    }
    
    // Gestion des autres erreurs
    return Promise.reject(error);
  }
);

// Fonctions génériques pour les appels API
export const apiService = {
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<T> => 
    api.get(url, config).then((response: AxiosResponse<T>) => response.data),
    
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => 
    api.post(url, data, config).then((response: AxiosResponse<T>) => response.data),
    
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => 
    api.put(url, data, config).then((response: AxiosResponse<T>) => response.data),
    
  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => 
    api.patch(url, data, config).then((response: AxiosResponse<T>) => response.data),
    
  delete: <T>(url: string, config?: AxiosRequestConfig): Promise<T> => 
    api.delete(url, config).then((response: AxiosResponse<T>) => response.data),
};

export default api; 