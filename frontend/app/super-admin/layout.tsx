'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
  const { user, isLoading, isSuperAdmin } = useAuth();
  const router = useRouter();
  const [isInitializing, setIsInitializing] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Vérifier si l'application a déjà initialisé l'authentification depuis localStorage
    const checkAuthFromLocalStorage = () => {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          console.log('Données utilisateur du localStorage:', userData);
          
          if (userData.role === 'superadmin') {
            console.log('Utilisateur superadmin trouvé dans localStorage');
            setAuthChecked(true);
            setIsInitializing(false);
            return true;
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du localStorage:', error);
      }
      return false;
    };

    console.log('SuperAdminLayout - État actuel:', { user, isLoading, isSuperAdmin });
    
    // Si les données d'authentification sont en cours de chargement, attendons
    if (isLoading) {
      return;
    }
    
    // Si l'utilisateur est authentifié et est un superadmin, nous sommes bons
    if (user && user.role === 'superadmin') {
      console.log('Utilisateur superadmin confirmé via context');
      setAuthChecked(true);
      setIsInitializing(false);
      return;
    }
    
    // Sinon, vérifier le localStorage comme secours
    const hasValidAuth = checkAuthFromLocalStorage();
    
    // Si nous n'avons toujours pas d'authentification valide, rediriger vers login
    if (!hasValidAuth && !isInitializing) {
      console.log('Aucun utilisateur superadmin trouvé, redirection vers login');
      router.push('/login');
    }
  }, [user, isLoading, isSuperAdmin, router, isInitializing]);

  // Donner un peu de temps pour l'initialisation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Afficher un écran de chargement pendant la vérification
  if (isLoading || isInitializing) {
    return (
      <div className="container mx-auto flex items-center justify-center h-screen">
        <p className="text-lg">Chargement...</p>
      </div>
    );
  }

  // Si l'authentification est vérifiée localement depuis localStorage, permettre l'accès
  if (authChecked) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow">
          {children}
        </main>
      </div>
    );
  }

  // Redirection en cours ou échec d'authentification
  return null;
} 