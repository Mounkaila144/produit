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
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';

// Schéma de validation pour le formulaire de connexion
const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useAuth();
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

  return (
    <>
      <div className="relative min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-red-600 to-white animate-gradient">
        {/* Logo animé en arrière-plan */}
        <div className="absolute top-12 left-12 opacity-10 animate-spin duration-[30000ms]">
          <Image src="/images/logo.png" alt="Logo NigerDev" width={200} height={200} className="object-contain" />
        </div>
        <div className="absolute bottom-16 right-16 opacity-10 animate-pulse duration-[5000ms]">
          <Image src="/images/logo.png" alt="Logo NigerDev" width={150} height={150} className="object-contain" />
        </div>
        <div className="w-full max-w-md">
          <Card className="bg-white/90 backdrop-blur-lg rounded-xl shadow-2xl transform transition-transform duration-500 hover:scale-105">
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
                    className="focus:ring-2 focus:ring-red-400 transition"
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
                    className="focus:ring-2 focus:ring-red-400 transition"
                  />
                  {loginErrors.password && (
                    <p className="text-sm text-red-500">{loginErrors.password.message}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button
                  className="w-full transition-transform transform hover:scale-105 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white"
                  type="submit" disabled={isLoading}
                >
                  {isLoading ? 'Connexion en cours...' : 'Se connecter'}
                </Button>
                <div className="text-sm text-center text-gray-500">
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
      <style jsx global>{`
        @keyframes gradientAnimation {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradientAnimation 15s ease infinite;
        }
      `}</style>
    </>
  );
}