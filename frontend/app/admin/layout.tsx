'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Sidebar } from '@/components/admin/Sidebar';
import { Toaster } from '@/components/ui/toaster';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();

  // Vérifier l'authentification et le rôle
  useEffect(() => {
    if (!isLoading) {
      // Si l'utilisateur n'est pas authentifié, rediriger vers la page de connexion
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      // Si l'utilisateur n'a pas un rôle d'admin, manager ou éditeur, rediriger
      if (user && !['admin', 'manager', 'editor'].includes(user.role)) {
        router.push('/');
      }
    }
  }, [isAuthenticated, isLoading, router, user]);

  // Afficher un écran de chargement pendant la vérification
  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-primary/20 mb-6"></div>
          <div className="h-6 w-32 bg-muted rounded-md"></div>
          <div className="mt-6 text-sm text-muted-foreground">Chargement du tableau de bord...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 overflow-auto scrollbar-thin">
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b h-16 flex items-center px-6 lg:px-8">
          <div className="ml-auto flex items-center space-x-4">
            <div className="relative">
              <span className="badge badge-primary">{user.role}</span>
            </div>
          </div>
        </header>
        <main className="p-6 max-w-7xl mx-auto animate-fade-in">
          {children}
        </main>
        <footer className="border-t py-4 text-center text-sm text-muted-foreground mt-auto">
          <p>© 2023 Administration. Tous droits réservés.</p>
        </footer>
      </div>
      <Toaster />
    </div>
  );
} 