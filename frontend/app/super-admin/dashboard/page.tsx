'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function SuperAdminDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté et est un superadmin
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'superadmin') {
      router.push('/login');
      return;
    }

    setIsLoading(false);
  }, [user, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (isLoading) {
    return <div className="container mx-auto py-12 px-4">Chargement...</div>;
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Tableau de bord SuperAdmin</h1>
        <Button variant="outline" onClick={handleLogout}>
          Déconnexion
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Gestion des Tenants</CardTitle>
            <CardDescription>Gérer les boutiques et leurs abonnements</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Créez, modifiez et gérez les boutiques de la plateforme.</p>
            <Button asChild>
              <Link href="/super-admin/tenants">Gérer les tenants</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Utilisateurs</CardTitle>
            <CardDescription>Gérer les utilisateurs de la plateforme</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Administrez les comptes utilisateurs et leurs permissions.</p>
            <Button asChild>
              <Link href="/super-admin/users">Gérer les utilisateurs</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>Paramètres globaux de la plateforme</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Modifiez les paramètres généraux de la plateforme.</p>
            <Button asChild>
              <Link href="/super-admin/settings">Paramètres</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistiques</CardTitle>
            <CardDescription>Analyse de performance</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Consultez les statistiques d'utilisation de la plateforme.</p>
            <Button asChild>
              <Link href="/super-admin/stats">Voir les statistiques</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 