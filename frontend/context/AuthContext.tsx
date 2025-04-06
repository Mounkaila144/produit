"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService, { AuthResponse, UserProfile } from '../services/auth';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  login: (email: string, password: string, tenantId?: string) => Promise<AuthResponse>;
  loginSuperAdmin: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string, tenantId?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté lors du chargement initial
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const profile = await authService.getProfile();
          setUser(profile);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        // En cas d'échec, déconnecter l'utilisateur
        await authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string, tenantId?: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login({ email, password, tenantId });
      
      // Après une connexion réussie, récupérer le tenant ID de l'utilisateur si nécessaire
      if (!tenantId && response.user && response.user.tenantId) {
        // Si l'utilisateur appartient à un tenant, l'utiliser automatiquement
        localStorage.setItem('tenantId', response.user.tenantId);
      }
      
      handleAuthSuccess(response);
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const loginSuperAdmin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('Tentative de connexion superadmin:', { email });
      const response = await authService.loginSuperAdmin({ email, password });
      console.log('Réponse brute loginSuperAdmin:', response);
      handleAuthSuccess(response);
      console.log('Utilisateur après connexion:', user);
      return response;
    } catch (error) {
      console.error('Erreur loginSuperAdmin:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string, tenantId?: string) => {
    setIsLoading(true);
    try {
      const response = await authService.register({ email, password, firstName, lastName, tenantId });
      handleAuthSuccess(response);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = (authResponse: AuthResponse) => {
    authService.saveAuth(authResponse);
    
    // Si la réponse a un objet user imbriqué, utilisons-le
    if (authResponse.user) {
      setUser(authResponse.user as UserProfile);
    } 
    // Sinon, créons un objet utilisateur à partir des propriétés à la racine (cas du superadmin)
    else if (authResponse.id && authResponse.role) {
      const userObj: UserProfile = {
        id: authResponse.id,
        email: authResponse.email || '',
        firstName: authResponse.username || '',
        lastName: '',
        role: authResponse.role,
        tenantId: authResponse.tenantId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setUser(userObj);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      isSuperAdmin: user?.role === 'superadmin',
      login,
      loginSuperAdmin,
      logout,
      register
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};

export default AuthContext; 