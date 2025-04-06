'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  ListOrdered,
  Users, 
  Settings, 
  LogOut,
  ChevronRight,
  ChevronDown,
  Tag,
  Layers,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    'catalog': true
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const toggleMenu = (menuName: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const navItems = [
    { 
      name: 'Tableau de bord', 
      path: '/admin/dashboard', 
      icon: <LayoutDashboard className="w-5 h-5" /> 
    },
    { 
      name: 'Catalogue', 
      group: 'catalog',
      icon: <Layers className="w-5 h-5" />,
      children: [
        { 
          name: 'Catégories', 
          path: '/admin/categories', 
          icon: <Tag className="w-5 h-5" /> 
        },
        { 
          name: 'Produits', 
          path: '/admin/products', 
          icon: <ShoppingCart className="w-5 h-5" /> 
        }
      ]
    },
    { 
      name: 'Commandes', 
      path: '/admin/orders', 
      icon: <ListOrdered className="w-5 h-5" /> 
    },
    { 
      name: 'Utilisateurs', 
      path: '/admin/users', 
      icon: <Users className="w-5 h-5" />,
      roles: ['admin']
    },
    { 
      name: 'Paramètres', 
      path: '/admin/settings', 
      icon: <Settings className="w-5 h-5" />,
      roles: ['admin']
    }
  ];

  return (
    <>
      {/* Button mobile pour afficher/masquer le menu */}
      <button 
        className="lg:hidden fixed top-4 right-4 z-50 bg-background p-2 rounded-md shadow-md border transition-all duration-200 hover:bg-primary/10"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
      >
        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside className={cn(
        "w-64 h-screen bg-background border-r shadow-sm text-foreground z-40 transition-all duration-300",
        isMobileMenuOpen ? "fixed inset-y-0 left-0 animate-fade-in" : "fixed -left-64 lg:left-0 lg:relative"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-5 border-b bg-primary/5 backdrop-blur-sm sticky top-0">
            <h1 className="text-xl font-bold text-primary">Admin</h1>
            <div className="text-sm text-muted-foreground mt-1 truncate flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
              {user?.email}
            </div>
          </div>

          <nav className="flex-grow overflow-y-auto py-4 scrollbar-thin">
            <ul className="space-y-1 px-2">
              {navItems.map((item) => {
                // Vérifier les permissions par rôle
                if (item.roles && user && !item.roles.includes(user.role)) {
                  return null;
                }

                // Si c'est un groupe avec des enfants
                if (item.children) {
                  const isGroupActive = item.children.some(child => isActive(child.path));
                  return (
                    <li key={item.name} className="animate-fade-in" style={{ animationDelay: '100ms' }}>
                      <button 
                        className={cn(
                          "sidebar-menu-item",
                          isGroupActive ? "active" : ""
                        )}
                        onClick={() => toggleMenu(item.group || item.name)}
                        aria-expanded={openMenus[item.group || item.name]}
                      >
                        {item.icon}
                        <span>{item.name}</span>
                        <span className="ml-auto">
                          {openMenus[item.group || item.name] ? (
                            <ChevronDown className="w-4 h-4 transition-transform" />
                          ) : (
                            <ChevronRight className="w-4 h-4 transition-transform" />
                          )}
                        </span>
                      </button>
                      {openMenus[item.group || item.name] && (
                        <ul className="mt-1 ml-5 space-y-1 border-l pl-2 animate-fade-in">
                          {item.children.map((child) => (
                            <li key={child.path}>
                              <Link
                                href={child.path}
                                className={cn(
                                  "sidebar-menu-item",
                                  isActive(child.path) ? "active" : ""
                                )}
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                {child.icon}
                                <span>{child.name}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                }

                // Élément de menu normal
                return (
                  <li key={item.path} className="animate-fade-in" style={{ animationDelay: `${navItems.indexOf(item) * 50}ms` }}>
                    <Link
                      href={item.path}
                      className={cn(
                        "sidebar-menu-item",
                        isActive(item.path) ? "active" : ""
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.icon}
                      <span className="ml-3">{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="p-4 border-t sticky bottom-0 bg-background/80 backdrop-blur-sm">
            <Button 
              variant="outline" 
              className="w-full justify-start hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-colors"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-3" />
              Déconnexion
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay pour fermer le menu sur mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 lg:hidden backdrop-blur-sm animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
} 