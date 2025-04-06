'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

// Schéma de validation pour le formulaire de connexion
const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Schéma de validation pour le formulaire de connexion super admin
const superAdminLoginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

type SuperAdminLoginFormValues = z.infer<typeof superAdminLoginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { login, loginSuperAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Formulaire de connexion standard
  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    formState: { errors: loginErrors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Formulaire de connexion super admin
  const {
    register: registerSuperAdmin,
    handleSubmit: handleSubmitSuperAdmin,
    formState: { errors: superAdminErrors },
  } = useForm<SuperAdminLoginFormValues>({
    resolver: zodResolver(superAdminLoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Gestion de la soumission du formulaire de connexion standard
  const onSubmitLogin = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await login(data.email, data.password);
      toast({
        title: 'Connexion réussie',
        description: 'Vous êtes maintenant connecté.',
      });
      
      // Rediriger vers la page appropriée selon le rôle de l'utilisateur
      if (response.role === 'admin' || response.role === 'manager' || response.role === 'editor') {
        // Rediriger vers le dashboard administrateur
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 1000);
      } else {
        // Rediriger vers la page d'accueil pour les utilisateurs normaux
        router.push('/');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur de connexion',
        description: error instanceof Error ? error.message : 'Email ou mot de passe incorrect.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Gestion de la soumission du formulaire de connexion super admin
  const onSubmitSuperAdmin = async (data: SuperAdminLoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await loginSuperAdmin(data.email, data.password);
      console.log('Réponse login superadmin:', response);
      toast({
        title: 'Connexion réussie',
        description: 'Vous êtes maintenant connecté en tant que Super Admin.',
      });
      
      // Attendre un instant pour que l'état utilisateur soit mis à jour
      // avant de naviguer vers le tableau de bord
      setTimeout(() => {
        router.push('/super-admin/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Erreur détaillée:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur de connexion',
        description: error instanceof Error ? error.message : 'Email ou mot de passe incorrect pour le Super Admin.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-md">
        <Tabs defaultValue="user">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="user">Utilisateur</TabsTrigger>
            <TabsTrigger value="superadmin">Super Admin</TabsTrigger>
          </TabsList>

          <TabsContent value="user">
            <Card>
              <CardHeader>
                <CardTitle>Connexion Utilisateur</CardTitle>
                <CardDescription>
                  Connectez-vous à votre compte pour accéder à la boutique.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmitLogin(onSubmitLogin)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="exemple@email.com"
                      {...registerLogin('email')}
                    />
                    {loginErrors.email && (
                      <p className="text-sm text-red-500">{loginErrors.email.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input
                      id="password"
                      type="password"
                      {...registerLogin('password')}
                    />
                    {loginErrors.password && (
                      <p className="text-sm text-red-500">{loginErrors.password.message}</p>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <Button className="w-full" type="submit" disabled={isLoading}>
                    {isLoading ? 'Connexion en cours...' : 'Se connecter'}
                  </Button>
                  <div className="text-sm text-center text-gray-500">
                    Vous n'avez pas de compte?{' '}
                    <Link href="/register" className="underline text-primary">
                      S'inscrire
                    </Link>
                  </div>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="superadmin">
            <Card>
              <CardHeader>
                <CardTitle>Connexion Super Admin</CardTitle>
                <CardDescription>
                  Connexion réservée aux administrateurs système.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmitSuperAdmin(onSubmitSuperAdmin)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="superadmin-email">Email</Label>
                    <Input
                      id="superadmin-email"
                      type="email"
                      placeholder="admin@exemple.com"
                      {...registerSuperAdmin('email')}
                    />
                    {superAdminErrors.email && (
                      <p className="text-sm text-red-500">{superAdminErrors.email.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="superadmin-password">Mot de passe</Label>
                    <Input
                      id="superadmin-password"
                      type="password"
                      {...registerSuperAdmin('password')}
                    />
                    {superAdminErrors.password && (
                      <p className="text-sm text-red-500">{superAdminErrors.password.message}</p>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" type="submit" disabled={isLoading}>
                    {isLoading ? 'Connexion en cours...' : 'Se connecter'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}