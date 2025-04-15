'use client';

import { useAuth } from '@/context/AuthContext';
import useTenant from '@/hooks/useTenant';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Store,
  Package,
  Users,
  Settings,
  CreditCard,
  AlertCircle,
} from 'lucide-react';

const sidebarNavItems = [
  {
    title: 'Tableau de bord',
    href: '/tenant/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Profil Boutique',
    href: '/tenant/profile',
    icon: Store,
  },
  {
    title: 'Catégories',
    href: '/tenant/categories',
    icon: Package,
  },
  {
    title: 'Produits',
    href: '/tenant/products',
    icon: Package,
  },
  {
    title: 'Utilisateurs',
    href: '/tenant/users',
    icon: Users,
  },
  {
    title: 'Abonnement',
    href: '/tenant/subscription',
    icon: CreditCard,
  },
  {
    title: 'Paramètres',
    href: '/tenant/settings',
    icon: Settings,
  },
];

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isSuperAdmin } = useAuth();
  const { tenant, isLoading: tenantLoading } = useTenant();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (tenantLoading) {
    return <div>Chargement...</div>;
  }

  if (!tenant) {
    return <div>Tenant non trouvé</div>;
  }

  return (
    <div className="flex min-h-screen">
      {/* Barre latérale */}
      <div className="hidden md:flex w-64 flex-col border-r bg-background">
        <div className="p-6">
          <h2 className="text-lg font-semibold">{tenant.name}</h2>
          <p className="text-sm text-muted-foreground">{tenant.description}</p>
        </div>
        <ScrollArea className="flex-1">
          <nav className="space-y-1 p-2">
            {sidebarNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                    pathname === item.href
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>
        {tenant.isNearExpiration && (
          <div className="p-4 border-t">
            <div className="flex items-center gap-2 text-yellow-600">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm">
                Votre abonnement expire bientôt
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Contenu principal */}
      <div className="flex-1">
        <div className="h-16 border-b px-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold">
            {sidebarNavItems.find((item) => item.href === pathname)?.title}
          </h1>
        </div>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
} 