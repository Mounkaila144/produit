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

// Schéma de validation pour la connexion Super Admin
const superAdminLoginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

type SuperAdminLoginFormValues = z.infer<typeof superAdminLoginSchema>;

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { loginSuperAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SuperAdminLoginFormValues>({
    resolver: zodResolver(superAdminLoginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: SuperAdminLoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await loginSuperAdmin(data.email, data.password);
      toast({
        title: 'Connexion réussie',
        description: 'Vous êtes connecté en tant que Super Admin.',
      });
      setTimeout(() => router.push('/super-admin/dashboard'), 1500);
    } catch (error) {
      console.error('Erreur Super Admin:', error);
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
        <Card>
          <CardHeader>
            <CardTitle>Connexion Super Admin</CardTitle>
            <CardDescription>Connexion réservée aux administrateurs système.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="admin@exemple.com" {...register('email')} />
                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input id="password" type="password" {...register('password')} />
                {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? 'Connexion en cours...' : 'Se connecter'}
              </Button>
              <div className="text-sm text-center text-gray-500 mt-2">
                <Link href="/login" className="underline text-primary">
                  Connexion utilisateur
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
} 