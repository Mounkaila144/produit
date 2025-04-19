/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // Commenté temporairement pour permettre l'accès à la page login
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    domains: ['placehold.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    // Déterminer l'URL de l'API en fonction de l'environnement
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
    
    return [
      // Blocage de la route auth/_log
      {
        source: '/api/auth/_log',
        destination: '/404',
      },
      // Redirection générale de l'API
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
      // Routes d'upload d'images
      {
        source: '/api/upload',
        destination: `${apiUrl}/api/upload`,
      },
      // Routes spécifiques pour le dashboard admin
      {
        source: '/api/admin/dashboard/:path*',
        destination: `${apiUrl}/api/admin/dashboard/:path*`,
      },
      // Routes spécifiques pour le dashboard
      {
        source: '/api/dashboard/:path*',
        destination: `${apiUrl}/api/dashboard/:path*`,
      },
      // Routes du dashboard stats
      {
        source: '/api/dashboard/stats',
        destination: `${apiUrl}/api/dashboard/stats`,
      },
      // Routes du dashboard recent activities
      {
        source: '/api/dashboard/recent-activities',
        destination: `${apiUrl}/api/dashboard/recent-activities`,
      },
      // Routes du dashboard top products
      {
        source: '/api/dashboard/top-products',
        destination: `${apiUrl}/api/dashboard/top-products`,
      },
      // Routes pour les produits et leurs actions
      {
        source: '/api/products/:id/:action',
        destination: `${apiUrl}/api/products/:id/:action`,
      },
      // Routes pour les catégories et leurs actions
      {
        source: '/api/categories/:id/:action',
        destination: `${apiUrl}/api/categories/:id/:action`,
      },
      // Route du tenant dashboard
      {
        source: '/api/tenant/dashboard',
        destination: `${apiUrl}/api/tenant/dashboard`,
      },
      // Route du tenant-admin dashboard (nouvelle route)
      {
        source: '/api/tenant-admin/dashboard',
        destination: `${apiUrl}/api/tenant/dashboard`,
      },
      // Routes spécifiques pour le tenant-admin
      {
        source: '/api/tenant-admin/:path*',
        destination: `${apiUrl}/api/tenant/:path*`,
      },
      // Redirection des images uploadées - Mise à jour pour accès public direct
      {
        source: '/uploads/:path*',
        destination: `${apiUrl}/uploads/:path*`,
      },
    ];
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
